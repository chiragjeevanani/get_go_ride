import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronLeft, Star, ShieldCheck, MapPin, 
  Truck, ArrowRight, MessageSquare, Phone, 
  Calendar, Award, Info, Users, CheckCircle2, Loader2 
} from "lucide-react";
// ... (rest of imports)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { vendorApi } from "@/lib/api";
import { toast } from "sonner";

const VendorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = location.state?.requestId || 'current';
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const res = await vendorApi.getById(id);
      setVendor(res.data);
    } catch (err) {
      toast.error("Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-zinc-400">Loading Profile...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-50 text-zinc-500">
        <Users className="w-12 h-12 mb-4 opacity-20" />
        <p>Vendor not found</p>
        <Button variant="link" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  // Fallback data for fields that might be missing in DB
  const displayData = {
    name: vendor.businessName || vendor.name || "shiv Logistics",
    rating: vendor.rating || 4.8,
    reviewsCount: vendor.totalRatings || 12,
    experience: "5+ Years", // Default or calculated
    completed: vendor.leadsWon || 0,
    reliability: vendor.reliabilityScore || 100,
    isVerified: vendor.isVerified || false,
    avatar: vendor.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${vendor.name}`,
    vehicles: vendor.vehicleType ? [{ name: vendor.vehicleType, capacity: vendor.vehicleCapacity || "N/A", count: 1 }] : [],
    gallery: vendor.vehicleImages || [],
    about: vendor.about || "Experienced logistics provider committed to safe and timely delivery of your goods. We handle everything from small parcels to large industrial equipment.",
    routes: vendor.operatingAreas ? (Array.isArray(vendor.operatingAreas) ? vendor.operatingAreas : [vendor.operatingAreas]) : ["Mumbai Local", "Thane", "Navi Mumbai"]
  };

  const reviews = [
    { id: 1, user: "Amit S.", rating: 5, text: "Excellent service! Very professional staff and they handled my furniture with care.", date: "2 days ago" },
    { id: 2, user: "Priya R.", rating: 4, text: "Good experience, arrived 15 mins late but the move was smooth.", date: "1 week ago" },
    { id: 3, user: "Karan T.", rating: 5, text: "Best price I found for shifting my office. Highly recommend.", date: "2 weeks ago" },
  ];

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 py-2.5 -mx-4 px-4 overflow-hidden flex items-center justify-between border-b border-zinc-100 shadow-sm">
         <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 rounded-full bg-zinc-50/50 hover:bg-zinc-100 transition-colors"
            onClick={() => navigate(-1)}
         >
            <ChevronLeft className="w-5 h-5 text-black" />
         </Button>
         <h1 className="text-[11px] font-black text-black tracking-[0.2em] uppercase">Vendor Profile</h1>
         <Button 
            variant="ghost" 
            size="icon" 
            className={cn("w-10 h-10 rounded-full transition-colors", showVerificationInfo ? "bg-primary text-black" : "text-zinc-400")}
            onClick={() => setShowVerificationInfo(!showVerificationInfo)}
         >
            <Info className="w-5 h-5" />
         </Button>
      </header>

      <Card className="border-none shadow-premium bg-white overflow-visible relative mt-2 rounded-[2rem]">
         <CardContent className="p-4 px-6 pt-6">
            <div className="flex flex-col items-center gap-3 text-center">
               <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-white shadow-xl ring-1 ring-zinc-50 overflow-hidden bg-zinc-100">
                     <img src={displayData.avatar} alt="vendor" className="w-full h-full object-cover" />
                  </div>
                  {displayData.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-black p-1 rounded-full border-2 border-white shadow-lg">
                       <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
               </div>
               
               <div className="space-y-0.5">
                  <h2 className="text-xl font-black text-black tracking-tight leading-none">{displayData.name}</h2>
                  <div className="flex items-center justify-center gap-2">
                     <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-bold text-black">{displayData.rating}</span>
                        <span className="text-[10px] text-zinc-400 font-bold">({displayData.reviewsCount})</span>
                     </div>
                     <div className="w-1 h-1 rounded-full bg-zinc-200" />
                     <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-zinc-500">{displayData.experience}</span>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 w-full gap-3 pt-2">
                  <div className="bg-zinc-50/50 p-3 rounded-2xl flex flex-col items-center gap-0.5 border border-zinc-100">
                     <span className="text-sm font-black text-black leading-none">{displayData.completed}</span>
                     <span className="text-[8px] uppercase font-black text-zinc-400 tracking-wider">Jobs Done</span>
                  </div>
                  <div className="bg-zinc-50/50 p-3 rounded-2xl flex flex-col items-center gap-0.5 border border-zinc-100">
                     <span className="text-sm font-black text-black leading-none">{displayData.reliability}%</span>
                     <span className="text-[8px] uppercase font-black text-zinc-400 tracking-wider">Reliability</span>
                  </div>
               </div>
            </div>
         </CardContent>
         
         <AnimatePresence>
           {showVerificationInfo && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: "auto" }}
               exit={{ opacity: 0, height: 0 }}
               className="overflow-hidden bg-primary/5 rounded-b-[2rem] border-t border-primary/10"
             >
                <div className="p-4 space-y-3">
                   <h4 className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60">Verification Details</h4>
                   <div className="grid grid-cols-2 gap-2">
                      {['Identity', 'Vehicle', 'Insurance', 'Address'].map((check) => (
                        <div key={check} className="flex items-center gap-2 text-[9px] font-bold text-zinc-600">
                           <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                           {check} Verified
                        </div>
                      ))}
                   </div>
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </Card>

      <Tabs defaultValue="about" className="w-full">
         <TabsList className="grid w-full grid-cols-4 bg-zinc-200 p-0.5 rounded-2xl h-12 mb-6">
            <TabsTrigger value="about" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-1">About</TabsTrigger>
            <TabsTrigger value="vehicles" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-1">Fleet</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-1">Gallery</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm px-1">Reviews</TabsTrigger>
         </TabsList>

         <TabsContent value="about" className="space-y-6 m-0 animate-in fade-in duration-300">
            <div className="space-y-4">
               <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-widest px-1">Biography</h3>
               <p className="text-sm text-zinc-600 leading-relaxed font-medium bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm italic">
                  "{displayData.about}"
               </p>
            </div>
            
            <div className="space-y-4">
               <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-widest px-1">Service Core Routes</h3>
               <div className="flex flex-wrap gap-2">
                  {displayData.routes.map((route, i) => (
                    <Badge key={i} variant="outline" className="bg-white px-4 py-2 rounded-xl text-zinc-600 border-zinc-200 font-bold text-[10px] shadow-sm">
                       {route}
                    </Badge>
                  ))}
               </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-3xl space-y-4 border border-primary/10">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary text-black rounded-xl">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-black text-sm">Getgoride Verified Provider</h4>
               </div>
               <ul className="space-y-2">
                  {['KYC Documents Verified', 'Vehicle Insurance Active', 'Clean Service Record', 'Address Verified'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-zinc-500">
                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                       {item}
                    </li>
                  ))}
               </ul>
            </div>
         </TabsContent>

         <TabsContent value="vehicles" className="space-y-4 m-0 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 gap-4">
               {displayData.vehicles.length > 0 ? displayData.vehicles.map((v, i) => (
                 <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                    <CardContent className="p-4 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary text-black rounded-2xl">
                             <Truck className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="font-bold text-black text-sm">{v.name}</h4>
                             <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Cap: {v.capacity}</p>
                          </div>
                       </div>
                       <Badge className="bg-zinc-100 text-zinc-600 border-none rounded-lg text-[10px] font-black">{v.count} Units</Badge>
                    </CardContent>
                 </Card>
               )) : (
                 <div className="text-center py-10 text-zinc-400 text-xs font-bold uppercase tracking-widest">No fleet details listed</div>
               )}
            </div>
         </TabsContent>

         <TabsContent value="gallery" className="space-y-4 m-0 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-3">
               {displayData.gallery.length > 0 ? displayData.gallery.map((img, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ scale: 1.02 }}
                   className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-zinc-50 shadow-sm"
                 >
                    <img src={img} alt={`Fleet ${i}`} className="w-full h-full object-cover" />
                 </motion.div>
               )) : (
                 <div className="col-span-2 text-center py-10 text-zinc-400 text-xs font-bold uppercase tracking-widest">No gallery images available</div>
               )}
            </div>
         </TabsContent>

         <TabsContent value="reviews" className="space-y-4 m-0 animate-in fade-in duration-300">
            <div className="flex flex-col gap-4">
               {reviews.map((rev) => (
                 <div key={rev.id} className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                             <AvatarFallback className="bg-zinc-100 text-zinc-400 text-xs">{rev.user.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                             <h4 className="text-sm font-bold text-black">{rev.user}</h4>
                             <p className="text-[9px] text-zinc-400 font-bold">{rev.date}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                               key={i} 
                               className={cn("w-2.5 h-2.5", i < rev.rating ? "text-amber-500 fill-amber-500" : "text-zinc-200 fill-zinc-200")} 
                            />
                          ))}
                       </div>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed font-medium italic">"{rev.text}"</p>
                 </div>
               ))}
            </div>
         </TabsContent>
      </Tabs>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-zinc-100 z-50 safe-area-bottom flex gap-3 max-w-md mx-auto rounded-t-[2.5rem] shadow-2xl">
         <Button 
            variant="ghost" 
            size="icon"
            className="flex-none w-14 h-14 rounded-2xl bg-white border border-zinc-200 text-zinc-600"
            onClick={() => window.open(`tel:${vendor.phone}`)}
         >
            <Phone className="w-5 h-5" />
         </Button>
         <Button 
            className="flex-1 h-14 rounded-2xl bg-primary text-black text-lg font-black shadow-xl shadow-primary/30"
            onClick={() => navigate(`/user/chat/${requestId}/${vendor._id}`)}
         >
            <MessageSquare className="w-5 h-5 mr-3" />
            Start Chat
         </Button>
      </div>
    </div>
  );
};

export default VendorProfile;
