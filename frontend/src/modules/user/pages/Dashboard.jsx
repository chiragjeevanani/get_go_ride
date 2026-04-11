import { useState } from "react";
import { Search, MapPin, Truck, Home, Users, AlertTriangle, Hammer, Plus, ArrowRight, Package, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "goods", title: "Goods Transport", icon: <Truck className="w-6 h-6 text-black" />, bg: "bg-primary" },
    { id: "house", title: "House Shifting", icon: <Home className="w-6 h-6 text-black" />, bg: "bg-primary" },
    { id: "passenger", title: "Passenger", icon: <Users className="w-6 h-6 text-black" />, bg: "bg-primary" },
    { id: "emergency", title: "Emergency", icon: <AlertTriangle className="w-6 h-6 text-black" />, bg: "bg-primary" },
    { id: "construction", title: "Construction", icon: <Hammer className="w-6 h-6 text-black" />, bg: "bg-primary" },
  ];

  const recentRequests = [
    {
      id: "REQ-101",
      service: "House Shifting",
      status: "Responding",
      responses: 4,
      date: "Today, 12:30 PM",
    },
    {
      id: "REQ-102",
      service: "Goods Transport",
      status: "Finalized",
      responses: 5,
      date: "Yesterday",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Logo & Profile Header */}
      <header className="flex justify-between items-center py-3">
        <div className="flex items-center h-10 w-fit relative overflow-visible">
          <img 
            src="/getgoride_logo_no_bg.png" 
            alt="GetGoRide Logo" 
            className="h-38 w-auto object-contain object-left drop-shadow-md relative z-10" 
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm active:scale-95 transition-transform cursor-pointer">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-inner">
               <span className="text-[10px] font-black">₹</span>
            </div>
            <span className="text-[11px] font-black tracking-tighter">2,450</span>
          </div>
          
          <div 
            onClick={() => navigate("/user/profile")}
            className="w-11 h-11 rounded-2xl bg-zinc-50 overflow-hidden border-2 border-white shadow-sm ring-1 ring-zinc-100 cursor-pointer active:scale-90 transition-transform"
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Hero: Post Requirement Quick Card */}
      <section className="relative">
         <Card className="border-none shadow-2xl shadow-black/5 bg-white relative z-10 overflow-hidden rounded-[2.5rem]">
            <CardContent className="p-6 space-y-5">
               <div className="space-y-1">
                  <h2 className="text-xl font-black text-black tracking-tight leading-tight">Post requirement <br/>at your price</h2>
                  <div className="h-1 w-10 bg-primary rounded-full"></div>
               </div>

               <div className="space-y-3">
                  <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                     <Input 
                        placeholder="Enter pickup location" 
                        className="pl-10 h-14 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus-visible:ring-primary/30"
                        readOnly
                        onClick={() => navigate("/user/post-requirement")}
                     />
                  </div>
                  <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                     <Input 
                        placeholder="Enter drop location" 
                        className="pl-10 h-14 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus-visible:ring-primary/30"
                        readOnly
                        onClick={() => navigate("/user/post-requirement")}
                     />
                  </div>
               </div>

               <Button 
                  onClick={() => navigate("/user/post-requirement")}
                  className="w-full h-14 bg-primary text-black font-black text-base rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
               >
                  <Plus className="w-5 h-5 mr-2" />
                  Post Requirements
               </Button>
            </CardContent>
         </Card>

         {/* Decorative Illustration */}
         <div className="absolute -bottom-12 -right-12 w-64 h-64 opacity-60 z-0 pointer-events-none">
            <img src="/premium_delivery_truck_isometric_1775805788715.png" alt="truck" className="w-full h-full object-contain" />
         </div>

         <div className="pt-8 pb-4 px-2 max-w-[180px]">
            <h1 className="text-2xl font-black text-zinc-900 leading-[0.9] tracking-tighter uppercase italic select-none">
               Gaadi Chahiye? <br/>
               <span className="text-primary drop-shadow-sm">Mil Jaayegi</span>
            </h1>
         </div>
      </section>

      {/* Featured Service Categories */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-bold">Categories</h2>
          <span className="text-black text-sm font-bold cursor-pointer hover:underline">See All</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {categories.slice(0, 4).map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/user/post-requirement?cat=${cat.id}`)}
              className="cursor-pointer"
            >
              <Card className="border-none shadow-premium hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className={`p-3 rounded-2xl w-fit ${cat.bg}`}>
                    {cat.icon}
                  </div>
                  <span className="font-semibold text-black text-sm">{cat.title}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity / Requirements */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-bold">Recent Requirements</h2>
          <span className="text-black text-sm font-bold cursor-pointer hover:underline">View All</span>
        </div>

        <div className="flex flex-col gap-3">
          {recentRequests.map((req) => (
            <Card key={req.id} className="border-none shadow-premium hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-100 rounded-2xl">
                    <Package className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm line-clamp-1">{req.service}</span>
                    <span className="text-xs text-zinc-500">{req.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={req.status === "Finalized" ? "success" : "info"} className="rounded-lg text-[10px] px-2">
                    {req.status}
                  </Badge>
                  <span className="text-[10px] font-medium text-zinc-400">{req.responses} vendors responded</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Banner / Promotion */}
      <Card className="bg-primary/5 border-none p-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h3 className="font-bold text-black tracking-tight">Become a Vendor?</h3>
          <p className="text-xs text-zinc-500 max-w-[200px]">Register your vehicle and start earning by providing services.</p>
          <Button variant="outline" size="sm" className="mt-2 text-xs border-primary text-primary bg-white hover:bg-primary hover:text-black rounded-xl">
            Register Now
          </Button>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-10">
          <Truck className="w-32 h-32 rotate-[-15deg] fill-primary" />
        </div>
      </Card>

      {/* Floating CTA for New Requirement */}
      <motion.div 
        className="fixed bottom-24 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Button 
          onClick={() => navigate("/user/post-requirement")}
          className="h-16 w-16 rounded-full shadow-2xl bg-primary text-black border-none group transition-all duration-300 hover:w-56"
        >
          <Plus className="w-6 h-6 group-hover:mr-2" />
          <span className="hidden group-hover:inline-block font-bold">New Requirement</span>
        </Button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
