import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Send, Phone, MoreVertical, 
  Package, CheckCircle2, ChevronDown, ChevronUp, Loader2,
  Mail, User, Truck, Calendar, Clock, Flag, XOctagon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { chatApi } from "@/lib/api";
import { io } from "socket.io-client";

const DriverChatPage = () => {
  const { id } = useParams(); // This is the bidId
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [activeBid, setActiveBid] = useState(null);
  const [localLead, setLocalLead] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");

  const socketRef = useRef(null);

  // Connection to Socket.io
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
    const socket = io(backendUrl);
    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch initial messages and populated details
  useEffect(() => {
    loadChatData();
  }, [id]);

  const loadChatData = async () => {
    try {
      setLocalLoading(true);
      const res = await chatApi.getMessages(id);
      const data = res.data || {};
      
      const bid = data.bid || {};
      const reqInfo = bid.requirement || {};
      const userInfo = reqInfo.user || {};

      setActiveBid(bid);

      setLocalLead({
        id: reqInfo.requirementId || reqInfo._id,
        service: (reqInfo.serviceType || "Goods-Transport").toUpperCase(),
        pickup: reqInfo.pickup?.address || "N/A",
        drop: reqInfo.drops?.[0]?.address || "N/A",
        weight: reqInfo.weight || "N/A",
        date: new Date(reqInfo.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        customerName: userInfo.name || "Customer",
        customerPhone: userInfo.phone || "",
        items: reqInfo.vehicleType || "General Goods",
        price: reqInfo.price || 1500,
      });

      const dbMessages = (data.messages || []).map((m) => ({
        id: m._id,
        sender: m.senderRole === "vendor" ? "driver" : "user",
        type: m.type,
        text: m.text,
        price: m.price,
        metadata: m.metadata,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: m.status
      }));

      setMessages(dbMessages);
    } catch (err) {
      console.error("Failed to load active driver chat details:", err);
      toast.error("Could not load negotiation history.");
    } finally {
      setLocalLoading(false);
    }
  };

  // Bind Room Events once joined
  useEffect(() => {
    if (id && socketRef.current) {
      socketRef.current.emit("join_chat", { bidId: id });

      socketRef.current.on("receive_message", (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg._id)) return prev;
          return [
            ...prev,
            {
              id: newMsg._id,
              sender: newMsg.senderRole === "vendor" ? "driver" : "user",
              type: newMsg.type,
              text: newMsg.text,
              price: newMsg.price,
              metadata: newMsg.metadata,
              time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: newMsg.status
            }
          ];
        });
      });

      socketRef.current.on("bid_updated", ({ bidId, amount }) => {
        if (id === bidId) {
          setActiveBid((prev) => ({ ...prev, amount }));
        }
      });

      socketRef.current.on("deal_accepted", ({ bidId }) => {
        if (id === bidId) {
          toast.success("Deal Accepted by Customer! Proceeding to checkout...", {
            icon: "🤝"
          });
          setTimeout(() => {
            navigate(`/driver/checkout/${id}`);
          }, 1500);
        }
      });

      socketRef.current.on("deal_reopened", ({ bidId }) => {
        if (id === bidId) {
          setActiveBid((prev) => ({ ...prev, status: "pending" }));
          toast.warning("Customer reopened negotiation! Chat is unlocked.", {
            icon: "⚠️"
          });
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit("leave_chat", { bidId: id });
          socketRef.current.off("receive_message");
          socketRef.current.off("bid_updated");
          socketRef.current.off("deal_accepted");
          socketRef.current.off("deal_reopened");
        }
      };
    }
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessageChange = (val) => {
    if (/[0-9]/.test(val)) {
      toast.warning("Direct numbers are blocked in chat text. Please use the 'New Proposal' button to quote a price!");
      const cleaned = val.replace(/[0-9]/g, "");
      setMessage(cleaned);
    } else {
      setMessage(val);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const textMsg = message;
    setMessage("");

    try {
      await chatApi.sendMessage(id, { text: textMsg, type: "text" });
    } catch (err) {
      console.error("Failed to send driver message:", err);
      toast.error("Message could not be sent.");
    }
  };

  const handleCounterOffer = async () => {
    if (!counterPrice || isNaN(counterPrice) || Number(counterPrice) <= 0) {
      return toast.error("Please enter a valid amount.");
    }
    try {
      await chatApi.sendOffer(id, Number(counterPrice));
      setCounterPrice("");
      setShowCounterModal(false);
      toast.success("Proposal transmitted successfully!");
    } catch (err) {
      console.error("Failed to submit proposal:", err);
      toast.error(err.response?.data?.message || "Failed to submit proposal.");
    }
  };

  const handleAcceptCounterOffer = async (price) => {
    try {
      await chatApi.sendOffer(id, Number(price));
      toast.success("Offer accepted! Formal proposal sent to customer.");
    } catch (err) {
      console.error("Failed to accept offer:", err);
      toast.error(err.response?.data?.message || "Failed to accept offer.");
    }
  };

  const handleFinalize = () => {
    if (activeBid?.status === "accepted") {
      toast.success("Deal agreed! Proceeding to secure checkout...", { icon: "🤝" });
      setTimeout(() => {
        navigate(`/driver/checkout/${id}`);
      }, 1200);
    } else {
      toast.info("Awaiting customer acceptance. Once they click 'Accept' on their app, this page will unlock!", {
        duration: 4000
      });
    }
  };

  const quickReplies = [
    { text: "CAN WE NEGOTIATE?", type: "negotiate" },
    { text: "PLEASE SUBMIT A PROPOSAL", type: "proposal" },
    { text: "AVAILABLE TO START IMMEDIATELY", type: "time" }
  ];

  if (localLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white max-w-md mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-zinc-500">Connecting Secure Transmission...</p>
      </div>
    );
  }

  const lead = localLead || {};

  const lastOffer = [...messages].reverse().find(m => m.type === "offer");
  const isDriverTurnToAccept = lastOffer && lastOffer.sender === "user" && activeBid?.status !== "accepted";
  const userCounterPrice = lastOffer ? (lastOffer.price || lastOffer.text) : 0;

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b-2 border-yellow-400 p-4 sticky top-0 z-40 backdrop-blur-md bg-white/95 shadow-sm">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
                 <ChevronLeft className="w-4 h-4 text-zinc-600" />
              </Button>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-xs border-2 border-primary/20">
                    {lead.customerName ? lead.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "JD"}
                 </div>
                 <div className="flex flex-col">
                    <h2 className="text-xs font-black text-black leading-none uppercase tracking-tighter">
                       {lead.customerName}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1.5">
                       <span className={cn("w-1.5 h-1.5 rounded-lg", activeBid?.status === "accepted" ? "bg-emerald-500" : "bg-amber-500")}></span>
                       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">
                          {activeBid?.status === "accepted" ? "Contract Finalized" : "Negotiation Active"}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-1">
              <Button 
                 variant="ghost" 
                 size="icon" 
                 className="w-8 h-8 rounded-lg border-2 border-zinc-50 hover:border-yellow-400 text-yellow-500 transition-all"
                 onClick={() => lead.customerPhone && (window.location.href = `tel:${lead.customerPhone}`)}
              >
                 <Phone className="w-3.5 h-3.5 fill-current" />
              </Button>

           </div>
        </div>
      </header>

      {/* Action Strip */}
      <div className="bg-zinc-900 p-2.5 px-4 flex gap-3 overflow-x-auto no-scrollbar relative z-30 border-b-4 border-primary">
         <Button 
            onClick={activeBid?.status === "accepted" ? handleFinalize : (isDriverTurnToAccept ? () => handleAcceptCounterOffer(userCounterPrice) : handleFinalize)}
            className={cn(
              "rounded-lg h-9 px-4 text-[9px] font-black uppercase tracking-[0.2em] shrink-0 border-none shadow-lg",
              activeBid?.status === "accepted" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" 
                : isDriverTurnToAccept
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            )}
         >
            {activeBid?.status === "accepted" 
              ? "Go to Checkout" 
              : isDriverTurnToAccept 
                ? `Accept ₹${userCounterPrice}` 
                : "Awaiting Customer"
            }
         </Button>
         <Button 
            onClick={() => setShowCounterModal(true)}
            disabled={activeBid?.status === "accepted"}
            className="bg-white text-black hover:bg-zinc-100 rounded-lg h-9 px-4 text-[9px] font-black uppercase tracking-[0.2em] shrink-0 border-none"
         >
            New Proposal
         </Button>
         <div className="w-[1px] h-6 bg-white/20 self-center shrink-0"></div>
         <Dialog>
           <DialogTrigger asChild>
             <Button 
                variant="ghost"
                className="text-white/40 font-black text-[8px] uppercase tracking-widest shrink-0 h-9 px-3 hover:text-white"
             >
                Terms & Policy
             </Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-[425px] bg-white w-[90vw] rounded-2xl p-6 border-zinc-100 shadow-xl z-[100]">
             <DialogHeader>
               <DialogTitle className="text-sm font-black uppercase tracking-widest text-zinc-900">Platform Terms</DialogTitle>
             </DialogHeader>
             <div className="text-sm font-semibold text-zinc-600 space-y-4 max-h-[60vh] overflow-y-auto mt-2">
                <p>By using the negotiation platform, you agree to the following terms:</p>
                <p><span className="text-primary font-bold">1. Binding Offers:</span> All proposals submitted via the platform are considered formal binding offers.</p>
                <p><span className="text-primary font-bold">2. Payments:</span> All finalized contracts must be fulfilled through the platform.</p>
                <p><span className="text-primary font-bold">3. Conduct:</span> Drivers are expected to maintain professional communication.</p>
             </div>
           </DialogContent>
         </Dialog>
      </div>

      {/* Message Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-zinc-50/30"
        style={{ paddingBottom: '160px' }}
      >
         <Card className="rounded-lg border-2 border-zinc-100 shadow-none bg-white mb-6 overflow-hidden">
            <div 
               className="p-3 flex justify-between items-center cursor-pointer hover:bg-zinc-50 transition-colors"
               onClick={() => setShowSummary(!showSummary)}
            >
               <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                     <Package className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-[9px] font-black text-black uppercase tracking-widest">{lead.service}</span>
               </div>
               <div className="flex items-center gap-3">
                  <Badge className="rounded-lg bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-tighter h-5">
                     {activeBid?.status === "accepted" ? "Finalized" : "Negotiating"}
                  </Badge>
                  {showSummary ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
               </div>
            </div>
            
            <AnimatePresence>
               {showSummary && (
                  <motion.div 
                     initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                     className="overflow-hidden border-t-2 border-zinc-50"
                  >
                     <div className="p-4 space-y-3 bg-white">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <div className="space-y-0.5">
                                 <p className="text-[7px] font-black text-zinc-400 uppercase">Pickup Location</p>
                                 <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-tighter leading-tight">{lead.pickup}</p>
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[7px] font-black text-zinc-400 uppercase">Drop Details</p>
                                 <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-tighter leading-tight">{lead.drop}</p>
                              </div>
                           </div>
                           <div className="space-y-2 text-right">
                              <div className="space-y-0.5">
                                 <p className="text-[7px] font-black text-zinc-400 uppercase">Load Weight</p>
                                 <p className="text-[9px] font-black text-zinc-900 uppercase">{lead.weight}</p>
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[7px] font-black text-zinc-400 uppercase">Target Date</p>
                                 <p className="text-[9px] font-black text-zinc-900 uppercase">{lead.date}</p>
                              </div>
                           </div>
                        </div>
                        {/* Pricing Summary */}
                        <div className="border-t border-zinc-100 pt-3 mt-1 grid grid-cols-2 gap-4 bg-zinc-50/40 p-2.5">
                           <div>
                              <p className="text-[7px] font-black text-emerald-600 uppercase">Customer Quoted Price</p>
                              <p className="text-sm font-black text-emerald-700">₹{lead.price}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[7px] font-black text-primary uppercase">Your Active Proposal</p>
                              <p className="text-sm font-black text-zinc-900">₹{activeBid?.amount || lead.price}</p>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </Card>

         {messages.map((msg) => (
            <motion.div
               key={msg.id}
               initial={{ opacity: 0, x: msg.sender === "driver" ? 10 : -10 }}
               animate={{ opacity: 1, x: 0 }}
               className={cn(
                  "flex w-full mb-1",
                  msg.sender === "driver" ? "justify-end" : "justify-start"
               )}
            >
               <div className={cn(
                  "max-w-[85%] border-2 shadow-sm relative overflow-hidden",
                  msg.type === "offer" ? "bg-zinc-900 border-primary border-4 p-4 rounded-xl" :
                  msg.sender === "driver" 
                    ? "bg-white border-primary/40 text-zinc-900 p-3.5 rounded-lg shadow-primary/5" 
                    : "bg-white border-zinc-100 text-zinc-600 p-3.5 rounded-lg"
               )}>
                  {msg.type === "contact" ? (
                     <div className="space-y-3 min-w-[200px]">
                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                           <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                              <User className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contact Info</p>
                              <p className="text-sm font-black text-black leading-none mt-0.5">{msg.metadata?.name || 'Customer'}</p>
                           </div>
                        </div>
                        <div className="flex flex-col gap-2">
                           <a href={`tel:${msg.metadata?.phone}`} className="flex items-center gap-3 bg-emerald-500 text-white p-3 rounded-lg font-black text-xs uppercase tracking-widest justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                              <Phone className="w-4 h-4" /> Call Customer
                           </a>
                           {msg.metadata?.email && (
                              <a href={`mailto:${msg.metadata?.email}`} className="flex items-center gap-3 border border-zinc-100 p-3 rounded-lg font-black text-[10px] text-zinc-600 uppercase tracking-widest justify-center">
                                 <Mail className="w-4 h-4" /> Email
                              </a>
                           )}
                        </div>
                     </div>
                  ) : msg.type === "card" ? (
                     <div className="space-y-4 min-w-[220px]">
                        <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                           <Truck className="w-4 h-4 text-primary" />
                           <span className="text-[10px] font-black text-black uppercase tracking-widest">Journey Details</span>
                        </div>
                        <div className="space-y-3">
                           <div className="flex gap-3">
                              <div className="flex flex-col items-center">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                 <div className="w-0.5 h-10 bg-zinc-100 border-dashed border-l" />
                                 <div className="w-2 h-2 rounded-full bg-amber-500" />
                              </div>
                              <div className="flex-1 space-y-4">
                                 <div>
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Pickup</p>
                                    <p className="text-[10px] font-bold text-black uppercase tracking-tight line-clamp-1">{msg.metadata?.pickup?.address}</p>
                                 </div>
                                 <div>
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Drop</p>
                                    <p className="text-[10px] font-bold text-black uppercase tracking-tight line-clamp-1">{msg.metadata?.drops?.[0]?.address}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="bg-zinc-50 p-2.5 rounded-lg flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              <span className="text-[9px] font-black text-zinc-600 uppercase">{msg.metadata?.date ? new Date(msg.metadata.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              <span className="text-[9px] font-black text-zinc-600 uppercase">{msg.metadata?.time || 'Anytime'}</span>
                           </div>
                        </div>
                     </div>
                  ) : msg.type === "offer" ? (
                     <div className="space-y-3 min-w-[160px]">
                        <div className="flex items-center justify-between">
                           <Badge className="bg-primary text-black rounded-lg text-[8px] font-black uppercase">
                              {msg.sender === "driver" ? "My Proposal" : "Counter Offer"}
                           </Badge>
                           <span className="text-[10px] font-black text-white italic">
                              {msg.sender === "driver" ? "SENT" : "RECEIVED"}
                           </span>
                        </div>
                        <p className="text-3xl font-black text-white tabular-nums tracking-tighter leading-none">
                           ₹{msg.price || msg.text}
                        </p>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] border-t border-white/10 pt-2">
                           {msg.sender === "driver" ? "Includes loading/unloading" : "Review in action bar"}
                        </p>
                     </div>
                  ) : (
                     <p className="text-[11px] font-black leading-relaxed uppercase tracking-tight">
                        {msg.sender === "driver" && <span className="text-primary mr-1">●</span>}
                        {msg.text}
                     </p>
                  )}
                  <div className={cn(
                     "flex items-center justify-end gap-1.5 mt-2",
                     msg.type === "offer" ? "text-white/30" : "text-zinc-400"
                  )}>
                     <span className="text-[7px] uppercase font-black tracking-widest">{msg.time}</span>
                     {msg.sender === "driver" && (
                        <CheckCircle2 className={cn("w-2.5 h-2.5", msg.status === "read" ? "text-emerald-500" : "text-zinc-300")} />
                     )}
                  </div>
               </div>
            </motion.div>
         ))}
      </div>

      {/* Input Terminal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-zinc-100 p-4 pt-4 max-w-md mx-auto z-50 shadow-2xl">
         <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {quickReplies.map((reply, i) => (
               <Button
                 key={i}
                 variant="outline"
                 disabled={activeBid?.status === "accepted"}
                 onClick={() => setMessage(reply.text)}
                 className="h-7 rounded-lg border border-zinc-200 bg-white px-3 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 transition-all shrink-0 shadow-sm"
               >
                  {reply.text}
               </Button>
            ))}
         </div>

         <div className="flex gap-3">
            <div className="flex-1 relative">
               <Input 
                  placeholder={activeBid?.status === "accepted" ? "Contract Locked" : "Type secure message..."}
                  disabled={activeBid?.status === "accepted"}
                  className="h-12 bg-white border-2 border-zinc-100 rounded-lg font-bold text-[11px] uppercase tracking-tight focus:border-yellow-400 focus:ring-0 pr-12 transition-all shadow-sm"
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button 
                  disabled={activeBid?.status === "accepted"}
                  className="absolute right-0 top-0 h-12 w-12 bg-white flex items-center justify-center text-primary hover:text-yellow-600 transition-colors border-l-2 border-zinc-100"
                  onClick={handleSend}
               >
                  <Send className="w-4 h-4 fill-current" />
               </button>
            </div>
         </div>
      </div>

      {/* Proposal Modal */}
      <AnimatePresence>
         {showCounterModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setShowCounterModal(false)}
                 className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="relative w-full max-w-sm bg-white border-4 border-black p-6 shadow-2xl"
               >
                  <div className="space-y-6">
                     <div className="text-center space-y-1">
                        <h3 className="text-sm font-black text-black uppercase tracking-[0.2em] italic">Send New Proposal</h3>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Formal Counter-Offer</p>
                     </div>

                     <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-400">₹</div>
                        <input 
                           type="number"
                           placeholder="0"
                           value={counterPrice}
                           onChange={(e) => setCounterPrice(e.target.value)}
                           className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 text-center text-2xl font-black focus:border-primary outline-none tabular-nums uppercase"
                        />
                      </div>

                     <div className="flex flex-col gap-2">
                        <Button 
                           onClick={handleCounterOffer}
                           disabled={!counterPrice}
                           className="w-full h-12 bg-zinc-900 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all rounded-lg"
                        >
                           Transmit Offer
                        </Button>
                        <Button 
                           variant="ghost"
                           onClick={() => setShowCounterModal(false)}
                           className="w-full h-10 font-black text-zinc-400 text-[9px] uppercase tracking-widest hover:text-black rounded-lg"
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

export default DriverChatPage;
