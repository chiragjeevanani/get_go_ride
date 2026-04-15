import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, MapPin, Package, Clock, ShieldCheck, 
  MessageSquare, Check, Phone, Info, Truck, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useDriverState } from "../hooks/useDriverState";

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, acceptLead } = useDriverState();
  
  const lead = leads.find(l => l.id === id) || leads[0]; // fallback to first item for demo

  const handleAccept = () => {
    acceptLead(lead.id);
    navigate(`/driver/chat/${lead.id}`);
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative flex flex-col pt-4 pb-20">
      {/* Header */}
      <header className="flex items-center gap-4 px-1 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-xl font-black text-black tracking-tight leading-none uppercase italic">Lead Details</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Request ID: {lead?.id}</p>
        </div>
      </header>

      <div className="px-1 space-y-6 flex-1">
        {/* Main Info Card */}
        <Card className="border-2 border-primary/20 shadow-premium rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="p-6 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                     <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                     <h3 className="font-black text-black text-lg leading-tight">{lead?.service}</h3>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lead?.items}</p>
                  </div>
               </div>
               <Badge className="bg-primary text-black font-black text-[9px] uppercase tracking-widest px-2.5 py-1">
                  Active
               </Badge>
            </div>

            <div className="p-6 space-y-8">
               {/* Location Flow */}
               <div className="relative pl-10 space-y-8">
                  <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-zinc-100 dashed-border"></div>
                  
                  <div className="relative">
                     <div className="absolute -left-[32px] top-0 w-8 h-8 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Pickup Location</span>
                        <p className="text-sm font-black text-black leading-tight">{lead?.pickup}</p>
                     </div>
                  </div>
                  
                  <div className="relative">
                     <div className="absolute -left-[32px] top-0 w-8 h-8 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Drop Location</span>
                        <p className="text-sm font-black text-black leading-tight">{lead?.drop}</p>
                     </div>
                  </div>
               </div>

               {/* Specs Grid */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 space-y-1">
                     <Clock className="w-4 h-4 text-zinc-300 mb-1" />
                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Date & Time</span>
                     <p className="text-xs font-black text-black">{lead?.date}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 space-y-1">
                     <Truck className="w-4 h-4 text-zinc-300 mb-1" />
                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Weight</span>
                     <p className="text-xs font-black text-black">{lead?.weight}</p>
                  </div>
               </div>

               {/* Additional Notes */}
               <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Customer Notes</h4>
                  <div className="p-4 bg-white border-2 border-zinc-50 rounded-2xl italic text-xs font-bold text-zinc-500 leading-relaxed shadow-sm">
                     "Need careful handling for glass items. Preferred timing between 4-5 PM please."
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tip */}
        <div className="mx-2 p-5 bg-primary/5 rounded-[1.5rem] border-2 border-dashed border-primary/20 flex gap-4 items-center">
           <ShieldCheck className="w-10 h-10 text-primary shrink-0" />
           <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed tracking-tight">
             Accepting leads increases your <span className="text-black">Conversion Score</span>. Always reply within 5 minutes for better visibility.
           </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-zinc-100 p-4 px-6 flex gap-4 max-w-md mx-auto pb-8 z-50">
        <Button 
           variant="outline" 
           className="flex-1 h-14 rounded-2xl border-zinc-200 text-zinc-500 font-black text-[11px] uppercase tracking-widest hover:bg-zinc-50"
        >
           Cancel Lead
        </Button>
        <Button 
           onClick={handleAccept}
           className="flex-[1.5] h-14 rounded-2xl bg-primary text-black font-black text-[11px] uppercase tracking-[0.15em] shadow-xl shadow-primary/20 group"
        >
           Accept Lead <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default LeadDetails;
