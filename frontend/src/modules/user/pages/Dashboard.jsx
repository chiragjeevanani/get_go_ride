import { useState, useEffect } from "react";
import { 
  Search, MapPin, Truck, Home, Users, AlertTriangle, 
  Hammer, Plus, ArrowRight, Package, ChevronRight, X, MapPinned
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import goodsImg from "@/assets/categories/Truck-removebg-preview.png";
import houseImg from "@/assets/categories/shifting.jpg";
import passengerImg from "@/assets/categories/passenger-removebg-preview.png";
import emergencyImg from "@/assets/categories/Emergency-removebg-preview.png";
import truck2Img from "@/assets/categories/truck2-removebg-preview.png";
import profileImg from "@/assets/profile.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [recentRequests, setRecentRequests] = useState([
    { id: "REQ-101", service: "House Shifting", status: "Responding", responses: 4, date: "Today, 12:30 PM" },
    { id: "REQ-102", service: "Goods Transport", status: "Finalized", responses: 5, date: "Yesterday" },
  ]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user_requests") || "[]");
    if (saved.length > 0) {
      setRecentRequests(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const unique = saved.filter(r => !existingIds.has(r.id));
        return [...unique, ...prev].slice(0, 5); // Show latest 5
      });
    }
  }, []);

  const categories = [
    { id: "goods", title: "Goods Transport", image: goodsImg },
    { id: "house", title: "House Shifting", image: houseImg },
    { id: "passenger", title: "Passenger", image: passengerImg },
    { id: "emergency", title: "Emergency", image: emergencyImg },
  ];

  const handlePostRequirement = () => {
    navigate("/user/post-requirement");
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Logo & Profile Header */}
      <header className="flex justify-between items-center py-1.5 px-4 border-b-2 border-primary/20 sticky top-0 bg-white/80 backdrop-blur-lg z-30">
        <div className="flex items-center h-6 w-fit relative overflow-visible -ml-6">
          <img 
            src="/getgoride_logo_no_bg.png" 
            alt="GetGoLoad Logo" 
            className="h-28 w-auto object-contain object-left drop-shadow-md relative z-10" 
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer">
            <div className="w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center shadow-inner">
               <span className="text-[8px] font-black">₹</span>
            </div>
            <span className="text-[9px] font-black tracking-tighter uppercase">2,450</span>
          </div>
          
          <div 
            onClick={() => navigate("/user/profile")}
            className="w-8 h-8 rounded-lg bg-zinc-50 overflow-hidden border border-white shadow-sm ring-1 ring-zinc-50 cursor-pointer active:scale-90 transition-transform"
          >
            <img src={profileImg} alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Hero: Post Requirement Quick Section */}
      <section className="relative pt-1 px-4">
         <div className="space-y-4 relative z-10">
            <div className="space-y-0.5 px-2">
               <h2 className="text-xl font-black text-black tracking-tight leading-none">Post requirement</h2>
               <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">at your own price</p>
            </div>

            <div className="space-y-3">
               <div className="relative z-20 cursor-pointer bg-white rounded-[1.25rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-zinc-100" onClick={() => navigate("/user/post-requirement", { state: { pickup, drop, step: 1 } })}>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 z-10"></div>
                  <div className="pl-11 pr-14 h-14 flex items-center text-[13px] font-bold text-zinc-900 w-full truncate select-none">
                     {pickup || <span className="text-[#5c7a99] font-semibold">Enter pickup location</span>}
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 px-5 text-zinc-300 flex items-center justify-center pointer-events-none">
                     <MapPinned className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </div>
               </div>
               
               <div className="relative z-20 cursor-pointer bg-white rounded-[1.25rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-zinc-100" onClick={() => navigate("/user/post-requirement", { state: { pickup, drop, step: 1 } })}>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 z-10"></div>
                  <div className="pl-11 pr-14 h-14 flex items-center text-[13px] font-bold text-zinc-900 w-full truncate select-none">
                     {drop || <span className="text-[#5c7a99] font-semibold">Enter drop location</span>}
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 px-5 text-zinc-300 flex items-center justify-center pointer-events-none">
                     <MapPinned className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </div>
               </div>
            </div>

            <div className="flex justify-center pt-2">
               <Button 
                  onClick={handlePostRequirement}
                  className="w-fit px-10 h-10 bg-primary text-black font-black text-[11px] rounded-lg shadow-lg shadow-primary/20 active:scale-95 transition-all uppercase tracking-[0.15em]"
               >
                  Post Requirements
               </Button>
            </div>
         </div>

          {/* Decorative Illustration */}
          <div className="absolute -bottom-6 -right-10 w-64 h-64 opacity-40 z-0 pointer-events-none">
             <img src="/premium_delivery_truck_isometric_1775805788715.png" alt="truck" className="w-full h-full object-contain" />
          </div>

          <div className="pt-8 pb-10 px-2 max-w-[200px] relative group">
             {/* White Foggy Layer Effect */}
             <div className="absolute -left-12 -top-12 w-48 h-48 bg-white/50 blur-[40px] rounded-full pointer-events-none z-0 group-hover:bg-white/60 transition-colors"></div>
             
             <h1 className="text-2xl font-black text-zinc-900 leading-[0.9] tracking-tighter uppercase italic select-none relative z-10 drop-shadow-sm">
                <span className="relative">
                   Gaadi Chahiye?
                   <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent pointer-events-none mask-image-linear"></div>
                </span>
                <br/>
                <span className="text-primary drop-shadow-md brightness-110">Mil Jaayegi</span>
             </h1>
          </div>
       </section>

      {/* Featured Service Categories */}
      <section className="space-y-4 pt-4 px-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 border-l-4 border-primary pl-3">Categories</h2>
          <span 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-primary text-xs font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
          >
            {showAllCategories ? "Show Less" : "See All"}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5">
          {(showAllCategories ? categories : categories.slice(0, 4)).map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/user/post-requirement?cat=${cat.id}`)}
              className="cursor-pointer"
            >
              <Card className="border-2 border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden bg-white group">
                <CardContent className="p-0 flex flex-col">
                  <div className="w-full h-20 overflow-hidden relative flex items-center justify-center p-1 bg-zinc-50/30">
                    <img 
                      src={cat.image} 
                      alt={cat.title} 
                      className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-2 text-center border-t border-zinc-100 bg-white">
                    <span className="font-bold text-zinc-900 text-[10px] tracking-tight leading-none">{cat.title}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity / Requirements */}
      <section className="space-y-4 px-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold tracking-tight text-primary border-l-2 border-primary/20 pl-2">Recent Requirements</h2>
          <span 
            onClick={() => navigate("/user/requests")}
            className="text-zinc-500 text-[10px] font-bold tracking-tight cursor-pointer hover:opacity-70 transition-opacity"
          >
            View All
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {recentRequests.map((req) => (
            <Card key={req.id} className="border-2 border-primary/20 shadow-premium hover:shadow-md transition-all rounded-xl overflow-hidden bg-white cursor-pointer" onClick={() => navigate("/user/requests")}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-400 group-hover:bg-primary/10 transition-colors border border-zinc-100">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-black text-xs">{req.service}</span>
                    <span className="text-[10px] text-zinc-400 font-bold tracking-wider">{req.date}</span>
                  </div>
                </div>
                 <div className="flex flex-col items-end gap-1">
                    <div className={cn(
                       "px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-tight",
                       req.status === "Responding" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    )}>
                       {req.status}
                    </div>
                    <span className="text-[9px] font-semibold text-zinc-400 tracking-tight">{req.responses} Responses</span>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Banner / Promotion */}
      <div className="px-4">
        <Card className="bg-primary/5 border-none p-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h3 className="font-bold text-black tracking-tight">Become a Vendor?</h3>
          <p className="text-xs text-zinc-500 max-w-[200px]">Register your vehicle and start earning by providing services.</p>
          <Button variant="outline" size="sm" className="mt-2 text-xs border-primary text-primary bg-white hover:bg-primary hover:text-black rounded-xl">
            Register Now
          </Button>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-20 w-32 h-32 rotate-[-15deg]">
          <img src={truck2Img} alt="truck" className="w-full h-full object-contain brightness-0 opacity-40" />
        </div>
      </Card>
    </div>

      {/* Floating CTA for New Requirement */}
    </div>
  );
};

export default Dashboard;
