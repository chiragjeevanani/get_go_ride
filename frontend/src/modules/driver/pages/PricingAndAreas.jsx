import React from "react";
import { 
  ChevronLeft, IndianRupee, MapPin, 
  Clock, Navigation, Globe, Check,
  Save, AlertCircle, Info, Plus, X, Edit3,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PricingAndAreas = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = React.useState(false);
  const [routes, setRoutes] = React.useState(["Indore to Bhopal", "Local Delivery", "Ujjain Route"]);
  const [newRoute, setNewRoute] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [isTimingModalOpen, setIsTimingModalOpen] = React.useState(false);
  const minFareRef = React.useRef(null);
  const perKmRef = React.useRef(null);
  const [isEditingMinFare, setIsEditingMinFare] = React.useState(false);
  const [isEditingPerKm, setIsEditingPerKm] = React.useState(false);

  const [pricing, setPricing] = React.useState({
    minFare: "499",
    perKm: "12",
    baseWait: "15",
    outstationPrice: "16"
  });

  const [schedule, setSchedule] = React.useState({
    coverage: "Full Week Coverage",
    timing: "Mon - Sat, 08:00 AM - 10:00 PM",
    days: [0, 1, 2, 3, 4, 5], // 0 is Monday, 6 is Sunday
    startTime: "08:00",
    endTime: "22:00"
  });

  const toggleDay = (dayIndex) => {
    const newDays = schedule.days.includes(dayIndex)
      ? schedule.days.filter(d => d !== dayIndex)
      : [...schedule.days, dayIndex].sort();
    setSchedule({ ...schedule, days: newDays });
  };

  const handleDeleteRoute = (target) => {
    setRoutes(routes.filter(r => r !== target));
  };

  const handleAddRoute = () => {
    if (newRoute.trim()) {
      setRoutes([...routes, newRoute.trim()]);
      setNewRoute("");
      setIsAdding(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24 pt-4 px-1"
    >
      {/* Header */}
      <header className="flex items-center gap-4 -mx-5 px-5 py-3 border-b-2 border-yellow-400 sticky top-0 bg-white/90 backdrop-blur-md z-30 mb-5">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none">Pricing & Areas</h1>
          <p className="text-[10px] font-semibold text-zinc-500 tracking-tight mt-1">Set your rates and service zones</p>
        </div>
      </header>

      {/* Pricing Configuration */}
      <section className="space-y-4 px-1">
         <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-bold tracking-tight text-zinc-500 uppercase flex items-center gap-2">
               <IndianRupee className="w-3.5 h-3.5" /> Pricing Controls
            </h3>
            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-bold tracking-tight px-2 py-0.5">Competitive Rates</Badge>
         </div>

         <div className="grid grid-cols-2 gap-3">
            <Card className={cn(
               "border rounded-2xl bg-white shadow-sm overflow-hidden group transition-all",
               isEditingMinFare ? "border-primary ring-1 ring-primary/20" : "border-zinc-100"
            )}>
               <CardContent className="p-4 space-y-3 relative">
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={() => {
                        setIsEditingMinFare(true);
                        setTimeout(() => minFareRef.current?.focus(), 10);
                     }}
                     className={cn(
                        "absolute top-2 right-2 w-7 h-7 rounded-lg transition-all",
                        isEditingMinFare ? "bg-primary text-zinc-900 border-none shadow-md" : "text-primary bg-primary/5 border border-primary/10 shadow-sm"
                     )}
                  >
                     <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <div className="space-y-0.5">
                     <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Min. Fare</Label>
                     <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                        <Input 
                           ref={minFareRef}
                           readOnly={!isEditingMinFare}
                           onBlur={() => setIsEditingMinFare(false)}
                           value={pricing.minFare}
                           onChange={(e) => setPricing({...pricing, minFare: e.target.value})}
                           className={cn(
                              "pl-8 h-11 rounded-xl border-none font-bold text-sm transition-all outline-none",
                              isEditingMinFare ? "bg-white ring-0" : "bg-zinc-50 opacity-80 cursor-default"
                           )}
                        />
                     </div>
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-400 leading-tight">Charged for the first 3km of every trip.</p>
               </CardContent>
            </Card>

            <Card className={cn(
               "border rounded-2xl bg-white shadow-sm overflow-hidden group transition-all",
               isEditingPerKm ? "border-primary ring-1 ring-primary/20" : "border-zinc-100"
            )}>
               <CardContent className="p-4 space-y-3 relative">
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={() => {
                        setIsEditingPerKm(true);
                        setTimeout(() => perKmRef.current?.focus(), 10);
                     }}
                     className={cn(
                        "absolute top-2 right-2 w-7 h-7 rounded-lg transition-all",
                        isEditingPerKm ? "bg-primary text-zinc-900 border-none shadow-md" : "text-primary bg-primary/5 border border-primary/10 shadow-sm"
                     )}
                  >
                     <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <div className="space-y-0.5">
                     <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Per KM</Label>
                     <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                        <Input 
                           ref={perKmRef}
                           readOnly={!isEditingPerKm}
                           onBlur={() => setIsEditingPerKm(false)}
                           value={pricing.perKm}
                           onChange={(e) => setPricing({...pricing, perKm: e.target.value})}
                           className={cn(
                              "pl-8 h-11 rounded-xl border-none font-bold text-sm transition-all outline-none",
                              isEditingPerKm ? "bg-white ring-0" : "bg-zinc-50 opacity-80 cursor-default"
                           )}
                        />
                     </div>
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-500 leading-tight">Recommended: ₹10 - ₹15 for your vehicle.</p>
               </CardContent>
            </Card>
         </div>
      </section>

      {/* Service Availability */}
      <section className="px-1">
         <Card className="bg-zinc-900 border-none rounded-2xl p-5 relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                     <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                     <h4 className="text-white text-xs font-bold tracking-tight">Outstation Services</h4>
                     <p className="text-primary text-[9px] font-bold tracking-tight">Increases lead visibility by 40%</p>
                  </div>
               </div>
               <Switch className="data-[state=checked]:bg-primary bg-zinc-700" defaultChecked />
            </div>
            {/* Design Element */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
         </Card>
      </section>

      {/* Service Areas (Routes) */}
      <section className="space-y-4 px-1">
         <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-bold tracking-tight text-zinc-500 uppercase flex items-center gap-2">
               <Navigation className="w-3.5 h-3.5" /> Preferred Areas
            </h3>
            <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setIsAdding(!isAdding)}
               className="h-6 text-[10px] font-bold text-primary gap-1 px-2 hover:bg-primary/5 rounded-lg transition-all"
            >
               {isAdding ? "Cancel" : <><Plus className="w-3 h-3" /> Add Route</>}
            </Button>
         </div>

         <AnimatePresence>
            {isAdding && (
               <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-3 overflow-hidden"
               >
                  <Card className="border-2 border-primary/20 bg-primary/5 rounded-2xl p-3">
                     <div className="flex gap-2">
                        <Input 
                           autoFocus
                           placeholder="Enter City or Route..." 
                           className="h-10 bg-white border-zinc-100 font-bold text-xs"
                           value={newRoute}
                           onChange={(e) => setNewRoute(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && handleAddRoute()}
                        />
                        <Button onClick={handleAddRoute} className="h-10 bg-primary text-zinc-900 font-bold px-4 rounded-xl">Add</Button>
                     </div>
                  </Card>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="grid grid-cols-1 gap-2.5">
            {routes.map((route, idx) => (
               <Card key={idx} className="border border-zinc-100 rounded-2xl bg-white shadow-sm hover:border-primary/20 transition-all group overflow-hidden">
                  <CardContent className="p-3.5 flex items-center justify-between">
                     <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 text-zinc-400 group-hover:text-zinc-600 transition-colors">
                           <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-zinc-900 tracking-tight">{route}</span>
                     </div>
                     <Button 
                        onClick={() => handleDeleteRoute(route)}
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all border border-zinc-100 shadow-sm"
                     >
                        <X className="w-4 h-4" />
                     </Button>
                  </CardContent>
               </Card>
            ))}
         </div>
      </section>

      {/* Operating Schedule */}
      <section className="px-1 space-y-3.5">
         <h3 className="text-[11px] font-bold tracking-tight text-zinc-500 uppercase flex items-center gap-2 px-1">
            <Clock className="w-3.5 h-3.5" /> Working Hours
         </h3>
         <Card className="border border-zinc-100 rounded-2xl bg-white shadow-sm">
            <CardContent className="p-5 flex flex-col gap-5">
               <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                     <h4 className="text-xs font-bold text-zinc-900 tracking-tight">{schedule.coverage}</h4>
                     <p className="text-[10px] font-semibold text-zinc-500 tracking-tight">{schedule.timing}</p>
                  </div>
                  <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={() => setIsTimingModalOpen(true)}
                     className="h-8 rounded-lg border-zinc-100 text-[10px] font-bold text-zinc-600 px-3 hover:bg-zinc-50"
                  >
                     Edit Timing
                  </Button>
               </div>
               <div className="flex justify-between gap-1.5 p-1 bg-zinc-50 rounded-xl border border-zinc-100/50">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                     <div key={i} className={cn(
                        "flex-1 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold",
                        schedule.days.includes(i) ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400"
                     )}>
                        {day}
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </section>

      {/* Save Action Bar */}
      <section className="px-1 pt-4">
         <Card className="bg-white border border-zinc-100 p-4 px-5 flex items-center justify-between rounded-2xl shadow-sm">
            <div className="space-y-0.5">
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Service Status</p>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-zinc-900 tracking-tight">Accepting New Leads</span>
               </div>
            </div>
            <Button 
               disabled={isSaving}
               onClick={handleSave}
               className="w-32 h-12 bg-primary text-zinc-900 font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 relative overflow-hidden"
            >
               {isSaving ? (
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex items-center gap-2"
                  >
                     <Save className="w-4 h-4 animate-spin" /> Saving...
                  </motion.div>
               ) : (
                  <div className="flex items-center gap-2">
                     <Save className="w-4 h-4" /> Save
                  </div>
               )}
            </Button>
         </Card>
      </section>

      {/* Safety Notice */}
      <div className="px-5 pt-2">
         <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-3 items-start">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] font-semibold text-zinc-500 leading-relaxed tracking-tight italic">
               * Pricing changes may take up to 2 hours to reflect in live search results. Your conversion score affects how often your rates are shown.
            </p>
         </div>
      </div>
      {/* Timing Modal */}
      <Dialog open={isTimingModalOpen} onOpenChange={setIsTimingModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-none p-4.5 bg-white shadow-2xl">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/10">
                   <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                   <h2 className="text-lg font-bold tracking-tight text-zinc-900 leading-none">Working Hours</h2>
                   <p className="text-[10px] font-semibold text-zinc-500">Define your weekly availability</p>
                </div>
             </div>
             
             <div className="space-y-3.5 py-1">
               <div className="grid gap-1.5">
                 <Label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Operational Days</Label>
                 <div className="flex justify-between gap-1.5">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                       <div 
                          key={i} 
                          onClick={() => toggleDay(i)}
                          className={cn(
                             "w-8.5 h-8.5 rounded-xl flex items-center justify-center text-[10px] font-bold border cursor-pointer transition-all",
                             schedule.days.includes(i) 
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/10 scale-105" 
                              : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300"
                          )}
                       >
                          {day}
                       </div>
                    ))}
                 </div>
               </div>
               
               <div className="grid gap-1.5">
                 <Label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Time Slots</Label>
                 <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col gap-1 transition-all focus-within:border-primary focus-within:bg-white group">
                       <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tight">Start Time</span>
                       <input 
                          type="time" 
                          value={schedule.startTime}
                          onChange={(e) => setSchedule({...schedule, startTime: e.target.value})}
                          className="bg-transparent border-none p-0 text-xs font-bold text-zinc-900 focus:ring-0 outline-none w-full"
                       />
                    </div>
                    <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col gap-1 transition-all focus-within:border-primary focus-within:bg-white group">
                       <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tight">End Time</span>
                       <input 
                          type="time" 
                          value={schedule.endTime}
                          onChange={(e) => setSchedule({...schedule, endTime: e.target.value})}
                          className="bg-transparent border-none p-0 text-xs font-bold text-zinc-900 focus:ring-0 outline-none w-full"
                       />
                    </div>
                 </div>
               </div>
             </div>

             <div className="flex gap-2 pt-1">
               <Button variant="ghost" onClick={() => setIsTimingModalOpen(false)} className="flex-1 h-10 rounded-xl font-bold text-zinc-400 text-xs hover:bg-zinc-50">Cancel</Button>
               <Button onClick={() => setIsTimingModalOpen(false)} className="flex-1 h-10 bg-zinc-900 text-white rounded-xl font-bold text-xs shadow-lg shadow-zinc-900/10">Update</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PricingAndAreas;
