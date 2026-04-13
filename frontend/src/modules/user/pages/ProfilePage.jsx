import React from "react";
import { 
  User, Settings, Package, Heart, CreditCard, 
  HelpCircle, LogOut, ChevronRight, Edit3, 
  ShieldCheck, Bell, MapPin 
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  const user = {
    name: "Felix Karanth",
    phone: "+91 98765 43210",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    membership: "Gold",
    requests: 24,
    saved: 12
  };

  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const menuItems = [
    { icon: <Package className="w-4 h-4" />, label: "Order History", desc: "View past and active requests", path: "/user/requests" },
    { icon: <CreditCard className="w-4 h-4" />, label: "Payments", desc: "Manage cards and methods", path: "/user/payments" },
    { icon: <MapPin className="w-4 h-4" />, label: "Addresses", desc: "Select frequent locations", path: "/user/addresses" },
    { icon: <Heart className="w-4 h-4" />, label: "Vendors", desc: "Your favorite providers", path: "#" },
    { icon: <Bell className="w-4 h-4" />, label: "Alerts", desc: "Control notification settings", path: "#" },
    { icon: <ShieldCheck className="w-4 h-4" />, label: "Security", desc: "Account protection tools", path: "#" },
    { icon: <HelpCircle className="w-4 h-4" />, label: "Support", desc: "Get help with requests", path: "/user/support" },
  ];

  return (
    <div className="space-y-3 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <header className="flex justify-between items-center py-1.5 border-b-2 border-primary/20 -mx-4 px-4 sticky top-0 bg-white/80 backdrop-blur-lg z-30">
        <h1 className="text-xs font-black text-black uppercase tracking-widest">Profile</h1>
        <div className="w-7"></div> {/* Spacer for symmetry */}
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
              <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
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
           <h1 className="text-lg font-black text-black tracking-tighter uppercase italic">{user.name}</h1>
           <p className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">{user.phone}</p>
            <div className="flex items-center justify-center pt-1.5">
               <Badge className="bg-primary text-black hover:bg-primary border-none rounded-md text-[9px] px-2.5 py-0.5 font-black tracking-widest uppercase">
                  {user.membership} Member
               </Badge>
            </div>
         </div>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5">
         <Card className="border-2 border-primary/10 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardContent className="p-2.5 flex flex-col items-center">
                <span className="text-lg font-black text-black">{user.requests}</span>
                <span className="text-[8px] uppercase font-black text-zinc-400 tracking-widest">Total Requests</span>
            </CardContent>
         </Card>
         <Card className="border-2 border-primary/10 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardContent className="p-2.5 flex flex-col items-center">
                <span className="text-lg font-black text-black">{user.saved}</span>
                <span className="text-[8px] uppercase font-black text-zinc-400 tracking-widest">Saved Vendors</span>
            </CardContent>
         </Card>
      </div>

      {/* Quick Settings */}
      {/* Quick Settings */}
      <div className="space-y-2.5">
         <h3 className="text-[10px] uppercase font-black text-zinc-400 tracking-[0.2em] px-1">Settings & Preferences</h3>
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
           onClick={() => navigate("/user/auth")}
         >
            <LogOut className="w-3.5 h-3.5 mr-2 group-hover:translate-x-0.5 transition-transform" />
            Logout Account
         </Button>
         <p className="text-center text-[8px] text-zinc-300 font-black uppercase tracking-[0.3em] pt-3">Version 1.0.4 • Getgoride</p>
      </div>
    </div>
  );
};

export default ProfilePage;
