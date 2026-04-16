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
      <header className="flex justify-between items-center py-4 -mx-4 px-4 sticky top-0 bg-white/95 backdrop-blur-md z-30 w-full mb-2">
        <div className="w-10"></div>
        <div className="w-10"></div>
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
        <div className="text-center space-y-0.5 relative">
           <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{driver.name}</h1>
           <p className="text-xs text-zinc-500 font-semibold tracking-tight">{driver.phone}</p>
            <div className="flex items-center justify-center pt-2 gap-2">
               <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none rounded-lg text-[10px] px-3 py-0.5 font-bold tracking-tight">
                  Verified Driver
               </Badge>
               <Badge className="bg-primary text-zinc-900 hover:bg-primary border-none rounded-lg text-[10px] px-3 py-0.5 font-bold tracking-tight">
                  {driver.rating} ★
               </Badge>
            </div>
         </div>
      </div>

      {/* Completion Meter Section */}
      <div className="px-1">
        <Card className="border-2 border-primary/10 shadow-sm bg-white rounded-xl overflow-hidden p-3 space-y-2">
           <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-zinc-700 tracking-tight">Profile Completion</span>
              <span className="text-[10px] font-bold text-primary">{driver.profileProgress}%</span>
           </div>
           <Progress value={driver.profileProgress} className="h-1.5 bg-primary/5" />
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
         <Card className="border-2 border-primary/5 shadow-sm bg-zinc-50/30 rounded-xl overflow-hidden">
            <CardContent className="p-3 flex flex-col items-center">
                <span className="text-xl font-bold text-zinc-900">{driver.completedLeads}</span>
                <span className="text-[10px] font-bold text-zinc-500 tracking-tight">Completed Leads</span>
            </CardContent>
         </Card>
         <Card className="border-2 border-primary/5 shadow-sm bg-zinc-50/30 rounded-xl overflow-hidden">
            <CardContent className="p-3 flex flex-col items-center">
                <span className="text-xl font-bold text-zinc-900">{driver.isOnline ? "Online" : "Offline"}</span>
                <span className="text-[10px] font-bold text-zinc-500 tracking-tight">Service Status</span>
            </CardContent>
         </Card>
      </div>

      {/* Menu Settings */}
      <div className="space-y-3">
         <h3 className="text-[10px] font-bold text-zinc-500 tracking-tight px-1 uppercase">Account & Fleet</h3>
         <div className="space-y-2">
            {menuItems.map((item, idx) => (
               <Card 
                 key={idx} 
                 className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-xl bg-zinc-50/50"
                 onClick={() => navigate(item.path)}
               >
                  <CardContent className="p-3 flex items-center justify-between">
                     <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 bg-white rounded-xl text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-zinc-100 shadow-sm flex items-center justify-center">
                           {item.icon}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[11px] font-bold text-zinc-900 tracking-tight">{item.label}</span>
                           <span className="text-[9px] text-zinc-500 font-semibold tracking-tight">{item.desc}</span>
                        </div>
                     </div>
                     <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>

      <div className="pt-2">
         <Button 
           variant="ghost" 
           className="w-full h-11 rounded-xl text-red-500 border border-red-100 bg-red-50/20 hover:bg-red-50 transition-colors font-bold text-xs tracking-tight group"
           onClick={() => navigate("/driver/auth")}
         >
            <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
            Logout Account
         </Button>
         <p className="text-center text-[8px] text-zinc-400 font-bold tracking-tight pt-4 italic">Version 1.0.42 Beta • Safar Setto</p>
      </div>
    </motion.div>
  );
};

export default DriverProfile;
