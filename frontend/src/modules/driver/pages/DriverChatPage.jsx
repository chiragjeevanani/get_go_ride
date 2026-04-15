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

  const quickReplies = [
    { text: "My price: ₹1500", type: "price" },
    { text: "Available at 4 PM", type: "time" },
    { text: "Can we negotiate?", type: "negotiate" }
  ];

  return (
    <div className="flex flex-col h-screen bg-zinc-50 max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 p-4 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="rounded-full bg-zinc-50" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5 text-zinc-600" />
           </Button>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">JD</div>
              <div className="flex flex-col">
                 <h2 className="text-sm font-black text-black leading-none uppercase">John Doe</h2>
                 <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Online Now</span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-50 text-zinc-400">
              <Phone className="w-4 h-4" />
           </Button>
           <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-50 text-zinc-400">
              <MoreVertical className="w-4 h-4" />
           </Button>
        </div>
      </header>

      {/* Pinned Summary */}
      <div className="px-4 py-2 sticky top-[73px] z-30">
         <Card className="border-2 border-primary/20 shadow-premium rounded-[1.5rem] bg-white overflow-hidden transition-all duration-300">
            <CardContent className="p-0">
               <div 
                  className="p-3 px-4 flex justify-between items-center cursor-pointer hover:bg-zinc-50 transition-colors"
                  onClick={() => setShowSummary(!showSummary)}
               >
                  <div className="flex items-center gap-3">
                     <Package className="w-4 h-4 text-primary" />
                     <span className="text-[10px] font-black text-black uppercase tracking-tight">{lead?.service}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-wider h-5">₹ Negotiating</Badge>
                     {showSummary ? <ChevronUp className="w-4 h-4 text-zinc-300" /> : <ChevronDown className="w-4 h-4 text-zinc-300" />}
                  </div>
               </div>
               
               <AnimatePresence>
                  {showSummary && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-zinc-50"
                     >
                        <div className="p-4 space-y-3">
                           <div className="flex justify-between items-start gap-4">
                              <div className="space-y-2 flex-1">
                                 <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter truncate">{lead?.pickup}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter truncate">{lead?.drop}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                 <span className="text-[10px] font-black text-black">{lead?.weight}</span>
                                 <span className="text-[8px] font-bold text-zinc-400 uppercase">{lead?.date}</span>
                              </div>
                           </div>
                           <Button 
                              onClick={() => navigate(`/driver/leads/${lead?.id}`)} 
                              variant="link" 
                              className="w-full text-[9px] font-black uppercase tracking-widest text-primary h-auto p-0"
                           >
                              Full Request Details
                           </Button>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </CardContent>
         </Card>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-32"
      >
         <div className="flex flex-col items-center gap-2 py-4">
            <div className="px-3 py-1 bg-zinc-200/50 rounded-full text-[8px] font-black text-zinc-400 uppercase tracking-widest">Today</div>
         </div>

         {messages.map((msg) => (
            <motion.div
               key={msg.id}
               initial={{ opacity: 0, scale: 0.9, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className={cn(
                  "flex w-full mb-2",
                  msg.sender === "driver" ? "justify-end" : "justify-start"
               )}
            >
               <div className={cn(
                  "max-w-[80%] p-4 rounded-3xl text-sm font-bold shadow-sm relative",
                  msg.sender === "driver" 
                    ? "bg-zinc-900 text-white rounded-br-none" 
                    : "bg-white text-black rounded-bl-none border border-zinc-100"
               )}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className={cn(
                     "flex items-center justify-end gap-1 mt-1",
                     msg.sender === "driver" ? "text-zinc-500" : "text-zinc-300"
                  )}>
                     <span className="text-[8px] uppercase font-black">{msg.time}</span>
                     {msg.sender === "driver" && (
                        <CheckCircle2 className={cn("w-2.5 h-2.5", msg.status === "read" ? "text-primary" : "text-zinc-500")} />
                     )}
                  </div>
               </div>
            </motion.div>
         ))}
      </div>

      {/* Footer / Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 pt-4 max-w-md mx-auto z-50">
         {/* Quick Replies */}
         <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {quickReplies.map((reply, i) => (
               <Button
                 key={i}
                 variant="outline"
                 onClick={() => setMessage(reply.text)}
                 className="h-8 rounded-full border-zinc-100 bg-zinc-50/50 px-4 text-[9px] font-black uppercase tracking-wider text-zinc-500 hover:border-primary/20 hover:text-primary transition-all shrink-0"
               >
                  {reply.text}
               </Button>
            ))}
         </div>

         <div className="flex flex-col gap-3">
            <Button 
               className="w-full bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl h-10 shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all mb-1"
            >
               Mark as Finalized
            </Button>
            <div className="flex items-center gap-3">
               <div className="flex-1 relative">
                  <Input 
                     placeholder="Type message..." 
                     className="pr-12 h-14 bg-zinc-50 border-zinc-100 rounded-2xl font-bold text-sm focus:bg-white focus:border-primary/20 transition-all shadow-sm"
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <div 
                     className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-black rounded-xl cursor-pointer active:scale-90 transition-transform shadow-md shadow-primary/20"
                     onClick={handleSend}
                  >
                     <Send className="w-5 h-5" strokeWidth={2.5} />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DriverChatPage;
