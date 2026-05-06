import React from "react";
import { 
  User, Settings, Package, Heart, CreditCard, 
  HelpCircle, LogOut, ChevronRight, Edit3, 
  ShieldCheck, Bell, MapPin, Wallet 
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "@/lib/api";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import profileImg from "@/assets/profile.jpg";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({ name: "", phone: "" });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const [avatar, setAvatar] = useState(profileImg);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userApi.getProfile();
      setUserData(res.data);
      setAvatar(res.data.profileImage || profileImg);
      setLoading(false);
    } catch (err) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem('gtgl_token');
      localStorage.removeItem('gtgl_refresh_token');
      localStorage.removeItem('gtgl_user');
      navigate("/user/auth");
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const validatePhone = (phone) => {
    // Basic validation for Indian phone numbers: +91 followed by 10 digits or just 10 digits
    const regex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    return regex.test(phone.replace(/\s/g, ""));
  };

  const handleSaveProfile = async () => {
    let newErrors = { name: "", phone: "" };
    let hasError = false;

    if (!editData.name.trim()) {
      newErrors.name = "Name is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await userApi.updateProfile({ 
        name: editData.name,
        profileImage: avatar === profileImg ? "" : avatar 
      });
      setUserData(res.data);
      localStorage.setItem('gtgl_user', JSON.stringify(res.data));
      setIsEditDialogOpen(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const menuItems = [
    { icon: <Package className="w-4 h-4" />, label: "Order History", desc: "View past and active requests", path: "/user/requests" },
    { icon: <CreditCard className="w-4 h-4" />, label: "Payments", desc: "Manage cards and methods", path: "/user/payments" },
    { icon: <MapPin className="w-4 h-4" />, label: "Addresses", desc: "Select frequent locations", path: "/user/addresses" },
    { icon: <Wallet className="w-4 h-4" />, label: "Wallet", desc: "Manage coins & balance", path: "/user/wallet" },
    { icon: <HelpCircle className="w-4 h-4" />, label: "Support", desc: "Get help with requests", path: "/user/support" },
  ];

  if (loading) return <div className="flex justify-center items-center h-screen font-black uppercase text-[10px] tracking-widest">Loading Profile...</div>;
  if (!userData) return <div className="flex justify-center items-center h-screen font-black uppercase text-[10px] tracking-widest">Profile not found</div>;

  return (
    <div className="px-4 space-y-3 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
           <div className="flex items-center justify-center gap-2">
              <h1 className="text-lg font-black text-black tracking-tighter uppercase italic">{userData.name}</h1>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-zinc-100" 
                    onClick={() => {
                      setEditData({ name: userData.name, phone: userData.phone });
                    }}
                  >
                    <Edit3 className="w-3 h-3 text-zinc-400" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%] max-w-sm rounded-2xl bg-white p-6 border-none shadow-2xl">
                  <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">Edit Profile</DialogTitle>
                    <DialogDescription className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                      Update your personal information to keep your profile current.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Full Name</Label>
                        {errors.name && <span className="text-[8px] font-bold text-rose-500 uppercase">{errors.name}</span>}
                      </div>
                      <Input 
                        value={editData.name}
                        onChange={(e) => {
                          setEditData({ ...editData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        className={cn(
                          "h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-xs transition-all",
                          errors.name && "border-rose-500 bg-rose-50/30"
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Phone Number</Label>
                        {errors.phone && <span className="text-[8px] font-bold text-rose-500 uppercase">{errors.phone}</span>}
                      </div>
                      <Input 
                        value={editData.phone}
                        disabled
                        className="h-11 rounded-xl bg-zinc-100 border-zinc-100 font-bold text-xs text-zinc-400 cursor-not-allowed"
                      />
                      <p className="text-[8px] font-bold text-zinc-300 uppercase px-1">Phone number cannot be changed</p>
                    </div>
                  </div>
                  <DialogFooter className="flex-row gap-2 pt-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setErrors({ name: "", phone: "" });
                      }}
                      className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-100"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      className="flex-1 h-11 rounded-xl bg-primary text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
           </div>
           <p className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">{userData.phone}</p>
            <div className="flex items-center justify-center pt-1.5">
               <Badge className="bg-primary text-black hover:bg-primary border-none rounded-md text-[9px] px-2.5 py-0.5 font-black tracking-widest uppercase">
                  {userData.wallet?.balance > 500 ? "Gold" : "Standard"} Member
               </Badge>
            </div>
         </div>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
     <div className="grid grid-cols-2 gap-2.5">
         <Card className="border-2 border-primary/10 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardContent className="p-2.5 flex flex-col items-center">
                <span className="text-lg font-black text-black">{userData.requirementsCount || 0}</span>
                <span className="text-[8px] uppercase font-black text-zinc-400 tracking-widest">Total Requests</span>
            </CardContent>
         </Card>
         <Card className="border-2 border-primary/10 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardContent className="p-2.5 flex flex-col items-center">
                <span className="text-lg font-black text-black">{userData.savedVendorsCount || 0}</span>
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
