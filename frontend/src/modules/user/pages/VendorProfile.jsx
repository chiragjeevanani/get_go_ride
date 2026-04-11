import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Star, ShieldCheck, MapPin, 
  Truck, ArrowRight, MessageSquare, Phone, 
  Calendar, Award, Info, Users, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

const VendorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const vendor = {
    id: id || "V-201",
    name: "Shiv Logistics",
    rating: 4.8,
    reviews: [
      { id: 1, user: "Amit S.", rating: 5, text: "Excellent service! Very professional staff and they handled my furniture with care.", date: "2 days ago" },
      { id: 2, user: "Priya R.", rating: 4, text: "Good experience, arrived 15 mins late but the move was smooth.", date: "1 week ago" },
      { id: 3, user: "Karan T.", rating: 5, text: "Best price I found for shifting my office. Highly recommend.", date: "2 weeks ago" },
    ],
    experience: "8+ Years",
    completed: "1,240+",
    isVerified: true,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SL",
    vehicles: [
      { name: "Tata Ace", capacity: "750kg", count: 4 },
      { name: "Mahindra Bolero", capacity: "1.2T", count: 2 },
      { name: "Eicher 14ft", capacity: "2.5T", count: 1 },
    ],
    topRoutes: ["Mumbai - Pune", "Navi Mumbai - Thane", "Borivali - Mira Road"],
    about: "Shiv Logistics is a premier transport service provider in Mumbai. We specialize in household shifting, office relocation, and industrial goods transport with our fleet of well-maintained vehicles and trained staff."
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Sticky Container */}
      <header className="sticky top-0 bg-zinc-50/80 backdrop-blur-md z-40 py-2 -mx-4 px-4 overflow-hidden flex items-center justify-between">
         <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white shadow-sm border border-zinc-100"
            onClick={() => navigate(-1)}
         >
            <ChevronLeft className="w-6 h-6" />
         </Button>
         <h1 className="text-sm font-bold text-black tracking-widest uppercase">Vendor Profile</h1>
         <Button variant="ghost" size="icon" className="rounded-full text-zinc-400">
            <Info className="w-5 h-5" />
         </Button>
      </header>

      {/* Hero Profile Info */}
      <Card className="border-none shadow-premium bg-white overflow-visible relative mt-4">
         <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
               <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl ring-1 ring-zinc-100">
                     <AvatarImage src={vendor.avatar} />
                     <AvatarFallback>{vendor.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  {vendor.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-black p-1 rounded-full border-2 border-white shadow-lg">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
               </div>
               
               <div className="space-y-1">
                  <h2 className="text-2xl font-black text-black tracking-tight">{vendor.name}</h2>
                  <div className="flex items-center justify-center gap-3">
                     <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-black">{vendor.rating}</span>
                        <span className="text-xs text-zinc-400">({vendor.reviews.length} reviews)</span>
                     </div>
                     <Separator orientation="vertical" className="h-3 bg-zinc-200" />
                     <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-zinc-600">{vendor.experience}</span>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 w-full gap-4 pt-4">
                  <div className="bg-zinc-50 p-4 rounded-3xl flex flex-col items-center gap-1 border border-zinc-100">
                     <span className="text-lg font-black text-black leading-none">{vendor.completed}</span>
                     <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Jobs Done</span>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-3xl flex flex-col items-center gap-1 border border-zinc-100">
                     <span className="text-lg font-black text-black leading-none">98%</span>
                     <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Reliability</span>
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="about" className="w-full">
         <TabsList className="grid w-full grid-cols-3 bg-zinc-200 p-0.5 rounded-2xl h-12 mb-6">
            <TabsTrigger value="about" className="rounded-xl text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">About</TabsTrigger>
            <TabsTrigger value="vehicles" className="rounded-xl text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Fleet</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Reviews</TabsTrigger>
         </TabsList>

         <TabsContent value="about" className="space-y-6 m-0 animate-in fade-in duration-300">
            <div className="space-y-4">
               <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-widest px-1">Biography</h3>
               <p className="text-sm text-zinc-600 leading-relaxed font-medium bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm italic">
                  "{vendor.about}"
               </p>
            </div>
            
            <div className="space-y-4">
               <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-widest px-1">Service Core Routes</h3>
               <div className="flex flex-wrap gap-2">
                  {vendor.topRoutes.map((route, i) => (
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
                  <h4 className="font-bold text-black text-sm">Safar Verified Provider</h4>
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
               {vendor.vehicles.map((v, i) => (
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
               ))}
            </div>
         </TabsContent>

         <TabsContent value="reviews" className="space-y-4 m-0 animate-in fade-in duration-300">
            <div className="flex flex-col gap-4">
               {vendor.reviews.map((rev) => (
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
            <Button variant="ghost" className="w-full text-primary font-black uppercase text-[10px] tracking-widest pt-4">Load More Reviews</Button>
         </TabsContent>
      </Tabs>

      {/* Floating Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-zinc-100 z-50 safe-area-bottom flex gap-3 max-w-md mx-auto rounded-t-[2.5rem] shadow-2xl">
         <Button 
            variant="ghost" 
            size="icon"
            className="flex-none w-14 h-14 rounded-2xl bg-white border border-zinc-200 text-zinc-600"
         >
            <Phone className="w-5 h-5" />
         </Button>
         <Button 
            className="flex-1 h-14 rounded-2xl bg-primary text-black text-lg font-black shadow-xl shadow-primary/30"
            onClick={() => navigate(`/user/chat/current/V-201`)}
         >
            <MessageSquare className="w-5 h-5 mr-3" />
            Start Chat
         </Button>
      </div>
    </div>
  );
};

export default VendorProfile;
