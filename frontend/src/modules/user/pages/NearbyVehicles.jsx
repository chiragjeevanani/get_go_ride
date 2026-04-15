import { useState, useEffect } from "react";
import { 
  MapPin, Search, Navigation, ChevronLeft, Car, Bike, Truck, 
  Timer, CheckCircle2, X, Map as MapIcon, Loader2
} from "lucide-react";
import bikeImg from "@/assets/categories/Bike-removebg-preview.png";
import autoImg from "@/assets/categories/auto-removebg-preview.png";
import cabImg from "@/assets/categories/cab-removebg-preview.png";
import truckImg from "@/assets/categories/Truck-removebg-preview.png";
import truck2Img from "@/assets/categories/truck2-removebg-preview.png";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const NearbyVehicles = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("Bhopal, Madhya Pradesh");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dummy vehicle data
  const vehicles = [
    {
      id: 1,
      name: "Bike",
      type: "Bike",
      distance: "0.5 km",
      time: "3 min",
      status: "Available",
      price: "₹40",
      image: bikeImg,
      color: "bg-zinc-50 text-zinc-600"
    },
    {
      id: 2,
      name: "Auto",
      type: "Auto",
      distance: "1.2 km",
      time: "5 min",
      status: "Available",
      price: "₹85",
      image: autoImg,
      color: "bg-zinc-50 text-zinc-600"
    },
    {
      id: 3,
      name: "Mini Cab",
      type: "Cab",
      distance: "2.1 km",
      time: "7 min",
      status: "Available",
      price: "₹120",
      image: cabImg,
      color: "bg-zinc-50 text-zinc-600"
    },
    {
      id: 4,
      name: "Delivery",
      type: "Truck",
      distance: "3.5 km",
      time: "12 min",
      status: "Busy",
      price: "₹250",
      image: truck2Img,
      color: "bg-zinc-50 text-zinc-600"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(searchQuery);
      setShowLocationModal(false);
      setSearchQuery("");
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleBookNow = (v) => {
    // Map nearby vehicle types to the established service/vehicle types in the app flow
    let serviceType = "passenger";
    let vehicleType = "mini";

    if (v.type === "Bike") {
      serviceType = "passenger";
      vehicleType = "auto"; // Assuming bike falls under passenger/quick transport
    } else if (v.type === "Auto") {
      serviceType = "passenger";
      vehicleType = "auto";
    } else if (v.type === "Cab") {
      serviceType = "passenger";
      vehicleType = "mini";
    } else if (v.type === "Truck") {
      serviceType = "goods";
      vehicleType = "mini";
    }

    navigate("/user/post-requirement", {
      state: {
        pickup: location,
        formData: {
          serviceType,
          vehicleType,
          pickup: location,
          drops: [""],
          loadType: serviceType === "goods" ? "kg" : "items",
          loadValue: "",
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          notes: `Booking for ${v.name}`
        },
        step: 1 // Start at destinations to keep flow logical
      }
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Compact Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <button 
                onClick={() => navigate(-1)}
                className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-100"
             >
                <ChevronLeft className="w-4 h-4 text-zinc-900" />
             </button>
             <div className="max-w-[160px]">
                <div className="flex items-center gap-1">
                   <MapPin className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
                   <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">Location</span>
                </div>
                <h1 className="text-xs font-black text-zinc-900 truncate leading-tight">{location}</h1>
             </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLocationModal(true)}
            className="h-7 border-primary text-primary hover:bg-primary/5 rounded-lg text-[9px] font-black uppercase tracking-wider px-3"
          >
            Change
          </Button>
        </div>
      </header>

      <div className="p-3 space-y-4">
        {/* Compact Map Preview */}
        <section>
          <div className="relative w-full h-28 bg-zinc-50 border-2 border-primary/10 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-2 p-2">
                {[...Array(48)].map((_, i) => (
                  <div key={i} className="border-[0.5px] border-zinc-300 rounded-px"></div>
                ))}
              </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-3 bg-primary/30 rounded-full animate-ping"></div>
                <div className="relative z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <Navigation className="w-3 h-3 text-black fill-black" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-0.5 rounded-lg border border-zinc-100 shadow-sm flex items-center gap-1.5">
               <MapIcon className="w-2.5 h-2.5 text-zinc-400" />
               <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tight">Expand</span>
            </div>
          </div>
        </section>

        {/* Nearby Vehicles List Section */}
        <section className="space-y-3">
           <div className="flex justify-between items-center px-1">
              <h2 className="text-sm font-black tracking-tight text-zinc-900 border-l-3 border-primary pl-2 uppercase italic">Nearby</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[8px] font-black tracking-widest">{vehicles.length} VEHICLES</Badge>
           </div>

           <div className="flex flex-col gap-2.5">
              <AnimatePresence mode="wait">
                 {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                       <motion.div
                          key={`skel-${i}`}
                          className="w-full h-24 bg-zinc-50 border border-zinc-100 rounded-xl animate-pulse"
                       />
                    ))
                 ) : (
                    vehicles.map((vehicle, idx) => (
                       <motion.div
                          key={vehicle.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                       >
                          <Card className="border-2 border-primary/10 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white">
                             <CardContent className="p-2.5 flex gap-3">
                                <div className={cn(
                                   "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden",
                                   vehicle.color
                                )}>
                                    <img 
                                      src={vehicle.image} 
                                      alt={vehicle.name} 
                                      className="w-full h-full object-contain p-1"
                                    />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-start">
                                      <div className="min-w-0">
                                         <h3 className="font-black text-zinc-900 text-xs uppercase truncate pr-2">{vehicle.name}</h3>
                                         <div className="flex items-center gap-2 mt-0.5">
                                            <div className="flex items-center gap-0.5 text-[9px] font-bold text-zinc-400">
                                               <MapPin className="w-2.5 h-2.5" />
                                               {vehicle.distance}
                                            </div>
                                            <div className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500">
                                               <Timer className="w-2.5 h-2.5" />
                                               {vehicle.time}
                                            </div>
                                         </div>
                                      </div>
                                      <div className="shrink-0 text-right">
                                         <span className="text-[11px] font-black text-zinc-900">{vehicle.price}</span>
                                         <div className={cn(
                                            "mt-0.5 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tight",
                                            vehicle.status === "Available" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                         )}>
                                            {vehicle.status}
                                         </div>
                                      </div>
                                   </div>

                                   <div className="flex gap-1.5 mt-2">
                                      <Button className="h-7 px-3 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 rounded-lg text-[8px] font-black uppercase tracking-widest border border-zinc-100 flex-1">
                                         Info
                                      </Button>
                                      <Button 
                                         onClick={() => handleBookNow(vehicle)}
                                         className="h-7 px-3 bg-primary text-black hover:bg-yellow-400 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm shadow-primary/20 flex-[2]"
                                      >
                                         Book Now
                                      </Button>
                                   </div>
                                </div>
                             </CardContent>
                          </Card>
                       </motion.div>
                    ))
                 )}
              </AnimatePresence>
           </div>
        </section>
      </div>

      {/* Location Selection Modal (Compact) */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocationModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white rounded-t-3xl p-5 shadow-2xl"
            >
              <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-4"></div>
              
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-black text-zinc-900 uppercase italic leading-none">Location</h2>
                 <button 
                  onClick={() => setShowLocationModal(false)}
                  className="p-1.5 bg-zinc-50 rounded-lg"
                 >
                    <X className="w-4 h-4 text-zinc-400" />
                 </button>
              </div>

              <form onSubmit={handleLocationSubmit} className="space-y-3">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
                    <Input 
                      placeholder="Enter area name..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-11 bg-zinc-50 border-none rounded-xl text-xs font-bold"
                    />
                 </div>

                 <Button 
                   type="button" 
                   className="w-full h-11 bg-white border border-primary/30 text-primary rounded-xl flex items-center justify-center gap-2"
                 >
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase">Current Location</span>
                 </Button>

                 <Button 
                   type="submit"
                   disabled={!searchQuery.trim()}
                   className="w-full h-11 bg-zinc-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
                 >
                    Set Location
                 </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NearbyVehicles;
