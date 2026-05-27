import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, MapPin, Package, Clock, ShieldCheck, 
  MessageSquare, Check, Phone, Info, Truck, ArrowRight, Lock, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useDriverState, normalizeLead } from "../hooks/useDriverState";
import { requirementApi } from "@/lib/api";

import { toast } from "sonner";

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { acceptLead, driver } = useDriverState();
  
  const [localLead, setLocalLead] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLocalLoading(true);
        const res = await requirementApi.getDetails(id);
        const data = res.data || res;
        if (data) {
          setLocalLead(normalizeLead(data));
        }
      } catch (err) {
        console.error("Failed to fetch lead details:", err);
      } finally {
        setLocalLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const lead = localLead;

  const [showBidModal, setShowBidModal] = useState(false);
  const [bidPrice, setBidPrice] = useState("");

  const handleAccept = async (customPrice) => {
    if (lead) {
      try {
        setAccepting(true);
        const finalPrice = customPrice ? Number(customPrice) : Number(lead.price || 1733);
        const bid = await acceptLead(lead.id, finalPrice);
        toast.success("Lead accepted and bid placed successfully!");
        setShowBidModal(false);
        
        // Navigate using Bid ID if available, otherwise fallback to lead.id (Requirement ID)
        const navigationId = (bid && bid._id) ? bid._id : (bid && bid.id) ? bid.id : lead.id;
        navigate(`/driver/chat/${navigationId}`);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Failed to accept lead");
      } finally {
        setAccepting(false);
      }
    }
  };

  if (localLoading) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-bold text-zinc-500 tracking-tight">Loading Lead Details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h3 className="font-bold text-zinc-900 tracking-tight">Lead Not Found</h3>
        <p className="text-[10px] text-zinc-500 font-bold tracking-tight">This lead might have been taken by another driver or cancelled.</p>
        <Button onClick={() => navigate("/driver/leads")} className="bg-primary text-zinc-900 font-bold text-xs h-10 px-5 rounded-xl">
          Back to Lead Center
        </Button>
      </div>
    );
  }

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

               {/* Dedicated Fare Details Card */}
               <div className="p-4 mb-4 bg-emerald-50/40 border-2 border-emerald-500/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-black text-emerald-600">₹</span>
                     </div>
                     <div className="space-y-0.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Estimated Fare</span>
                        <p className="text-lg font-black text-zinc-900 leading-tight">₹{lead?.price || 1733}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full uppercase tracking-tight">Guaranteed</span>
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
                      {lead?.notes || "No special instructions provided by customer."}
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
                onClick={() => {
                  setBidPrice(lead?.price || "");
                  setShowBidModal(true);
                }}
                disabled={accepting}
                className="flex-[1.5] h-12 rounded-xl bg-primary text-zinc-900 font-bold text-xs shadow-xl shadow-primary/20 group transition-all"
             >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    Accept Lead <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
             </Button>
           </>
         )}
      </div>

      {/* Proposal Modal */}
      <AnimatePresence>
         {showBidModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setShowBidModal(false)}
                 className="absolute inset-0 bg-zinc-900/85 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                 className="relative w-full max-w-sm bg-white border-2 border-zinc-100 p-6 shadow-2xl rounded-3xl"
               >
                  <div className="space-y-6">
                     <div className="text-center space-y-1.5">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary">
                           <Truck className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black text-black uppercase tracking-[0.1em]">Set Your Proposal Price</h3>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                           Customer's Quoted Price: ₹{lead?.price}
                        </p>
                     </div>

                     <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-400">₹</div>
                        <input 
                           type="number"
                           placeholder="0"
                           value={bidPrice}
                           onChange={(e) => setBidPrice(e.target.value)}
                           className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 text-center text-2xl font-black focus:border-primary outline-none rounded-2xl tabular-nums uppercase"
                        />
                     </div>

                     <div className="flex flex-col gap-2 pt-2">
                        <Button 
                           onClick={() => handleAccept(bidPrice)}
                           disabled={!bidPrice || accepting}
                           className="w-full h-12 bg-zinc-900 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all rounded-xl shadow-lg shadow-zinc-900/20"
                        >
                           {accepting ? (
                             <Loader2 className="w-4 h-4 animate-spin text-primary" />
                           ) : (
                             "Submit Proposal & Accept"
                           )}
                        </Button>
                        <Button 
                           variant="ghost"
                           onClick={() => setShowBidModal(false)}
                           className="w-full h-10 font-black text-zinc-400 text-[9px] uppercase tracking-widest hover:text-black rounded-xl"
                        >
                           Dismiss
                        </Button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default LeadDetails;
