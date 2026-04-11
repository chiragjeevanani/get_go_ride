import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Check, Truck, Home, Users, AlertTriangle, 
  MapPin, Calendar, Clock, Weight, Package, FileText, Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const CreateRequirement = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [formData, setFormData] = useState({
    serviceType: "",
    vehicleType: "",
    loadType: "kg",
    loadValue: "",
    pickup: "",
    drops: [""],
    date: "",
    time: "",
    notes: "",
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const updateData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { title: "Service Type", description: "What do you need help with?" },
    { title: "Locations", description: "Where should we pick up and drop?" },
    { title: "Vehicle Type", description: "Select the best vehicle for your needs" },
    { title: "Trip Details", description: "Provide more details about your request" },
    { title: "Schedule", description: "When should we start?" },
    { title: "Review", description: "Check details and confirm" },
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        const services = [
          { id: "goods", title: "Goods Transport", icon: <Truck />, desc: "Commercial or bulk items" },
          { id: "house", title: "House Shifting", icon: <Home />, desc: "Furniture & household items" },
          { id: "passenger", title: "Passenger", icon: <Users />, desc: "Taxis, Rickshaws, Buses" },
          { id: "emergency", title: "Emergency", icon: <AlertTriangle />, desc: "Instant response services" },
          { id: "construction", title: "Construction", icon: <Package />, desc: "Building & heavy material" },
        ];
        return (
          <div className="grid grid-cols-1 gap-4">
            {services.map((s) => (
              <Card 
                key={s.id} 
                className={cn(
                  "cursor-pointer border-2 transition-all",
                  formData.serviceType === s.id ? "border-primary bg-primary/5 shadow-md" : "border-zinc-100 hover:border-zinc-200"
                )}
                onClick={() => { updateData("serviceType", s.id); updateData("vehicleType", ""); }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl", formData.serviceType === s.id ? "bg-primary text-black" : "bg-zinc-100 text-zinc-500")}>
                    {s.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-black">{s.title}</span>
                    <span className="text-xs text-zinc-500">{s.desc}</span>
                  </div>
                  {formData.serviceType === s.id && <Check className="ml-auto w-5 h-5 text-primary" />}
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <Card className="border-none shadow-premium rounded-[2.5rem] bg-white overflow-hidden">
               <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-2">
                     <h3 className="text-sm font-black uppercase tracking-widest text-black">Route Details</h3>
                     <div className="h-px flex-1 bg-zinc-100"></div>
                  </div>
                  
                  <div className="space-y-6 relative">
                     <div className="absolute left-[11px] top-6 bottom-6 w-px bg-zinc-100 border-l border-dashed border-zinc-300"></div>

                     {/* Pickup */}
                     <div className="space-y-1 relative pl-8">
                        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        </div>
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Pickup Point</label>
                        <Input 
                           placeholder="Enter pickup address" 
                           className="bg-transparent border-none p-0 h-8 font-bold text-black focus-visible:ring-0 placeholder:text-zinc-300"
                           value={formData.pickup}
                           onChange={(e) => updateData("pickup", e.target.value)}
                        />
                     </div>

                     {/* Dynamic Drops */}
                     {formData.drops.map((drop, index) => (
                        <div key={index} className="space-y-1 relative pl-8">
                           <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                           </div>
                           <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                              {formData.drops.length > 1 ? `Drop Location ${index + 1}` : "Drop Location"}
                           </label>
                           <Input 
                              placeholder="Enter destination address" 
                              className="bg-transparent border-none p-0 h-8 font-bold text-black focus-visible:ring-0 placeholder:text-zinc-300"
                              value={drop}
                              onChange={(e) => {
                                 const newDrops = [...formData.drops];
                                 newDrops[index] = e.target.value;
                                 updateData("drops", newDrops);
                              }}
                           />
                        </div>
                     ))}
                  </div>

                  <Button 
                     variant="ghost" 
                     onClick={() => updateData("drops", [...formData.drops, ""])}
                     className="w-full h-12 rounded-2xl border-none bg-primary/10 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all"
                  >
                     <Plus className="w-4 h-4 mr-2" />
                     Add Stop
                  </Button>
               </CardContent>
            </Card>

            <div className="flex flex-col items-center gap-4 py-4 text-center">
               <div className="space-y-1">
                  {(() => {
                     const copy = {
                        goods: { h: "To start booking lorry,\nenter load details", p: "Select material and calculate weight" },
                        house: { h: "To start shifting,\nenter house details", p: "Perfect for 1RK, 2BHK and more" },
                        passenger: { h: "To find the best ride,\nenter trip details", p: "Specify passenger count and luggage" },
                        emergency: { h: "For instant help,\nprovide details", p: "Quick response within minutes" },
                        construction: { h: "For heavy machinery,\nenter project details", p: "Cranes, JCBs and dumpers available" }
                     };
                     const s = copy[formData.serviceType] || copy.goods;
                     return (
                        <>
                           <h3 className="text-xl font-black text-black leading-tight whitespace-pre-line">{s.h}</h3>
                           <p className="text-xs text-zinc-500 font-medium">{s.p}</p>
                        </>
                     );
                  })()}
               </div>
               {(() => {
                  const images = {
                     goods: "/delivery_boxes_isometric_1775805816799.png",
                     house: "/house_shifting_isometric_1775819743510.png",
                     passenger: "/premium_car_isometric_1775819716339.png",
                     emergency: "/ambulance_isometric_1775819768064.png",
                     construction: "/construction_crane_isometric_1775819812164.png"
                  };
                  return (
                     <img 
                        src={images[formData.serviceType] || images.goods} 
                        alt="service illustration" 
                        className="w-48 h-48 object-contain opacity-90 drop-shadow-2xl animate-in zoom-in duration-500" 
                     />
                  );
               })()}
            </div>
          </div>
        );
      case 3:
        const vehicleOptions = {
          goods: [
            { id: "mini", title: "2.5 Tonnes - 8 ft", details: "LCV • 4 Tyres • Open Body", icon: "🚛", mostBooked: true },
            { id: "tempo", title: "3 Tonnes - 10 ft", details: "LCV • 4 Tyres • Open Body", icon: "🚚" },
            { id: "eicher", title: "5 Tonnes - 14 ft", details: "ICV • 6 Tyres • Closed Container", icon: "🚛" },
            { id: "trailer", title: "7 Tonnes - 17 ft", details: "HCV • 6 Tyres • High Deck", icon: "🚛" },
          ],
          house: [
            { id: "ace", title: "Tata Ace - 7 ft", details: "4 Tyres • Small Furniture", icon: "🚛", mostBooked: true },
            { id: "pickup", title: "Bolero Pickup", details: "4 Tyres • Medium Load", icon: "🚚" },
            { id: "14ft", title: "Eicher 14ft", details: "6 Tyres • Household Bulky", icon: "🚛" },
          ],
          construction: [
            { id: "tipper", title: "Tipper Truck", details: "6 Tyres • Sand/Brick", icon: "🚛", mostBooked: true },
            { id: "jcb", title: "JCB / Loader", details: "Heavy Excavator", icon: "🚜" },
            { id: "crane", title: "Mobile Crane", details: "Lifting 10T+", icon: "🏗️" },
          ]
        };
        const currentOptions = vehicleOptions[formData.serviceType] || vehicleOptions.goods;
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
               <h3 className="text-sm font-black uppercase tracking-widest text-black">Recommended Vehicles</h3>
               <div className="h-px flex-1 bg-zinc-100"></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {currentOptions.map((v) => (
                <Card 
                  key={v.id} 
                  className={cn(
                    "cursor-pointer border-2 transition-all relative overflow-hidden rounded-[2rem]",
                    formData.vehicleType === v.id ? "border-primary bg-primary/5 shadow-premium" : "border-zinc-100"
                  )}
                  onClick={() => updateData("vehicleType", v.id)}
                >
                  {v.mostBooked && (
                     <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[8px] font-black uppercase px-3 py-1 rounded-br-2xl shadow-sm z-20 tracking-widest">
                        Most Booked
                     </div>
                  )}
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className={cn(
                        "text-3xl p-4 rounded-[1.5rem] transition-all",
                        formData.vehicleType === v.id ? "bg-primary shadow-inner rotate-3" : "bg-zinc-50"
                    )}>{v.icon}</div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-black text-base">{v.title}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{v.details}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex p-1 bg-zinc-100 rounded-2xl">
              <button 
                className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", formData.loadType === "kg" ? "bg-primary text-black shadow-sm" : "text-zinc-500")}
                onClick={() => updateData("loadType", "kg")}
              >
                Weight (KG)
              </button>
              <button 
                className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", formData.loadType === "items" ? "bg-primary text-black shadow-sm" : "text-zinc-500")}
                onClick={() => updateData("loadType", "items")}
              >
                Items count
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Enter {formData.loadType === "kg" ? "Weight" : "Total Items"}</label>
              <div className="relative">
                <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input 
                  type="number" 
                  placeholder={formData.loadType === "kg" ? "e.g. 500" : "e.g. 10"} 
                  className="pl-12 bg-white h-14"
                  value={formData.loadValue}
                  onChange={(e) => updateData("loadValue", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Pickup Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input 
                  type="date" 
                  className="pl-12 bg-white"
                  value={formData.date}
                  onChange={(e) => updateData("date", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Time Slot</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input 
                  type="time" 
                  className="pl-12 bg-white"
                  value={formData.time}
                  onChange={(e) => updateData("time", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Additional Notes</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
                <textarea 
                  placeholder="Fragile items, need labor help, etc." 
                  className="w-full min-h-[100px] pl-12 pt-4 rounded-2xl border border-input bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.notes}
                  onChange={(e) => updateData("notes", e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Price Selection Card */}
            <Card className="border-none shadow-premium rounded-[2.5rem] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
               <CardContent className="p-8 flex flex-col items-center gap-6">
                  <div className="text-center space-y-2 w-full">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Enter your price</h3>
                     <div className="flex items-center justify-center gap-1 w-full overflow-hidden">
                        <span className="text-3xl font-black text-black mt-1">₹</span>
                        <input 
                           type="number" 
                           defaultValue="1733"
                           className="text-5xl font-black w-48 border-none bg-transparent focus:outline-none focus:ring-0 text-center text-black selection:bg-primary/20"
                           style={{ fontVariantNumeric: "tabular-nums" }}
                        />
                     </div>
                     <div className="h-1 w-24 bg-primary/20 mx-auto rounded-full mt-2 relative overflow-hidden">
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
                     className="w-full bg-primary/10 border border-primary/20 rounded-full py-2.5 px-4 flex items-center justify-center gap-2 relative overflow-hidden group cursor-pointer"
                  >
                     <motion.div 
                        animate={{ 
                           opacity: [0.3, 0.6, 0.3],
                           scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/5"
                     />
                     <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm relative z-10">
                        <span className="text-[10px] font-black">₹</span>
                     </div>
                     <span className="text-xs font-bold text-black tracking-tight relative z-10">
                        After coin discount: <span className="line-through text-zinc-400">₹1,733</span>
                        <span className="ml-1 text-black font-black">₹1,664</span>
                     </span>
                  </motion.div>

                  {/* Fair Price Meter */}
                  <div className="w-full bg-zinc-50 rounded-[2rem] p-5 flex items-center justify-between gap-4 border border-zinc-100">
                     <div className="flex flex-col gap-1 max-w-[120px]">
                        <div className="flex items-center gap-2 text-zinc-400">
                           <Clock className="w-4 h-4" />
                           <span className="text-[9px] font-black uppercase tracking-widest leading-none">Pricing Policy</span>
                        </div>
                        <p className="text-[11px] font-bold text-black leading-tight">We will find a vehicle at this price</p>
                     </div>
                     
                     <div className="relative flex flex-col items-center pt-2">
                        <svg width="100" height="60" viewBox="0 0 100 60">
                           <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#f1f1f1" strokeWidth="8" strokeLinecap="round" />
                           <path d="M10,50 A40,40 0 0,1 40,15" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                           <path d="M40,15 A40,40 0 0,1 60,15" fill="none" stroke="#facc15" strokeWidth="8" strokeLinecap="round" />
                           <path d="M60,15 A40,40 0 0,1 90,50" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
                           {/* Needle */}
                           <motion.line 
                              initial={{ rotate: -90, originX: "50px", originY: "50px" }}
                              animate={{ rotate: 15, originX: "50px", originY: "50px" }}
                              transition={{ type: "spring", stiffness: 100, delay: 0.8 }}
                              x1="50" y1="50" x2="65" y2="25" 
                              stroke="black" strokeWidth="3" strokeLinecap="round" 
                           />
                           <circle cx="50" cy="50" r="3" fill="black" />
                        </svg>
                        <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-zinc-400">Fair Price</span>
                     </div>
                  </div>

                  {/* Advance Card */}
                  <div className="w-full border border-zinc-100 rounded-[2rem] p-5 flex flex-col gap-4 bg-white/50 backdrop-blur-sm">
                     <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                           <span className="text-xs font-black text-black">50% Advance</span>
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">To be paid after service</span>
                        </div>
                        <span className="text-xl font-black text-black tabular-nums">₹866</span>
                     </div>
                     <div className="h-px bg-zinc-50"></div>
                     <div className="flex justify-between items-center group cursor-pointer lg:hover:pl-1 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-primary/10 transition-colors">
                              <FileText className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
                           </div>
                           <span className="text-xs font-bold text-zinc-700">Terms and Conditions</span>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-primary transition-all">
                           <ChevronRight className="w-4 h-4 text-black" />
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-2 px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Requirement Summary</h3>
                  <div className="h-px flex-1 bg-zinc-50"></div>
               </div>
               
               <div className="grid grid-cols-2 gap-3 pb-10">
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                     <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Vehicle</p>
                     <p className="text-xs font-bold text-black">{formData.vehicleType || "Selected"}</p>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                     <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Material</p>
                     <p className="text-xs font-bold text-black">{formData.serviceType || "Goods"}</p>
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
    // Navigate to requests tracking with success animation
    navigate("/user/requests");
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white shadow-sm border border-zinc-100"
          onClick={() => step === 1 ? navigate(-1) : prevStep()}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-black leading-tight">{steps[step-1].title}</h1>
          <p className="text-xs text-zinc-500">{steps[step-1].description}</p>
        </div>
      </header>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400 tracking-widest px-1">
          <span>Progress</span>
          <span>Step {step} of {totalSteps}</span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-1.5" />
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-zinc-100 flex items-center justify-between safe-area-bottom z-50 max-w-md mx-auto">
          <Button 
             variant="ghost" 
             onClick={prevStep} 
             disabled={step === 1}
             className="text-zinc-500 font-bold"
          >
            Back
          </Button>
          <Button 
            className="rounded-2xl h-14 px-8 shadow-lg shadow-primary/20"
            onClick={nextStep}
            disabled={
              (step === 1 && !formData.serviceType) ||
              (step === 2 && (!formData.pickup || !formData.drops[0])) ||
              (step === 3 && !formData.vehicleType)
            }
          >
            <span>Continue</span>
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      )}

      {step === totalSteps && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-100 safe-area-bottom z-50 max-w-md mx-auto">
          <Button 
            className="w-full rounded-2xl h-14 shadow-lg shadow-primary/20 font-black text-lg"
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
