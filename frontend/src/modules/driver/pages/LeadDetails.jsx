import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, MapPin, Package, Clock, ShieldCheck, 
  MessageSquare, Check, Phone, Info, Truck, ArrowRight, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useDriverState } from "../hooks/useDriverState";

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, acceptLead, driver } = useDriverState();
  
  const lead = leads.find(l => l.id === id) || leads[0]; // fallback to first item for demo

  const handleAccept = () => {
    acceptLead(lead.id);
    navigate(`/driver/chat/${lead.id}`);
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative flex flex-col pb-24">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b-2 border-yellow-400 sticky top-0 bg-white/95 backdrop-blur-md z-30 shadow-sm w-full">
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none italic">Lead Details</h1>
          <p className="text-[10px] font-semibold text-zinc-400 tracking-tight mt-0.5">Request ID: {lead?.id}</p>
        </div>
      </header>

      <div className="px-3 space-y-4 flex-1 pt-4">
        {/* Main Info Card */}
        <Card className="border-2 border-primary/20 shadow-premium rounded-[1.75rem] overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="p-4 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
               <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                     <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                     <h3 className="font-bold text-zinc-900 text-base leading-tight">{lead?.service}</h3>
                     <p className="text-[10px] font-semibold text-zinc-500 tracking-tight">{lead?.items}</p>
                  </div>
               </div>
                 <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[8px] font-bold border-zinc-200 text-zinc-500 bg-zinc-50 px-1.5 h-5">5.2 km away</Badge>
                    <Badge className="bg-primary/20 text-zinc-900 border-none font-bold text-[9px] tracking-tight px-2 py-0.5 hover:bg-primary/30">
                       Active
                    </Badge>
                 </div>
            </div>

            <div className="p-4 space-y-6">
               {/* Location Flow */}
               <div className="relative pl-9 space-y-6">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-zinc-100 dashed-border"></div>
                  
                  <div className="relative group">
                     <div className="absolute -left-[30px] top-0 w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      </div>
                      <div className="flex justify-between items-start">
                         <div className="space-y-0.5 min-w-0">
                            <span className="text-[9px] font-bold text-emerald-600 tracking-tight">Pickup Location</span>
                            <p className="text-xs font-bold text-zinc-900 leading-tight truncate pr-2">{lead?.pickup}</p>
                         </div>
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead?.pickup)}`, '_blank')}
                            className="h-6 px-2 text-[8px] font-bold text-primary hover:bg-primary/5 rounded-lg border border-primary/10"
                         >
                            <MapPin className="w-2.5 h-2.5 mr-1" /> NAVIGATE
                         </Button>
                      </div>
                   </div>
                  
                  <div className="relative">
                     <div className="absolute -left-[30px] top-0 w-7 h-7 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      </div>
                      <div className="flex justify-between items-start">
                         <div className="space-y-0.5 min-w-0">
                            <span className="text-[9px] font-bold text-red-600 tracking-tight">Drop Location</span>
                            <p className="text-xs font-bold text-zinc-900 leading-tight truncate pr-2">{lead?.drop}</p>
                         </div>
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead?.drop)}`, '_blank')}
                            className="h-6 px-2 text-[8px] font-bold text-zinc-400 hover:bg-zinc-50 rounded-lg border border-zinc-100"
                         >
                            <MapPin className="w-2.5 h-2.5 mr-1" /> NAVIGATE
                         </Button>
                      </div>
                   </div>
               </div>

               {/* Specs Grid */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-0.5">
                     <Clock className="w-3.5 h-3.5 text-zinc-400 mb-0.5" />
                     <span className="text-[9px] font-bold text-zinc-500 tracking-tight">Lead Expires In</span>
                     <p className="text-[11px] font-bold text-red-500 animate-pulse">24m 12s</p>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-0.5">
                     <Truck className="w-3.5 h-3.5 text-zinc-400 mb-0.5" />
                     <span className="text-[9px] font-bold text-zinc-500 tracking-tight">Total Weight</span>
                     <p className="text-[11px] font-bold text-zinc-900">{lead?.weight}</p>
                  </div>
               </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                   <h4 className="text-[10px] font-bold text-zinc-500 tracking-tight px-1">Customer Notes</h4>
                   <div className="p-3 bg-white border-2 border-zinc-50 rounded-xl italic text-xs font-semibold text-zinc-500 leading-relaxed shadow-sm">
                      "Need careful handling for glass items. Preferred timing between 4-5 PM please."
                   </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tip */}
         <div className="mx-1 p-3.5 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 flex gap-3 items-center">
            <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
            <p className="text-[10px] font-semibold text-zinc-600 leading-relaxed tracking-tight">
              Accepting leads increases your <span className="text-zinc-900 font-bold">Conversion Score</span>. Always reply within 5 minutes for better visibility.
            </p>
         </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 p-3 px-5 flex gap-3 max-w-md mx-auto pb-6 z-50">
         {!driver.isSubscribed ? (
           <Button 
             onClick={() => navigate("/driver/subscribe")}
             className="w-full h-12 rounded-xl bg-zinc-900 text-primary font-bold text-xs shadow-xl shadow-zinc-900/20 group transition-all"
           >
              <Lock className="w-4 h-4 mr-2" />
              Subscribe to Unlock Lead
           </Button>
         ) : (
           <>
             <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl border-zinc-200 text-zinc-600 font-bold text-xs hover:bg-zinc-50 transition-all"
             >
                Cancel Lead
             </Button>
             <Button 
                onClick={handleAccept}
                className="flex-[1.5] h-12 rounded-xl bg-primary text-zinc-900 font-bold text-xs shadow-xl shadow-primary/20 group transition-all"
             >
                Accept Lead <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
             </Button>
           </>
         )}
      </div>
    </div>
  );
};

export default LeadDetails;
