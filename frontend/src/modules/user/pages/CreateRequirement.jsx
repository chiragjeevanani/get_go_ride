import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Check, Truck, Home, Users, AlertTriangle, 
  MapPin, Calendar, Clock, Weight, Package, FileText, Plus, Loader2, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { requirementApi, categoryApi, vehicleApi } from "@/lib/api";
import { toast } from "sonner";
import goodsImg from "@/assets/categories/Truck-removebg-preview.png";
import houseImg from "@/assets/categories/shifting.jpg";
import emergencyImg from "@/assets/categories/Emergency-removebg-preview.png";

const CreateRequirement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const totalSteps = 6;
  
  // Initialize from location state if available, otherwise default
  const initialState = location.state?.formData || {
    serviceType: "",
    vehicleType: "",
    loadType: "kg",
    loadValue: "",
    pickup: location.state?.pickup || "",
    drops: location.state?.drop ? [location.state.drop] : [""],
    date: "",
    time: "",
    notes: "",
    price: 1733,
  };
  const initialStep = location.state?.step || 1;

  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState(initialState);
  const [activeLocField, setActiveLocField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTimeString = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (val) => {
    const today = getTodayString();
    if (val && val < today) {
       toast.error("Booking date cannot be in the past.");
       updateData("date", "");
       return;
    }
    updateData("date", val);
    if (val === today && formData.time) {
       const nowTime = getCurrentTimeString();
       if (formData.time < nowTime) {
          toast.error("Booking time cannot be in the past.");
          updateData("time", "");
       }
    }
  };

  const handleTimeChange = (val) => {
    const today = getTodayString();
    if (formData.date === today && val) {
       const nowTime = getCurrentTimeString();
       if (val < nowTime) {
          toast.error("Booking time cannot be in the past.");
          updateData("time", "");
          return;
       }
    }
    updateData("time", val);
  };
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timeoutRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  useEffect(() => {
    if (!formData.serviceType) {
      setVehicles([]);
      return;
    }
    const fetchVehicles = async () => {
      setVehiclesLoading(true);
      try {
        const res = await vehicleApi.getAll(formData.serviceType);
        setVehicles(res.data || []);
      } catch (err) {
        console.error("Failed to fetch vehicles dynamically", err);
      } finally {
        setVehiclesLoading(false);
      }
    };
    fetchVehicles();
  }, [formData.serviceType]);

  useEffect(() => {
    const fetchCats = async () => {
       try {
          const res = await categoryApi.getAll();
          const cats = res?.data || [];
          setCategories(cats.map(cat => {
             let defaultImg = goodsImg;
             if (cat.slug === 'house-shifting') defaultImg = houseImg;
             if (cat.slug === 'emergency') defaultImg = emergencyImg;
             
             return {
               id: cat.slug,
               title: cat.name,
               image: cat.image || defaultImg,
               desc: cat.description || "Logistics Service"
             };
          }));
       } catch (err) {
          console.error("Failed to load categories", err);
       } finally {
          setCategoriesLoading(false);
       }
    };
    fetchCats();
  }, []);

  // Still support pre-filling from Dashboard's quick navigation
  useEffect(() => {
    if (location.state && (!location.state.formData)) {
      setFormData(prev => ({
        ...prev,
        pickup: location.state.pickup || prev.pickup,
        drops: location.state.drop ? [location.state.drop] : prev.drops
      }));
    }
  }, [location.state]);

  const searchAddress = async (query) => {
    setLocLoading(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);
      const data = await resp.json();
      setSuggestions(data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      })));
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLocLoading(false);
    }
  };

  const handleLocSearch = (field, value, index = null) => {
     if (field === 'pickup') {
       updateData('pickup', value);
       setActiveLocField({ name: 'pickup' });
     } else {
       const newDrops = [...formData.drops];
       newDrops[index] = value;
       updateData('drops', newDrops);
       setActiveLocField({ name: 'drop', index });
     }
     
     if (timeoutRef.current) clearTimeout(timeoutRef.current);
     if (value.length < 3) {
         setSuggestions([]);
         return;
     }

     timeoutRef.current = setTimeout(() => {
         searchAddress(value);
     }, 400);
  };

  const handleSelectSuggestion = (suggestion) => {
     if (activeLocField === "pickup" || activeLocField?.name === "pickup") {
         updateData("pickup", suggestion.display_name);
         setFormData(prev => ({
            ...prev,
            pickupCoords: { lat: suggestion.lat, lon: suggestion.lon }
         }));
     } else {
         const index = activeLocField?.index !== undefined ? activeLocField.index : 0;
         const newDrops = [...formData.drops];
         newDrops[index] = suggestion.display_name;
         setFormData(prev => {
            const newCoords = prev.dropsCoords ? [...prev.dropsCoords] : [];
            newCoords[index] = { lat: suggestion.lat, lon: suggestion.lon };
            return {
               ...prev,
               drops: newDrops,
               dropsCoords: newCoords
            };
         });
     }
     setSuggestions([]);
     setActiveLocField(null);
  };

  const addDrop = () => {
    updateData("drops", [...formData.drops, ""]);
  };

  const removeDrop = (index) => {
    if (formData.drops.length > 1) {
      const newDrops = formData.drops.filter((_, i) => i !== index);
      updateData("drops", newDrops);
    }
  };

  const updateData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const nextStep = () => {
      if (step === 5) {
        const today = getTodayString();
        if (!formData.date) {
           toast.error("Please select a date.");
           return;
        }
        if (formData.date < today) {
           toast.error("Booking date cannot be in the past.");
           return;
        }
        if (!formData.time) {
           toast.error("Please select a time.");
           return;
        }
        if (formData.date === today) {
           const nowTime = getCurrentTimeString();
           if (formData.time < nowTime) {
              toast.error("Booking time cannot be in the past.");
              return;
           }
        }
      }
     setStep((s) => Math.min(s + 1, totalSteps));
   };
   const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const steps = [
    { title: "Locations", description: "Where should we pick up and drop?" },
    { title: "Service Type", description: "What do you need help with?" },
    { title: "Vehicle Type", description: "Select the best vehicle for your needs" },
    { title: "Trip Details", description: "Provide more details about your request" },
    { title: "Schedule", description: "When should we start?" },
    { title: "Review", description: "Check details and confirm" },
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Card className="border-none shadow-premium rounded-[1.5rem] bg-white relative z-[50] overflow-visible">
               <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40">Route Details</h3>
                     <div className="h-px flex-1 bg-zinc-50"></div>
                  </div>
                  
                  <div className="space-y-3 relative">
                     {/* Decorative dashed line */}
                     <div className="absolute left-[9px] top-4 bottom-4 w-px border-l border-dashed border-zinc-200"></div>

                     {/* Pickup */}
                     <div className={`flex items-center gap-2.5 px-3 h-11 rounded-xl border transition-all bg-white relative z-10 ${activeLocField === 'pickup' ? 'border-primary ring-1 ring-primary/20' : 'border-zinc-100'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)] flex-shrink-0"></div>
                        <input 
                           placeholder="Enter loading point" 
                           className="flex-1 bg-transparent border-none text-[12px] font-bold text-black focus:outline-none placeholder:text-zinc-300"
                           value={formData.pickup}
                           onChange={(e) => handleLocSearch('pickup', e.target.value)}
                           onFocus={() => setActiveLocField('pickup')}
                        />
                        {locLoading && activeLocField === 'pickup' && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                     </div>

                     {/* Drops */}
                     {formData.drops.map((drop, idx) => (
                        <div key={idx} className="relative group">
                           <div className={`flex items-center gap-2.5 px-3 h-11 rounded-xl border transition-all bg-white relative z-10 ${activeLocField?.name === 'drop' && activeLocField.index === idx ? 'border-primary ring-1 ring-primary/20' : 'border-zinc-100'}`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)] flex-shrink-0"></div>
                              <input 
                                 placeholder={`Enter drop point ${idx + 1}`} 
                                 className="flex-1 bg-transparent border-none text-[12px] font-bold text-black focus:outline-none placeholder:text-zinc-300"
                                 value={drop}
                                 onChange={(e) => handleLocSearch('drop', e.target.value, idx)}
                                 onFocus={() => setActiveLocField({ name: 'drop', index: idx })}
                              />
                              {formData.drops.length > 1 && (
                                 <button onClick={() => removeDrop(idx)} className="p-1 hover:bg-red-50 rounded-lg text-red-400">
                                    <X className="w-3.5 h-3.5" />
                                 </button>
                              )}
                              {locLoading && activeLocField?.name === 'drop' && activeLocField.index === idx && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                           </div>
                        </div>
                     ))}

                     {/* Add Stop Button */}
                     {formData.drops.length < 5 && (
                        <button 
                          onClick={addDrop}
                          className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/5 rounded-lg transition-all w-fit"
                        >
                           <Plus className="w-3.5 h-3.5" /> Add another stop
                        </button>
                     )}
                  </div>

                  {/* Suggestions Dropdown */}
                  <AnimatePresence mode="wait">
                     {activeLocField && suggestions.length > 0 && (
                        <motion.div 
                           initial={{ opacity: 0, y: 5 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 5 }}
                           className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-zinc-100 overflow-hidden z-[9999] ring-1 ring-black/5"
                        >
                           {suggestions.map((item, idx) => (
                           <div 
                              key={idx}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelectSuggestion(item)}
                              className="p-4 flex items-center gap-3 border-b border-zinc-50 last:border-none hover:bg-zinc-50 transition-colors cursor-pointer group"
                           >
                              <div className="p-2 bg-zinc-100 rounded-xl group-hover:bg-primary/20 transition-colors">
                                 <MapPin className="w-4 h-4 text-zinc-500 group-hover:text-black" />
                              </div>
                              <span className="text-xs font-bold text-zinc-600 line-clamp-2 leading-relaxed">{item.display_name}</span>
                           </div>
                           ))}
                        </motion.div>
                     )}
                  </AnimatePresence>

                  <Button 
                     onClick={() => { setActiveLocField(null); nextStep(); }}
                     disabled={!formData.pickup || !formData.drops[0]}
                     className="w-full h-11 rounded-xl bg-zinc-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all mt-1"
                  >
                     Confirm Route
                  </Button>
               </CardContent>
            </Card>

            <div className="flex flex-col items-center gap-4 py-4 text-center">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-black leading-tight">Enter your route details</h3>
                  <p className="text-xs text-zinc-500 font-medium">Type to search pickup and drop points</p>
               </div>
               <img src="/delivery_boxes_isometric_1775805816799.png" alt="route" className="w-48 h-48 object-contain opacity-90 drop-shadow-2xl" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 gap-2.5">
            {categoriesLoading ? (
               <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Services...</p>
               </div>
            ) : (
               <>
               {categories.map((s) => (
                 <Card 
                   key={s.id} 
                   className={cn(
                     "cursor-pointer border-2 transition-all rounded-xl",
                     formData.serviceType === s.id ? "border-primary bg-primary/5 shadow-sm" : "border-zinc-50"
                   )}
                   onClick={() => { updateData("serviceType", s.id); updateData("vehicleType", ""); }}
                 >
                   <CardContent className="p-2.5 flex items-center gap-3">
                     <div className={cn("w-10 h-10 rounded-lg overflow-hidden shrink-0", formData.serviceType === s.id ? "bg-primary/20" : "bg-zinc-50")}>
                       <img 
                         src={s.image} 
                         alt={s.title} 
                         className="w-full h-full object-contain p-1"
                       />
                     </div>
                     <div className="flex flex-col">
                       <span className="text-xs font-black text-black">{s.title}</span>
                       <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{s.desc}</span>
                     </div>
                     {formData.serviceType === s.id && <Check className="ml-auto w-4 h-4 text-primary" />}
                   </CardContent>
                 </Card>
               ))}
               </>
            )}
          </div>
        );
      case 3: {
        if (vehiclesLoading) {
          return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
               <Loader2 className="w-8 h-8 text-primary animate-spin" />
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Fleet Options...</span>
            </div>
          );
        }

        if (vehicles.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
               <AlertTriangle className="w-8 h-8 text-amber-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No vehicles available for this category.</span>
            </div>
          );
        }

        let fallbackImg = goodsImg;
        if (formData.serviceType === "house-shifting" || formData.serviceType === "house") fallbackImg = houseImg;
        if (formData.serviceType === "emergency") fallbackImg = emergencyImg;

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40">Vehicle Options</h3>
               <div className="h-px flex-1 bg-zinc-50"></div>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {vehicles.map((v) => {
                const vehicleId = v._id || v.id;
                return (
                  <Card 
                    key={vehicleId} 
                    className={cn(
                      "cursor-pointer border-2 transition-all relative overflow-hidden rounded-xl",
                      formData.vehicleType === vehicleId ? "border-primary bg-primary/5 shadow-sm" : "border-zinc-50"
                    )}
                    onClick={() => updateData("vehicleType", vehicleId)}
                  >
                    {v.isMostBooked && (
                       <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-br-lg shadow-sm z-20 tracking-widest">
                          Best Option
                       </div>
                    )}
                    <CardContent className="p-3 flex items-center gap-4">
                      <div className={cn(
                          "w-12 h-12 rounded-lg overflow-hidden transition-all shrink-0",
                          formData.vehicleType === vehicleId ? "bg-primary shadow-inner rotate-3 scale-110" : "bg-zinc-50"
                      )}>
                        <img 
                          src={v.image || fallbackImg} 
                          alt={v.name} 
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-black text-xs leading-none">{v.name}</span>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {v.capacity && (
                             <span className="text-[8px] bg-zinc-100 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                {v.capacity}
                             </span>
                          )}
                          {v.details && (
                             <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-black uppercase tracking-wider border border-primary/10">
                                {v.details}
                             </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      }
      case 4: {
        if (formData.serviceType === "house") {
          const houseSizes = [
            { id: "1bhk", title: "1 BHK", desc: "Small house / Flat", icon: Home },
            { id: "2bhk", title: "2 BHK", desc: "Standard apartment", icon: Home },
            { id: "3bhk", title: "3 BHK", desc: "Large family home", icon: Home },
            { id: "villa", title: "Villa", desc: "Independent house", icon: Home },
          ];
          return (
            <div className="space-y-4">
               <div className="flex items-center gap-2 px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40">Home Size</h3>
                  <div className="h-px flex-1 bg-zinc-50"></div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  {houseSizes.map((size) => (
                    <Card 
                      key={size.id}
                      onClick={() => updateData("houseSize", size.id)}
                      className={cn(
                        "cursor-pointer border-2 transition-all rounded-2xl overflow-hidden",
                        formData.houseSize === size.id ? "border-primary bg-primary/5 shadow-md" : "border-zinc-50 bg-white"
                      )}
                    >
                       <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                          <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                             formData.houseSize === size.id ? "bg-primary text-black" : "bg-zinc-50 text-zinc-400"
                          )}>
                             <size.icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                             <h4 className="text-sm font-black text-black">{size.title}</h4>
                             <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">{size.desc}</p>
                          </div>
                       </CardContent>
                    </Card>
                  ))}
               </div>
               
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Additional Items</label>
                  <textarea 
                    placeholder="List specific items like Fridge, Sofa, etc." 
                    className="w-full min-h-[80px] p-3 rounded-xl border border-input bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.loadValue}
                    onChange={(e) => updateData("loadValue", e.target.value)}
                  ></textarea>
               </div>
            </div>
          );
        }


        
        if (formData.serviceType === "emergency") {
           return (
             <div className="space-y-4">
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                   <div className="p-1.5 bg-red-500 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 text-white" />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-[9px] font-black text-red-900 uppercase tracking-wider mb-0.5">Alert Details</h4>
                      <p className="text-[8px] text-red-600 font-bold leading-tight uppercase">Emergency situation info</p>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Situation</label>
                   <textarea 
                      placeholder="e.g. Critical patient, road accident..." 
                      className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                      value={formData.loadValue}
                      onChange={(e) => updateData("loadValue", e.target.value)}
                   ></textarea>
                </div>
             </div>
           );
        }

        if (formData.serviceType === "construction") {
          return (
            <div className="space-y-4">
              <div className="space-y-3">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Item Details</label>
                    <div className="relative">
                      <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input 
                        placeholder="What are you moving?" 
                        className="pl-10 bg-white h-11 text-xs font-bold"
                        value={formData.items || ""}
                        onChange={(e) => updateData("items", e.target.value)}
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Weight</label>
                      <div className="flex bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100">
                        <input 
                          type="number"
                          placeholder="0"
                          className="w-full bg-transparent px-3 py-2 text-xs font-black text-black outline-none"
                          value={formData.loadValue}
                          onChange={(e) => updateData("loadValue", e.target.value)}
                        />
                        <select 
                          className="bg-zinc-100 px-2 text-[8px] font-black uppercase text-zinc-500 outline-none border-l border-zinc-200"
                          value={formData.loadType}
                          onChange={(e) => updateData("loadType", e.target.value)}
                        >
                          <option value="kg">kg</option>
                          <option value="ton">ton</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Estimate Price</label>
                      <div className="flex items-center bg-zinc-50 rounded-xl px-3 py-2 border border-zinc-100">
                        <span className="text-[10px] font-black text-primary mr-1">₹</span>
                        <input 
                          type="number"
                          className="w-full bg-transparent text-xs font-black text-black outline-none"
                          value={formData.price}
                          onChange={(e) => updateData("price", e.target.value)}
                        />
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-5">
            <div className="flex p-0.5 bg-zinc-50 rounded-xl border border-zinc-100">
              <button 
                className={cn("flex-1 py-2 px-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", formData.loadType === "kg" ? "bg-white text-black shadow-sm" : "text-zinc-400")}
                onClick={() => updateData("loadType", "kg")}
              >
                Weight (KG)
              </button>
              <button 
                className={cn("flex-1 py-2 px-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", formData.loadType === "items" ? "bg-white text-black shadow-sm" : "text-zinc-400")}
                onClick={() => updateData("loadType", "items")}
              >
                Total Items
              </button>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Enter {formData.loadType === "kg" ? "Weight" : "Count"}</label>
              <div className="relative">
                <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  type="number" 
                  min="0"
                  placeholder={formData.loadType === "kg" ? "e.g. 500" : "count"} 
                  className="pl-10 bg-white h-11 text-xs font-bold"
                  value={formData.loadValue}
                  onChange={(e) => updateData("loadValue", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      }
      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  type="date" 
                  className="pl-10 bg-white h-11 text-xs font-bold"
                  value={formData.date}
                  min={getTodayString()}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Time</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  type="time" 
                  className="pl-10 bg-white h-11 text-xs font-bold"
                  value={formData.time}
                  min={formData.date === getTodayString() ? getCurrentTimeString() : undefined}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Special Notes</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <textarea 
                  placeholder="Additional requirements..." 
                  className="w-full min-h-[80px] pl-10 pt-2.5 rounded-xl border border-input bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.notes}
                  onChange={(e) => updateData("notes", e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Price Selection Card */}
            <Card className="border-none shadow-premium rounded-[1.5rem] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
               <CardContent className="p-5 flex flex-col items-center gap-4">
                  <div className="text-center space-y-1 w-full">
                     <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">Your price</h3>
                     <div className="flex items-center justify-center gap-1 w-full overflow-hidden">
                        <span className="text-xl font-black text-black">₹</span>
                        <input 
                           type="number" 
                           value={formData.price}
                           onChange={(e) => updateData("price", Number(e.target.value))}
                           className="text-3xl font-black w-32 border-none bg-transparent focus:outline-none focus:ring-0 text-center text-black selection:bg-primary/20"
                           style={{ fontVariantNumeric: "tabular-nums" }}
                        />
                     </div>
                     <div className="h-1 w-16 bg-primary/20 mx-auto rounded-full mt-1 relative overflow-hidden">
                        <motion.div 
                           className="absolute inset-0 bg-primary"
                           initial={{ x: "-100%" }}
                           animate={{ x: "0%" }}
                           transition={{ duration: 1, delay: 0.5 }}
                        />
                     </div>
                  </div>

                  {/* Coin Discount Badge */}
                  <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ type: "spring", damping: 15, delay: 0.2 }}
                     className="w-full bg-primary/10 border border-primary/20 rounded-xl py-2 px-3 flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                     <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm relative z-10">
                        <span className="text-[8px] font-black">₹</span>
                     </div>
                     <span className="text-[10px] font-bold text-black tracking-tight relative z-10">
                        Coin Discount: <span className="line-through text-zinc-400">₹{formData.price || 1733}</span>
                        <span className="ml-1 text-black font-black">₹{Math.round((formData.price || 1733) * 0.96)}</span>
                     </span>
                  </motion.div>

                  {/* Fair Price Meter */}
                  <div className="w-full bg-zinc-50 rounded-xl p-3 flex items-center justify-between gap-3 border border-zinc-100">
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-400">Pricing Policy</span>
                        <p className="text-[10px] font-bold text-black leading-tight">Fastest match price</p>
                     </div>
                     <div className="relative pt-1 scale-75 origin-right">
                        <svg width="80" height="50" viewBox="0 0 100 60">
                           <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#f1f1f1" strokeWidth="8" strokeLinecap="round" />
                           <path d="M10,50 A40,40 0 0,1 40,15" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                           <path d="M40,15 A40,40 0 0,1 60,15" fill="none" stroke="#facc15" strokeWidth="8" strokeLinecap="round" />
                           <path d="M60,15 A40,40 0 0,1 90,50" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
                           <motion.line 
                               initial={{ rotate: -90, originX: "50px", originY: "50px" }}
                               animate={{ rotate: 15, originX: "50px", originY: "50px" }}
                               x1="50" y1="50" x2="65" y2="25" 
                               stroke="black" strokeWidth="3" strokeLinecap="round" 
                           />
                           <circle cx="50" cy="50" r="3" fill="black" />
                        </svg>
                     </div>
                  </div>

                  {/* Advance Card */}
                  <div className="w-full border border-zinc-100 rounded-xl p-3 flex flex-col gap-2 bg-white/50">
                     <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-black">50% Advance</span>
                        <span className="text-sm font-black text-black tabular-nums">₹{Math.round((formData.price || 1733) * 0.5)}</span>
                     </div>
                     <div className="h-px bg-zinc-50"></div>
                     <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                         <span>Terms Applied</span>
                         <ChevronRight className="w-3 h-3" />
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-2 px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Requirement Summary</h3>
                  <div className="h-px flex-1 bg-zinc-50"></div>
               </div>
               
               <div className="grid grid-cols-2 gap-2 pb-6">
                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100/50 flex flex-col justify-between">
                     <div>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Vehicle</p>
                        <p className="text-[11px] font-bold text-black leading-tight">
                            {(() => {
                               const selectedVehicle = vehicles.find(v => (v._id || v.id) === formData.vehicleType);
                               return selectedVehicle ? selectedVehicle.name : (formData.vehicleType || "Selected");
                            })()}
                        </p>
                     </div>
                     {(() => {
                        const selectedVehicle = vehicles.find(v => (v._id || v.id) === formData.vehicleType);
                        if (selectedVehicle) {
                           return (
                              <p className="text-[8px] text-zinc-400 font-black uppercase tracking-wider mt-1.5">
                                 {selectedVehicle.capacity} • {selectedVehicle.details}
                              </p>
                           );
                        }
                        return null;
                     })()}
                  </div>
                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100/50">
                     <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Service</p>
                     <p className="text-[11px] font-bold text-black">{formData.serviceType || "Goods"}</p>
                  </div>
               </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const selectedVehicle = vehicles.find(v => (v._id || v.id) === formData.vehicleType);
      const vehicleName = selectedVehicle ? selectedVehicle.name : formData.vehicleType;

      // Prepare data for backend
      const payload = {
        serviceType: formData.serviceType,
        vehicleType: vehicleName,
        pickup: { 
          address: formData.pickup,
          lat: formData.pickupCoords?.lat || null,
          lon: formData.pickupCoords?.lon || null
        },
        drops: formData.drops.map((addr, idx) => ({ 
          address: addr,
          lat: formData.dropsCoords?.[idx]?.lat || null,
          lon: formData.dropsCoords?.[idx]?.lon || null
        })),
        items: (formData.serviceType === 'house' || formData.serviceType === 'house-shifting') 
          ? `House Shifting (${formData.houseSize || 'N/A'})` 
          : (formData.serviceType === 'emergency')
            ? 'Emergency Assistance' 
            : (formData.serviceType === 'construction')
              ? (formData.items || 'Construction Material')
              : (formData.items || 'General Goods'),
        weight: formData.loadValue ? `${formData.loadValue}${formData.loadType === 'kg' ? 'kg' : ''}` : '',
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        price: formData.price || 1733
      };

      await requirementApi.create(payload);
      toast.success("Requirement posted successfully!");
      navigate("/user/requests");
    } catch (err) {
      toast.error(err.message || "Failed to post requirement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      <header className="flex items-center gap-3 py-2 border-b-2 border-primary/20 -mx-4 px-4 sticky top-0 bg-white/80 backdrop-blur-lg z-[200]">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 rounded-full bg-white shadow-sm border border-zinc-100"
          onClick={() => step === 1 ? navigate(-1) : prevStep()}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-black leading-tight">{steps[step-1].title}</h1>
          <p className="text-[10px] text-zinc-500 font-medium">{steps[step-1].description}</p>
        </div>
      </header>

      <div className="space-y-1">
        <div className="flex justify-between text-[9px] uppercase font-black text-zinc-400 tracking-tighter px-1">
          <span>Progress</span>
          <span>Step {step} of {totalSteps}</span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-1" />
      </div>

      <div className="min-h-[400px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {step < totalSteps && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-lg border-t border-zinc-100 flex items-center justify-between safe-area-bottom z-50 max-w-md mx-auto">
          <Button 
             variant="ghost" 
             onClick={prevStep} 
             disabled={step === 1}
             className="text-zinc-500 font-bold text-xs"
          >
            Back
          </Button>
          <Button 
            className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest"
            onClick={nextStep}
            disabled={
              (step === 1 && (!formData.pickup || !formData.drops[0])) ||
              (step === 2 && !formData.serviceType) ||
              (step === 3 && !formData.vehicleType)
            }
          >
            <span>Continue</span>
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}

      {step === totalSteps && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-zinc-100 safe-area-bottom z-50 max-w-md mx-auto">
          <Button 
            className="w-full rounded-xl h-11 shadow-lg shadow-primary/20 font-black text-sm uppercase tracking-widest"
            onClick={handleFinalSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : "Post Requirements"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateRequirement;
