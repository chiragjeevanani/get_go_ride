import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Package, Truck, Calendar, MapPin, 
  ChevronRight, ArrowRight, ShieldCheck, Star 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const FinalizationFlow = () => {
  const { requestId, vendorId } = useParams();
  const navigate = useNavigate();

  const vendor = {
    name: "Shiv Logistics",
    rating: 4.8,
    isVerified: true,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SL",
    quote: "₹3,500"
  };

  const request = {
    service: "House Shifting (1BHK)",
    pickup: "Borivali East, Mumbai",
    dropoff: "Powai, Mumbai",
    date: "09 April 2026",
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">
      <header className="text-center space-y-4 py-6">
        <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ type: "spring", damping: 12 }}
           className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm"
        >
           <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <div className="space-y-1">
           <h1 className="text-2xl font-bold text-black tracking-tight">Confirm Your Deal</h1>
           <p className="text-sm text-zinc-500">You are about to finalize with Shiv Logistics</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Deal Summary Card */}
        <Card className="border-none shadow-premium overflow-hidden bg-white">
           <CardContent className="p-0">
              {/* Vendor Hero in Card */}
              <div className="bg-zinc-50 p-6 flex items-center justify-between border-b border-zinc-100">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-zinc-200">
                       <AvatarImage src={vendor.avatar} />
                       <AvatarFallback>{vendor.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                       <div className="flex items-center gap-1">
                          <h4 className="font-bold text-black">{vendor.name}</h4>
                          {vendor.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary fill-primary/10" />}
                       </div>
                       <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-zinc-600">{vendor.rating}</span>
                          <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap px-1">• 124 Completed Jobs</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Total Quote</span>
                    <span className="text-xl font-black text-primary tracking-tight">{vendor.quote}</span>
                 </div>
              </div>

              {/* Details List */}
              <div className="p-6 space-y-5">
                 <div className="flex gap-4">
                    <div className="p-3 bg-primary text-black rounded-2xl h-fit">
                       <Package className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Service Requirement</p>
                        <p className="text-sm font-bold text-black">{request.service}</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="p-3 bg-black text-white rounded-2xl h-fit">
                       <MapPin className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Journey</p>
                        <p className="text-sm font-bold text-black line-clamp-1">{request.pickup}</p>
                        <ArrowRight className="w-3 h-3 text-zinc-300" />
                        <p className="text-sm font-bold text-black line-clamp-1">{request.dropoff}</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="p-3 bg-zinc-100 text-black rounded-2xl h-fit">
                       <Calendar className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Scheduled Date</p>
                        <p className="text-sm font-bold text-black">{request.date}</p>
                    </div>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Action and Terms */}
        <div className="space-y-4 pt-4">
           <div className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[11px] text-zinc-500">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                 By confirming this service, you agree to Safar Setto's <span className="text-primary underline">Escrow Terms</span> and <span className="text-primary underline">Service Policy</span>. Your payment is held securely and only released after service completion.
              </p>
           </div>
           
           <Button 
             className="w-full h-16 rounded-3xl bg-primary text-black text-lg font-black shadow-2xl shadow-primary/30 transition-transform active:scale-95"
             onClick={() => navigate("/user/requests")}
           >
              Confirm & Book Service
           </Button>
           
           <Button 
              variant="ghost" 
              className="w-full text-zinc-400 font-bold hover:bg-transparent h-fit p-1"
              onClick={() => navigate(-1)}
           >
              Cancel & Return to Chat
           </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalizationFlow;
