import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Package, MapPin, Calendar, Clock, 
  Star, MessageSquare, ShieldCheck, TrendingUp, Info, 
  Phone, Mail, CheckCircle2, ChevronRight, X 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("responses");

  // Mock data for a single request
  const request = {
    id: id || "REQ-101",
    service: "House Shifting",
    status: "Responding",
    progress: 40,
    date: "09 April 2026",
    pickup: "Borivali East, Mumbai",
    dropoff: "Powai, Mumbai",
    vehicle: "Mini Truck",
    load: "500kg Approx",
    notes: "Fragile electronics including 55-inch TV. Need 2 laborers.",
  };

  const vendors = [
    {
      id: "V-201",
      name: "Shiv Logistics",
      rating: 4.8,
      reviews: 124,
      isVerified: true,
      price: "₹3,500",
      time: "20m ago",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SL",
      bestValue: true,
    },
    {
      id: "V-202",
      name: "FastMove Packers",
      rating: 4.5,
      reviews: 89,
      isVerified: true,
      price: "₹4,200",
      time: "45m ago",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FP",
      bestValue: false,
    },
    {
      id: "V-203",
      name: "Maan Movers",
      rating: 4.2,
      reviews: 56,
      isVerified: false,
      price: "₹3,200",
      time: "1h ago",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MM",
      bestValue: false,
    }
  ];

  const timeline = [
    { label: "Posted", time: "Today, 10:00 AM", done: true },
    { label: "Verified", time: "Today, 10:05 AM", done: true },
    { label: "Vendors Responding", time: "Active", done: false, current: true },
    { label: "Negotiation", time: "Pending", done: false },
    { label: "Finalized", time: "Pending", done: false },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Navigation Header */}
      <header className="flex items-center gap-4 sticky top-0 bg-zinc-50/80 backdrop-blur-md z-30 py-2 -mx-4 px-4 overflow-hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white shadow-sm border border-zinc-100"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-black leading-tight">Request Details</h1>
          <p className="text-xs text-zinc-500">#{request.id} • {request.service}</p>
        </div>
      </header>

      {/* Tracking Visualization */}
      <Card className="border-none shadow-premium overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
               <Package className="w-5 h-5 text-primary" />
               <span className="font-bold text-black">Status</span>
            </div>
            <Badge variant="info" className="rounded-lg">{request.status}</Badge>
          </div>
          
          <div className="space-y-6">
             <div className="relative">
                <Progress value={request.progress} className="h-1 bg-zinc-100" />
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm"></div>
                <div className="absolute top-1/2 left-[40%] -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm ring-4 ring-primary/10"></div>
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-200 border-2 border-white shadow-sm"></div>
             </div>

             <div className="grid grid-cols-1 gap-4">
               {timeline.slice(0, 3).map((item, idx) => (
                 <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10",
                          item.done ? "bg-emerald-500 text-white" : item.current ? "bg-primary text-black" : "bg-zinc-100 text-zinc-400"
                       )}>
                          {item.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                       </div>
                       {idx < 2 && <div className="w-0.5 h-full bg-zinc-100 -my-1"></div>}
                    </div>
                    <div className="flex-1 pb-4 border-b border-zinc-50 last:border-none">
                       <p className={cn("text-xs font-bold leading-tight", item.current ? "text-primary" : "text-black")}>{item.label}</p>
                       <p className="text-[10px] text-zinc-400">{item.time}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="responses" className="w-full" onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-2 bg-zinc-200 p-0.5 rounded-2xl h-11 mb-6">
          <TabsTrigger value="responses" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
            Responses ({vendors.length})
          </TabsTrigger>
          <TabsTrigger value="details" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold">
            Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-4 m-0 overflow-hidden">
          {vendors.map((vendor, index) => (
             <motion.div
               key={vendor.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.1 }}
             >
               <Card className={cn(
                  "border-none shadow-premium hover:shadow-lg transition-all relative overflow-hidden group",
                  vendor.bestValue ? "ring-2 ring-primary/20" : ""
               )}>
                 {vendor.bestValue && (
                    <div className="absolute top-0 right-0 py-1 px-3 bg-primary text-black text-[9px] font-bold uppercase rounded-bl-xl tracking-tighter">
                       Best Value
                    </div>
                 )}
                 <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src={vendor.avatar} />
                          <AvatarFallback>{vendor.name.substring(0, 2)}</AvatarFallback>
                       </Avatar>
                       <div className="flex-1">
                          <div className="flex items-center gap-1">
                             <h4 className="font-bold text-black text-sm">{vendor.name}</h4>
                             {vendor.isVerified && <ShieldCheck className="w-4 h-4 text-primary fill-primary/10" />}
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-bold">{vendor.rating}</span>
                                <span className="text-[10px] text-zinc-400">({vendor.reviews} reviews)</span>
                             </div>
                             <span className="text-[10px] text-zinc-400 italic">Responded {vendor.time}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between bg-primary/5 rounded-2xl p-3 border border-primary/10">
                       <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Estimated Price</span>
                          <span className="text-lg font-black text-primary">{vendor.price}</span>
                       </div>
                       <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-primary hover:bg-transparent h-fit p-0 gap-1 text-xs font-bold"
                          onClick={() => navigate(`/user/vendor-profile/${vendor.id}`)}
                       >
                          View Profile <ChevronRight className="w-4 h-4" />
                       </Button>
                    </div>

                    <div className="flex gap-2">
                       <Button 
                          className="flex-1 rounded-xl bg-white border border-zinc-200 text-black hover:bg-zinc-50 shadow-sm"
                          onClick={() => navigate(`/user/chat/${request.id}/${vendor.id}`)}
                       >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                       </Button>
                       <Button 
                          className="flex-1 rounded-xl shadow-lg shadow-primary/20"
                          onClick={() => navigate(`/user/finalize/${request.id}/${vendor.id}`)}
                       >
                          Select Vendor
                       </Button>
                    </div>
                 </CardContent>
               </Card>
             </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="details" className="space-y-6 m-0 animate-in fade-in duration-300">
           <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6 space-y-6">
                 <div className="space-y-4">
                    <h3 className="font-bold text-black text-sm uppercase tracking-wider">Journey Details</h3>
                    <div className="space-y-4">
                       <div className="flex gap-3">
                          <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                          <div className="space-y-0.5">
                             <p className="text-[10px] uppercase font-bold text-zinc-400">Pickup</p>
                             <p className="text-sm font-semibold">{request.pickup}</p>
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                          <div className="space-y-0.5">
                             <p className="text-[10px] uppercase font-bold text-zinc-400">Destination</p>
                             <p className="text-sm font-semibold">{request.dropoff}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <Separator />

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-zinc-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Date</span>
                       </div>
                       <p className="text-sm font-bold text-black">{request.date}</p>
                    </div>
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-zinc-400">
                          <Package className="w-4 h-4" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Load</span>
                       </div>
                       <p className="text-sm font-bold text-black">{request.load}</p>
                    </div>
                 </div>

                 <Separator />

                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                       <Info className="w-4 h-4" />
                       <span className="text-[10px] uppercase font-bold tracking-wider">Additional Notes</span>
                    </div>
                    <p className="text-sm italic text-zinc-600 bg-zinc-50 p-4 rounded-2xl border border-dashed border-zinc-200 leading-relaxed font-medium">
                       "{request.notes}"
                    </p>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestDetails;
