import React, { useState, useRef, useEffect } from "react";
import { 
  User, Car, MapPin, IndianRupee, Camera, FileText,
  ChevronRight, CheckCircle, ShieldCheck, LogOut, Edit3, Settings,
  BarChart2, Star, Zap, Bell, Shield, HelpCircle, X, Loader2, Plus, Check, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";
import { categoryApi, vehicleApi, vendorApi, paymentApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import { toast } from "sonner";
import profileImg from "@/assets/profile.jpg";

const DriverProfile = () => {
  const navigate = useNavigate();
  const { driver, setDriver } = useDriverState();
  const fileInputRef = useRef(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [backendCategories, setBackendCategories] = useState([]);
  const [backendVehicles, setBackendVehicles] = useState([]);

  const [editForm, setEditForm] = useState({
    name: "",
    nativeCity: "",
    vehicleType: "",
    regNumber: "",
    capacity: "",
    categories: [],
    areas: ""
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await categoryApi.getAll();
        const vehRes = await vehicleApi.getAll();
        setBackendCategories(catRes.data || []);
        setBackendVehicles(vehRes.data || []);
      } catch (err) {
        console.error("Failed to load edit profile metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          toast.loading("Updating profile image...", { id: "avatar-update" });
          const res = await vendorApi.updateProfile({ profileImage: reader.result });
          storage.setDriver(res.data);
          setDriver(res.data);
          toast.success("Profile photo updated successfully!", { id: "avatar-update" });
        } catch (err) {
          toast.error("Failed to update profile photo", { id: "avatar-update" });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: driver.name || "",
      nativeCity: driver.nativeCity || "",
      vehicleType: driver.vehicleType || "",
      regNumber: driver.vehicleRegNumber || "",
      capacity: driver.vehicleCapacity || "",
      categories: driver.serviceCategories || [],
      areas: driver.operatingAreas || ""
    });
    setIsEditModalOpen(true);
  };

  const toggleCategoryInEdit = (catSlug) => {
    setEditForm(prev => {
      const exists = prev.categories.includes(catSlug);
      const updated = exists 
        ? prev.categories.filter(c => c !== catSlug)
        : [...prev.categories, catSlug];
      return { ...prev, categories: updated };
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error("Driver Name is required");
      return;
    }
    if (editForm.categories.length === 0) {
      toast.error("At least one operating category must be selected");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: editForm.name.trim(),
        nativeCity: editForm.nativeCity.trim(),
        vehicleType: editForm.vehicleType,
        vehicleRegNumber: editForm.regNumber.toUpperCase(),
        vehicleCapacity: editForm.capacity,
        serviceCategories: editForm.categories,
        operatingAreas: editForm.areas,
        location: editForm.areas || driver.location
      };

      const res = await vendorApi.submitOnboarding(payload);
      storage.setDriver(res.data);
      setDriver(res.data);
      
      toast.success("Profile details updated successfully!");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to update profile details");
    } finally {
      setSubmitting(false);
    }
  };

  const avatar = driver.profileImage || profileImg;

  const menuItems = [
    { icon: <Car className="w-4 h-4" />, label: "Vehicle Details", desc: `${driver.vehicleType || "Not configured"} • ${driver.vehicleRegNumber || "No Reg"}`, path: "/driver/profile/vehicle" },
    { icon: <IndianRupee className="w-4 h-4" />, label: "Pricing & Service Areas", desc: driver.operatingAreas || "Set operating cities", path: "#", onClick: openEditModal },
    { 
      icon: <IndianRupee className="w-4 h-4" />, 
      label: "My Wallet & Earnings", 
      desc: `Active Balance: ₹${(driver.wallet?.activeBalance || 0).toLocaleString('en-IN')}`, 
      path: "/driver/earnings" 
    },
    { 
      icon: <Zap className="w-4 h-4" />, 
      label: "Upcoming Gigs", 
      desc: "View active gig work orders", 
      path: "/driver/gigs"
    },
    { 
      icon: <History className="w-4 h-4" />, 
      label: "Gig History", 
      desc: "Completed fleet jobs record", 
      path: "/driver/history" 
    },
    { 
      icon: <ShieldCheck className="w-4 h-4" />, 
      label: "Subscription", 
      desc: driver.subscriptionStatus === "Active" && driver.activeSubscription
        ? `${driver.activeSubscription.name || "Active Plan"}`
        : `Status: ${driver.subscriptionStatus || "None"}`, 
      path: "/driver/subscribe" 
    },
    { icon: <HelpCircle className="w-4 h-4" />, label: "Help & Support", desc: "FAQs & Fleet Assistance", path: "/driver/profile/support" },
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
           <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden ring-1 ring-zinc-100 bg-zinc-50 flex items-center justify-center">
              <img src={avatar} alt="Driver Avatar" className="w-full h-full object-cover" />
           </div>
           <Button 
            onClick={() => fileInputRef.current.click()}
            size="icon" 
            className="absolute bottom-0 right-0 rounded-full w-6 h-6 bg-primary shadow-lg border-2 border-white ring-1 ring-zinc-100 active:scale-90 transition-transform hover:bg-primary/95"
           >
              <Camera className="w-2.5 h-2.5 text-black" />
           </Button>
        </div>
        <div className="text-center space-y-0.5 relative">
           <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{driver.name || "Unnamed Driver"}</h1>
           <p className="text-xs text-zinc-500 font-semibold tracking-tight">{driver.phone}</p>
            <div className="flex items-center justify-center pt-2 gap-2">
               <Badge className={cn(
                 "border-none rounded-lg text-[10px] px-3 py-0.5 font-bold tracking-tight",
                 driver.isVerified ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
               )}>
                  {driver.isVerified ? "Verified Driver" : "Verification Pending"}
               </Badge>
               <Badge className="bg-primary text-zinc-900 hover:bg-primary border-none rounded-lg text-[10px] px-3 py-0.5 font-bold tracking-tight">
                  {driver.rating || 5} ★
               </Badge>
            </div>
         </div>
      </div>

      {/* Edit Profile Action Trigger */}
      <div className="flex justify-center pt-1.5 pb-2">
        <Button
          onClick={openEditModal}
          variant="outline"
          size="sm"
          className="h-8 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Profile Details
        </Button>
      </div>

      {/* Completion Meter Section */}
      <div className="px-1 space-y-2.5">
        <Card className="border-2 border-primary/10 shadow-sm bg-white rounded-xl overflow-hidden p-3 space-y-2">
           <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-zinc-700 tracking-tight">Profile Status</span>
              <span className="text-[10px] font-bold text-primary uppercase">Onboarding Active</span>
           </div>
           <Progress value={driver.onboardingComplete ? 100 : 50} className="h-1.5 bg-primary/5" />
        </Card>

        {/* Verification Docs Summary Card */}
        <Card 
          className="border-none shadow-sm bg-zinc-50/50 rounded-xl overflow-hidden p-3 cursor-pointer hover:bg-zinc-100 transition-colors"
          onClick={() => navigate("/driver/profile/vehicle")}
        >
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <ShieldCheck className="w-4 h-4" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tight">Verification Documents</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                       {driver.documents?.filter(d => d.status === 'Verified').length || 0} / {driver.documents?.length || 0} Docs Approved
                    </span>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex -space-x-1.5">
                    {driver.documents?.slice(0, 3).map((doc, i) => (
                       <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-zinc-200 flex items-center justify-center">
                          <FileText className="w-2.5 h-2.5 text-zinc-500" />
                       </div>
                    ))}
                 </div>
                 <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
              </div>
           </div>
        </Card>
      </div>

      {/* Active Subscription Plan Summary */}
      {driver.subscriptionStatus === "Active" && driver.activeSubscription && (
        <div className="px-1">
          <Card className="border-2 border-primary bg-primary/5 shadow-sm rounded-xl overflow-hidden p-3.5 space-y-2 relative">
             <div className="absolute top-3.5 right-3.5">
               <Badge className="bg-primary text-zinc-950 hover:bg-primary font-black text-[8px] uppercase tracking-wider rounded-md border-none px-2 py-0.5">
                 Active
               </Badge>
             </div>
             <div className="space-y-0.5">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Your Subscribed Plan</span>
                <h4 className="text-sm font-black text-zinc-950 leading-tight flex items-center gap-1.5 pt-0.5">
                  <ShieldCheck className="w-4 h-4 text-zinc-900" />
                  {driver.activeSubscription.name}
                </h4>
             </div>
             
             <div className="flex justify-between items-center pt-1.5 text-[9px] text-zinc-600 font-bold uppercase tracking-tight">
                <div className="flex items-center gap-1">
                   <span className="text-zinc-400">Expires:</span>
                   <span className="text-zinc-900">
                     {driver.subscriptionExpiresAt 
                       ? new Date(driver.subscriptionExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                       : 'N/A'}
                   </span>
                </div>
                <div>
                   <span className="text-zinc-400">Quota:</span>
                   <span className="text-zinc-900 ml-1">
                     {driver.activeSubscription.leadQuota?.type === 'unlimited' ? 'Unlimited' : `${driver.activeSubscription.leadQuota?.limit || 0} / Day`}
                   </span>
                </div>
             </div>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
         <Card className="border-2 border-primary/5 shadow-sm bg-zinc-50/30 rounded-xl overflow-hidden">
            <CardContent className="p-3 flex flex-col items-center">
                 <span className="text-xl font-bold text-zinc-900">{driver.leadsWon || 0}</span>
                 <span className="text-[10px] font-bold text-zinc-500 tracking-tight">Won Leads</span>
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
                 onClick={item.onClick ? item.onClick : () => navigate(item.path)}
               >
                  <CardContent className="p-3 flex items-center justify-between">
                     <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 bg-white rounded-xl text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-zinc-100 shadow-sm flex items-center justify-center">
                           {item.icon}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[11px] font-bold text-zinc-900 tracking-tight">{item.label}</span>
                           <span className="text-[9px] text-zinc-500 font-semibold tracking-tight leading-tight mt-0.5">{item.desc}</span>
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
           onClick={() => {
              localStorage.removeItem("gtgl_driver_token");
              localStorage.removeItem("gtgl_driver_refresh_token");
              localStorage.removeItem("gtgl_driver");
              toast.success("Logged out successfully");
              navigate("/driver/auth");
           }}
         >
            <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
            Logout Account
         </Button>
         <p className="text-center text-[8px] text-zinc-400 font-bold tracking-tight pt-4 italic">Version 1.0.42 Beta • GetGoLoad</p>
      </div>

      {/* Edit Profile Premium Bottom Overlay Panel */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col justify-end">
            {/* Dark glass backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sliding Drawer Content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative z-10 bg-white border-t border-zinc-100 rounded-t-[2rem] shadow-2xl max-w-md mx-auto w-full flex flex-col max-h-[85vh]"
            >
              {/* Drawer handle */}
              <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto my-3 shrink-0" />

              {/* Drawer Header */}
              <div className="flex justify-between items-center px-6 pb-4 border-b border-zinc-100">
                <div>
                   <h2 className="text-base font-black text-zinc-900 uppercase tracking-tight">Edit Profile</h2>
                   <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Manage Your Fleet Profile</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border border-zinc-100"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Form Content Area */}
              <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
                
                {/* Section: Personal Information */}
                <div className="space-y-3">
                  <h4 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-0.5 border-l-2 border-primary pl-2">Personal Information</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-tight ml-1">Full Name</label>
                    <Input 
                      type="text"
                      required
                      placeholder="Enter Full Name"
                      className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-black text-xs focus:border-primary shadow-sm"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-tight ml-1">Native City</label>
                    <Input 
                      type="text"
                      placeholder="Enter City (e.g. Indore)"
                      className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-black text-xs focus:border-primary shadow-sm"
                      value={editForm.nativeCity}
                      onChange={(e) => setEditForm({ ...editForm, nativeCity: e.target.value })}
                    />
                  </div>
                </div>

                {/* Section: Fleet & Vehicle Settings */}
                <div className="space-y-3.5 pt-1">
                  <h4 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-0.5 border-l-2 border-primary pl-2">Fleet & Vehicle Settings</h4>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-tight ml-1">Vehicle Model</label>
                    <select
                      className="w-full h-11 bg-zinc-50 border border-zinc-100 rounded-xl px-3 text-xs font-bold text-black focus:outline-none focus:border-primary shadow-sm"
                      value={editForm.vehicleType}
                      onChange={(e) => {
                        const selectedModel = backendVehicles.find(v => v.name === e.target.value);
                        setEditForm({
                          ...editForm,
                          vehicleType: e.target.value,
                          capacity: selectedModel ? selectedModel.capacity : editForm.capacity,
                          categories: selectedModel ? (selectedModel.categorySlugs || [selectedModel.categorySlug]) : editForm.categories
                        });
                      }}
                    >
                      <option value="" disabled>Select Vehicle Type</option>
                      {backendVehicles.map(v => (
                        <option key={v._id} value={v.name}>{v.name} ({v.capacity})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-tight ml-1">Reg Number</label>
                      <Input 
                        type="text"
                        placeholder="MP-18-CJ-1234"
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-black text-xs focus:border-primary shadow-sm uppercase"
                        value={editForm.regNumber}
                        onChange={(e) => setEditForm({ ...editForm, regNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-tight ml-1">Load Capacity</label>
                      <Input 
                        type="text"
                        placeholder="e.g. 1.5 Tonnes"
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-black text-xs focus:border-primary shadow-sm"
                        value={editForm.capacity}
                        onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Operating Categories */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                     <h4 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-0.5 border-l-2 border-primary pl-2">Services & Operations</h4>
                     <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-tight ml-0.5">Toggle operating service scopes</label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {backendCategories.map(cat => {
                      const isSelected = editForm.categories.includes(cat.slug);
                      return (
                        <div 
                          key={cat._id}
                          onClick={() => toggleCategoryInEdit(cat.slug)}
                          className={cn(
                            "p-2.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer select-none",
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"
                          )}
                        >
                          <span className="text-[10px] font-black text-zinc-950">{cat.name}</span>
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center border transition-all shrink-0 ml-1.5",
                            isSelected ? "bg-primary border-primary text-zinc-900" : "bg-white border-zinc-200 text-transparent"
                          )}>
                            <Check className="w-2.5 h-2.5" strokeWidth={4} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5 pt-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-tight ml-1">Operating Areas / Routes</label>
                    <textarea 
                      placeholder="e.g. Indore to Bhopal, Ujjain"
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs font-bold text-black focus:outline-none focus:border-primary shadow-sm resize-none"
                      value={editForm.areas}
                      onChange={(e) => setEditForm({ ...editForm, areas: e.target.value })}
                    />
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-4 pb-2">
                  <Button 
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-zinc-900 font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Save Profile Details
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DriverProfile;
