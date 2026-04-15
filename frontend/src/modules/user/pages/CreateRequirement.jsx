import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Check, Truck, Home, Users, AlertTriangle, 
  MapPin, Calendar, Clock, Weight, Package, FileText, Plus, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import goodsImg from "@/assets/categories/Truck-removebg-preview.png";
import houseImg from "@/assets/categories/shifting.jpg";
import passengerImg from "@/assets/categories/passenger-removebg-preview.png";
import emergencyImg from "@/assets/categories/Emergency-removebg-preview.png";
import bikeImg from "@/assets/categories/Bike-removebg-preview.png";
import autoImg from "@/assets/categories/auto-removebg-preview.png";
import cabImg from "@/assets/categories/cab-removebg-preview.png";

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
  };
  const initialStep = location.state?.step || 1;

  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState(initialState);
  const [activeLocField, setActiveLocField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [locLoading, setLocLoading] = useState(false);
  const timeoutRef = useRef(null);

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

  const handleLocSearch = (field, value) => {
     if (field === 'pickup') updateData('pickup', value);
     else updateData('drops', [value]); // Simplifying for now to single drop
     
     setActiveLocField(field);

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
     if (activeLocField === "pickup") {
         updateData("pickup", suggestion.display_name);
     } else {
         updateData("drops", [suggestion.display_name]);
     }
     setSuggestions([]);
     setActiveLocField(null);
  };

  const updateData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openPicker = (type, index = null) => {
    navigate("/user/search-location", { 
        state: { 
            type, 
            index, 
            formData, 
            step 
        } 
    });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
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
            <Card className="border-none shadow-premium rounded-[1.5rem] bg-white overflow-hidden relative z-[100]">
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

                     {/* Drop */}
                     <div className={`flex items-center gap-2.5 px-3 h-11 rounded-xl border transition-all bg-white relative z-10 ${activeLocField === 'drop' ? 'border-primary ring-1 ring-primary/20' : 'border-zinc-100'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)] flex-shrink-0"></div>
                        <input 
                           placeholder="Enter unloading point" 
                           className="flex-1 bg-transparent border-none text-[12px] font-bold text-black focus:outline-none placeholder:text-zinc-300"
                           value={formData.drops[0]}
                           onChange={(e) => handleLocSearch('drop', e.target.value)}
                           onFocus={() => setActiveLocField('drop')}
                        />
                        {locLoading && activeLocField === 'drop' && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                     </div>
                  </div>

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                     {activeLocField && suggestions.length > 0 && (
                        <motion.div 
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="absolute top-[85%] left-4 right-4 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-[110]"
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
        const services = [
          { id: "goods", title: "Goods Transport", image: goodsImg, desc: "Commercial or bulk items" },
          { id: "house", title: "House Shifting", image: houseImg, desc: "Furniture & household items" },
          { id: "passenger", title: "Passenger", image: passengerImg, desc: "Taxis, Rickshaws, Buses" },
          { id: "emergency", title: "Emergency", image: emergencyImg, desc: "Instant response services" },
          { id: "construction", title: "Construction", image: goodsImg, desc: "Building & heavy material" },
        ];
        return (
          <div className="grid grid-cols-1 gap-2.5">
            {services.map((s) => (
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
          </div>
        );
      case 3:
        const vehicleOptions = {
          goods: [
            { id: "mini", title: "2.5 Tonnes - 8 ft", details: "LCV • 4 Tyres • Open Body", image: goodsImg, mostBooked: true },
            { id: "tempo", title: "3 Tonnes - 10 ft", details: "LCV • 4 Tyres • Open Body", image: goodsImg },
            { id: "eicher", title: "5 Tonnes - 14 ft", details: "ICV • 6 Tyres • Closed Container", image: goodsImg },
            { id: "trailer", title: "7 Tonnes - 17 ft", details: "HCV • 6 Tyres • High Deck", image: goodsImg },
          ],
          house: [
            { id: "ace", title: "Tata Ace - 7 ft", details: "4 Tyres • Small Furniture", image: goodsImg, mostBooked: true },
            { id: "pickup", title: "Bolero Pickup", details: "4 Tyres • Medium Load", image: goodsImg },
            { id: "14ft", title: "Eicher 14ft", details: "6 Tyres • Household Bulky", image: goodsImg },
          ],
          passenger: [
            { id: "bike", title: "Bike / Scooter", details: "1 Seat • Single Parcel", image: bikeImg, mostBooked: true },
            { id: "auto", title: "Rickshaw / Auto", details: "3 Seats • City Travel", image: autoImg },
            { id: "mini", title: "Mini Sedan", details: "4 Seats • AC Comfort", image: cabImg },
            { id: "bus", title: "Minibus / Tempo", details: "12-24 Seats • Group Tour", image: passengerImg },
          ],
          emergency: [
            { id: "basic", title: "Basic Ambulance", details: "First Aid • Oxygen Support", image: emergencyImg, mostBooked: true },
            { id: "icu", title: "ICU Ventilator", details: "Critical Care • Life Support", image: emergencyImg },
            { id: "tow", title: "Towing Truck", details: "24/7 Roadside Recovery", image: goodsImg },
          ],
          construction: [
            { id: "tipper", title: "Tipper Truck", details: "6 Tyres • Sand/Brick", image: goodsImg, mostBooked: true },
            { id: "jcb", title: "JCB / Loader", details: "Heavy Excavator", image: goodsImg },
            { id: "crane", title: "Mobile Crane", details: "Lifting 10T+", image: goodsImg },
          ]
        };
        const currentOptions = vehicleOptions[formData.serviceType] || vehicleOptions.goods;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40">Vehicle Options</h3>
               <div className="h-px flex-1 bg-zinc-50"></div>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {currentOptions.map((v) => (
                <Card 
                  key={v.id} 
                  className={cn(
                    "cursor-pointer border-2 transition-all relative overflow-hidden rounded-xl",
                    formData.vehicleType === v.id ? "border-primary bg-primary/5 shadow-sm" : "border-zinc-50"
                  )}
                  onClick={() => updateData("vehicleType", v.id)}
                >
                  {v.mostBooked && (
                     <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-br-lg shadow-sm z-20 tracking-widest">
                        Best Option
                     </div>
                  )}
                  <CardContent className="p-3 flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-lg overflow-hidden transition-all shrink-0",
                        formData.vehicleType === v.id ? "bg-primary shadow-inner rotate-3 scale-110" : "bg-zinc-50"
                    )}>
                      <img 
                        src={v.image} 
                        alt={v.title} 
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-black text-xs">{v.title}</span>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">{v.details}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 4:
        if (formData.serviceType === "passenger") {
           return (
             <div className="space-y-5">
               <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Passengers</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input 
                        type="number" 
                        placeholder="e.g. 3" 
                        className="pl-10 bg-white h-11 text-xs font-bold"
                        value={formData.loadValue}
                        onChange={(e) => updateData("loadValue", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Luggage (KG)</label>
                    <div className="relative">
                      <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input 
                        type="number" 
                        placeholder="e.g. 10" 
                        className="pl-10 bg-white h-11 text-xs font-bold"
                        value={formData.luggageWeight || ""}
                        onChange={(e) => updateData("luggageWeight", e.target.value)}
                      />
                    </div>
                  </div>
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
                   <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Material</label>
                   <Input 
                     placeholder="e.g. Cement, Sand" 
                     className="bg-white h-11 font-bold text-xs"
                     value={formData.materialType || ""}
                     onChange={(e) => updateData("materialType", e.target.value)}
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Quantity</label>
                   <div className="relative">
                     <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                     <Input 
                       placeholder="e.g. 5 Tonnes" 
                       className="pl-10 bg-white h-11 text-xs font-bold"
                       value={formData.loadValue}
                       onChange={(e) => updateData("loadValue", e.target.value)}
                     />
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
                  placeholder={formData.loadType === "kg" ? "e.g. 500" : "count"} 
                  className="pl-10 bg-white h-11 text-xs font-bold"
                  value={formData.loadValue}
                  onChange={(e) => updateData("loadValue", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
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
                  onChange={(e) => updateData("date", e.target.value)}
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
                  onChange={(e) => updateData("time", e.target.value)}
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
                           defaultValue="1733"
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
                        Coin Discount: <span className="line-through text-zinc-400">₹1,733</span>
                        <span className="ml-1 text-black font-black">₹1,664</span>
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
                        <span className="text-sm font-black text-black tabular-nums">₹866</span>
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
                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100/50">
                     <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Vehicle</p>
                     <p className="text-[11px] font-bold text-black">{formData.vehicleType || "Selected"}</p>
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

  const handleFinalSubmit = () => {
    // Generate a new request object from form data
    const newRequest = {
      id: `REQ-${Math.floor(Math.random() * 900) + 200}`,
      service: `${formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)} - ${formData.vehicleType || 'Any'}`,
      pickup: formData.pickup || "Current Location",
      dropoff: formData.drops[0] || "Destination",
      date: formData.date ? new Date(formData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : "Today",
      status: "Responding",
      responses: 0,
      isNew: true,
      price: "₹1,733"
    };

    // Save to localStorage to simulate a database for the prototype
    const existing = JSON.parse(localStorage.getItem("user_requests") || "[]");
    localStorage.setItem("user_requests", JSON.stringify([newRequest, ...existing]));

    // Navigate to requests tracking
    navigate("/user/requests");
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

      <div className="min-h-[400px]">
        <AnimatePresence>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
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
          >
            Post Requirements
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateRequirement;
