import React, { useState, useRef } from "react";
import { 
  User, Car, MapPin, IndianRupee, Camera, 
  ChevronRight, CheckCircle, ShieldCheck, LogOut, Edit3, Settings,
  BarChart2, Star, Zap, Bell, Shield, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";
import profileImg from "@/assets/profile.jpg";

const DriverProfile = () => {
  const navigate = useNavigate();
  const { driver, setDriver } = useDriverState();
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(profileImg);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const menuItems = [
    { icon: <Car className="w-4 h-4" />, label: "Vehicle Details", desc: "Manage your registered vehicles", path: "/driver/profile/vehicle" },
    { icon: <IndianRupee className="w-4 h-4" />, label: "Pricing & Service Areas", desc: "Set your per-km rates and routes", path: "/driver/profile/pricing" },
    { icon: <ShieldCheck className="w-4 h-4" />, label: "Subscription", desc: "View plan and payment history", path: "/driver/subscription" },
    { icon: <BarChart2 className="w-4 h-4" />, label: "Performance", desc: "View leads and conversion stats", path: "/driver/analytics" },
    { icon: <Bell className="w-4 h-4" />, label: "Alerts", desc: "Control notification settings", path: "/driver/profile/alerts" },
    { icon: <Shield className="w-4 h-4" />, label: "Account Security", desc: "Verification and passwords", path: "/driver/profile/security" },
    { icon: <HelpCircle className="w-4 h-4" />, label: "Help & Support", desc: "Get help with leads or app", path: "/driver/profile/support" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3 pb-8"
    >
      {/* Profile Header */}
      <header className="flex justify-between items-center py-1.5 border-b-2 border-primary/20 -mx-4 px-4 sticky top-0 bg-white/80 backdrop-blur-lg z-30">
        <h1 className="text-xs font-black text-black uppercase tracking-widest">Driver Profile</h1>
        <div className="w-7"></div>
      </header>

      <div className="flex flex-col items-center gap-2.5 pt-1.5">
        <div className="relative">
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*"
             onChange={handleAvatarChange}
           />
           <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden ring-1 ring-zinc-100">
              <img src={avatar} alt="Driver Avatar" className="w-full h-full object-cover" />
           </div>
           <Button 
            onClick={() => fileInputRef.current.click()}
            size="icon" 
            className="absolute bottom-0 right-0 rounded-full w-6 h-6 bg-primary shadow-lg border-2 border-white ring-1 ring-zinc-100 active:scale-90 transition-transform"
           >
              <Edit3 className="w-2.5 h-2.5 text-black" />
           </Button>
        </div>
        <div className="text-center space-y-0 relative">
           <h1 className="text-lg font-black text-black tracking-tighter uppercase italic">{driver.name}</h1>
           <p className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">{driver.phone}</p>
            <div className="flex items-center justify-center pt-1.5 gap-2">
               <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none rounded-md text-[9px] px-2.5 py-0.5 font-black tracking-widest uppercase">
                  Verified Driver
               </Badge>
               <Badge className="bg-primary text-black hover:bg-primary border-none rounded-md text-[9px] px-2.5 py-0.5 font-black tracking-widest uppercase">
                  {driver.rating} ★
               </Badge>
            </div>
         </div>
      </div>

      {/* Completion Meter Section */}
      <div className="px-1">
        <Card className="border-2 border-primary/10 shadow-sm bg-white rounded-xl overflow-hidden p-3 space-y-2">
           <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-black uppercase tracking-widest">Profile Completion</span>
              <span className="text-[9px] font-black text-primary uppercase">{driver.profileProgress}%</span>
           </div>
           <Progress value={driver.profileProgress} className="h-1.5 bg-primary/5" />
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5">
         <Card className="border-2 border-primary/10 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardContent className="p-2.5 flex flex-col items-center">
                <span className="text-lg font-black text-black">{driver.completedLeads}</span>
                <span className="text-[8px] uppercase font-black text-zinc-400 tracking-widest">Completed Leads</span>
            </CardContent>
         </Card>
         <Card className="border-2 border-primary/10 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardContent className="p-2.5 flex flex-col items-center">
                <span className="text-lg font-black text-black">{driver.isOnline ? "Online" : "Offline"}</span>
                <span className="text-[8px] uppercase font-black text-zinc-400 tracking-widest">Service Status</span>
            </CardContent>
         </Card>
      </div>

      {/* Menu Settings */}
      <div className="space-y-2.5">
         <h3 className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.2em] px-1">Account & Fleet</h3>
         <div className="space-y-1.5">
            {menuItems.map((item, idx) => (
               <Card 
                 key={idx} 
                 className="border border-zinc-100 shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-xl bg-white"
                 onClick={() => navigate(item.path)}
               >
                  <CardContent className="p-2.5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-zinc-100/50">
                           {item.icon}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-black uppercase tracking-tight">{item.label}</span>
                           <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">{item.desc}</span>
                        </div>
                     </div>
                     <ChevronRight className="w-3.5 h-3.5 text-zinc-200 group-hover:text-black transition-colors" />
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>

      <div className="pt-1">
         <Button 
           variant="ghost" 
           className="w-full h-10 rounded-xl text-red-500 border border-red-100 bg-red-50/20 hover:bg-red-50 transition-colors font-black text-[11px] uppercase tracking-widest group"
           onClick={() => navigate("/driver/auth")}
         >
            <LogOut className="w-3.5 h-3.5 mr-2 group-hover:translate-x-0.5 transition-transform" />
            Logout Account
         </Button>
         <p className="text-center text-[8px] text-zinc-300 font-black uppercase tracking-[0.3em] pt-3">Version 1.0.42 (Beta) • Safar Setto</p>
      </div>
    </motion.div>
  );
};

export default DriverProfile;
