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

  const menuItems = [
    { icon: <Package className="w-5 h-5" />, label: "Order History", desc: "View all your past and active requests", path: "/user/requests" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Payments", desc: "Manage cards and payment methods", path: "/user/payments" },
    { icon: <MapPin className="w-5 h-5" />, label: "Saved Addresses", desc: "Quickly select frequent locations", path: "/user/addresses" },
    { icon: <Heart className="w-5 h-5" />, label: "Saved Vendors", desc: "Access your favorite service providers", path: "#" },
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", desc: "Control your alert preferences", path: "#" },
    { icon: <ShieldCheck className="w-5 h-5" />, label: "Security", desc: "Manage your account protection", path: "#" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Support", desc: "Get help with your requests", path: "/user/support" },
  ];

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Hero */}
      <header className="flex flex-col items-center gap-6 pt-6">
        <div className="relative">
           <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden ring-1 ring-zinc-100">
              <img src={user.avatar} alt="User Avatar" />
           </div>
           <Button size="icon" className="absolute bottom-1 right-1 rounded-full w-9 h-9 bg-primary shadow-lg border-2 border-white ring-1 ring-zinc-100">
              <Edit3 className="w-4 h-4 text-black" />
           </Button>
        </div>
        <div className="text-center space-y-1">
           <h1 className="text-2xl font-black text-black tracking-tight">{user.name}</h1>
           <p className="text-sm text-zinc-500 font-bold tracking-widest uppercase">{user.phone}</p>
            <div className="flex items-center justify-center gap-2 pt-2">
               <Badge className="bg-primary text-black hover:bg-primary border-none rounded-lg text-[10px] px-3 font-black tracking-widest uppercase">
                  {user.membership} Member
               </Badge>
            </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
         <Card className="border-none shadow-premium bg-white">
            <CardContent className="p-4 flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-black">{user.requests}</span>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Requests</span>
            </CardContent>
         </Card>
         <Card className="border-none shadow-premium bg-white">
            <CardContent className="p-4 flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-black">{user.saved}</span>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Saved Vendors</span>
            </CardContent>
         </Card>
      </div>

      {/* Quick Settings */}
      <div className="space-y-3">
         <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-widest px-1">Settings & Preferences</h3>
         <div className="space-y-2">
            {menuItems.map((item, idx) => (
               <Card 
                 key={idx} 
                 className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
                 onClick={() => navigate(item.path)}
               >
                  <CardContent className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-500 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                           {item.icon}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-black">{item.label}</span>
                           <span className="text-[10px] text-zinc-400 font-medium">{item.desc}</span>
                        </div>
                     </div>
                     <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>

      <div className="pt-4">
         <Button 
           variant="ghost" 
           className="w-full h-16 rounded-3xl text-red-500 border border-red-50 hover:bg-red-50 transition-colors font-bold group"
           onClick={() => navigate("/user/auth")}
         >
            <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
            Logout Account
         </Button>
         <p className="text-center text-[10px] text-zinc-300 font-bold uppercase tracking-[0.2em] pt-6">Version 1.0.4 • Safar Setto</p>
      </div>
    </div>
  );
};

export default ProfilePage;
