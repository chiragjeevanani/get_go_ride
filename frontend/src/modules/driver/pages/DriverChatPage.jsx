import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Send, Phone, Info, MoreVertical, 
  Package, MapPin, CheckCircle2, ChevronDown, ChevronUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";

const DriverChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads } = useDriverState();
  const scrollRef = useRef(null);
  
  const lead = leads.find(l => l.id === id) || leads[0];
  const [showSummary, setShowSummary] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm interested in your requirement. Is it still available?", sender: "driver", time: "12:30 PM", status: "read" },
    { id: 2, text: "Yes, it is. What would be your charge for this?", sender: "user", time: "12:31 PM" },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: "driver",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };
    setMessages([...messages, newMessage]);
    setMessage("");
    
    // Fake reply
    setTimeout(() => {
      const reply = {
          id: messages.length + 2,
          text: "Thanks, let me check and get back to you.",
          sender: "user",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleFinalize = () => {
    navigate(`/driver/checkout/${id}`);
  };

  const quickReplies = [
    { text: "My price: ₹1500", type: "price" },
    { text: "Available at 4 PM", type: "time" },
    { text: "Can we negotiate?", type: "negotiate" }
  ];

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative overflow-hidden">
      {/* Sharp Header */}
      <header className="bg-white border-b-2 border-yellow-400 p-4 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-none bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
                 <ChevronLeft className="w-4 h-4 text-zinc-600" />
              </Button>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center font-black text-primary text-xs border-2 border-primary/20">JD</div>
                 <div className="flex flex-col">
                    <h2 className="text-xs font-black text-black leading-none uppercase tracking-tighter">John Doe</h2>
                    <div className="flex items-center gap-1.5 mt-1.5">
                       <span className="w-1.5 h-1.5 rounded-none bg-emerald-500"></span>
                       <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">Transmission Active</span>
                    </div>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-none border-2 border-zinc-50 hover:border-yellow-400 text-yellow-500 transition-all">
                 <Phone className="w-3.5 h-3.5 fill-current" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-none border-2 border-zinc-50 hover:border-yellow-400 text-yellow-500 transition-all">
                 <MoreVertical className="w-3.5 h-3.5" />
              </Button>
           </div>
        </div>
      </header>

      {/* Message Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-zinc-50/30"
        style={{ paddingBottom: '160px' }} // Space for fixed input area
      >
         {/* Request Context - Compact & Sharp */}
         <Card className="rounded-none border-2 border-zinc-100 shadow-none bg-white mb-6 overflow-hidden">
            <div 
               className="p-3 flex justify-between items-center cursor-pointer hover:bg-zinc-50 transition-colors"
               onClick={() => setShowSummary(!showSummary)}
            >
               <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                     <Package className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-[9px] font-black text-black uppercase tracking-widest">{lead?.service}</span>
               </div>
               <div className="flex items-center gap-3">
                  <Badge className="rounded-none bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-tighter h-5">Negotiating</Badge>
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
                                 <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-tighter leading-tight">{lead?.pickup}</p>
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[7px] font-black text-zinc-400 uppercase">Drop Details</p>
                                 <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-tighter leading-tight">{lead?.drop}</p>
                              </div>
                           </div>
                           <div className="space-y-2 text-right">
                              <div className="space-y-0.5">
                                 <p className="text-[7px] font-black text-zinc-400 uppercase">Load Weight</p>
                                 <p className="text-[9px] font-black text-zinc-900 uppercase">{lead?.weight}</p>
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[7px] font-black text-zinc-400 uppercase">Target Date</p>
                                 <p className="text-[9px] font-black text-zinc-900 uppercase">{lead?.date}</p>
                              </div>
                           </div>
                        </div>
                        <Button 
                           onClick={() => navigate(`/driver/leads/${lead?.id}`)} 
                           className="w-full h-8 bg-zinc-50 text-zinc-900 font-black text-[8px] uppercase tracking-widest border border-zinc-200 rounded-none hover:border-yellow-400 hover:text-yellow-600 transition-all font-black text-[9px]"
                        >
                           Examine Full Request
                        </Button>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </Card>

         <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-[7px] font-black text-zinc-300 uppercase tracking-[0.3em]">Session Initialized • {messages[0]?.time}</span>
         </div>

         {messages.map((msg) => (
            <motion.div
               key={msg.id}
               initial={{ opacity: 0, x: msg.sender === "driver" ? 10 : -10 }}
               animate={{ opacity: 1, x: 0 }}
               className={cn(
                  "flex w-full mb-1",
                  msg.sender === "driver" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"
               )}
            >
               {msg.sender === "system" ? (
                  <div className="py-4 flex flex-col items-center gap-2">
                     <div className="px-4 py-1.5 bg-emerald-500 text-white font-black text-[8px] uppercase tracking-[0.2em] rounded-none shadow-lg shadow-emerald-500/20">
                        {msg.text}
                     </div>
                  </div>
               ) : (
                  <div className={cn(
                     "max-w-[85%] p-3.5 border-2 shadow-sm relative",
                     msg.sender === "driver" 
                       ? "bg-white border-primary/40 text-zinc-900 rounded-none shadow-primary/5" 
                       : "bg-white border-zinc-100 text-zinc-600 rounded-none"
                  )}>
                     <p className="text-[11px] font-black leading-relaxed uppercase tracking-tight">
                        {msg.sender === "driver" && <span className="text-primary mr-1">●</span>}
                        {msg.text}
                     </p>
                     <div className={cn(
                        "flex items-center justify-end gap-1.5 mt-2 text-zinc-400"
                     )}>
                        <span className="text-[7px] uppercase font-black tracking-widest">{msg.time}</span>
                        {msg.sender === "driver" && (
                           <CheckCircle2 className={cn("w-2.5 h-2.5", msg.status === "read" ? "text-emerald-500" : "text-zinc-300")} />
                        )}
                     </div>
                  </div>
               )}
            </motion.div>
         ))}
      </div>

      {/* Fixed Communication Terminal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-zinc-100 p-4 pt-4 max-w-md mx-auto z-50 shadow-2xl">
         {/* Adaptive Quick Response Grid */}
         <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {quickReplies.map((reply, i) => (
               <Button
                 key={i}
                 variant="outline"
                 onClick={() => setMessage(reply.text)}
                 className="h-7 rounded-none border border-zinc-200 bg-white px-3 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:border-yellow-400 hover:text-yellow-600 transition-all shrink-0 shadow-sm"
               >
                  {reply.text}
               </Button>
            ))}
         </div>

         <div className="flex gap-3">
            <div className="flex-1 relative">
               <Input 
                  placeholder="Type secure message..." 
                  className="h-12 bg-white border-2 border-zinc-100 rounded-none font-bold text-[11px] uppercase tracking-tight focus:border-yellow-400 focus:ring-0 pr-12 transition-all shadow-sm"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button 
                  className="absolute right-0 top-0 h-12 w-12 bg-white flex items-center justify-center text-primary hover:text-yellow-600 transition-colors border-l-2 border-zinc-100"
                  onClick={handleSend}
               >
                  <Send className="w-4 h-4 fill-current" />
               </button>
            </div>
            <Button 
               onClick={handleFinalize}
               className="bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest rounded-none h-12 px-5 shadow-xl shadow-emerald-500/10 hover:bg-emerald-600 transition-all border-none shrink-0"
            >
               Finalize
            </Button>
         </div>
      </div>
    </div>
  );
};

export default DriverChatPage;
