import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Send, Image, Mic, MoreVertical, 
  CheckCircle2, Info, Star, ShieldCheck, MapPin, Package 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ChatPage = () => {
  const { requestId, vendorId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const scrollRef = useRef(null);

  // Mock data for messages
  const [messages, setMessages] = useState([
    { id: 1, sender: "vendor", text: "Hello! We can help with your house shifting. Our quoted price is ₹3,500.", time: "10:30 AM", status: "read" },
    { id: 2, sender: "vendor", text: "We have a 14ft Eicher truck available tomorrow morning.", time: "10:31 AM", status: "read" },
    { id: 3, sender: "user", text: "Hi, does this include labor for shifting?", time: "10:35 AM", status: "read" },
    { id: 4, sender: "vendor", text: "Yes, it includes 2 laborers for loading and unloading.", time: "10:36 AM", status: "read" },
  ]);

  const vendor = {
    name: "Shiv Logistics",
    rating: 4.8,
    isVerified: true,
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SL",
    quote: "₹3,500"
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-4 bg-zinc-50 relative overflow-hidden">
      {/* Chat Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-100 p-4 sticky top-0 z-40 safe-area-top shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-6 h-6" />
           </Button>
           <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarImage src={vendor.avatar} />
              <AvatarFallback>{vendor.name.substring(0, 2)}</AvatarFallback>
           </Avatar>
           <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1">
                 <h4 className="font-bold text-black text-sm truncate">{vendor.name}</h4>
                 {vendor.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary fill-primary/10" />}
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold">{vendor.rating}</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                 <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="rounded-full text-zinc-400">
              <MoreVertical className="w-5 h-5" />
           </Button>
        </div>
      </header>

      {/* Floating Summary Bar */}
      <div className="hidden sm:block px-4 pt-2">
         <Card className="bg-primary shadow-lg shadow-primary/20 border-none">
            <CardContent className="p-3 flex items-center justify-between text-black">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-black/10 rounded-xl">
                     <Package className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] opacity-80 uppercase font-black">Active Deal</span>
                     <span className="text-sm font-bold truncate">House Shifting • {vendor.quote}</span>
                  </div>
               </div>
               <Button size="sm" className="bg-white text-primary hover:bg-white/90 rounded-xl font-bold h-8 text-[10px]">
                  Finalize Deal
               </Button>
            </CardContent>
         </Card>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth"
      >
        <div className="flex justify-center my-6">
           <Badge variant="outline" className="bg-white/50 text-zinc-400 text-[9px] uppercase font-bold tracking-widest border-zinc-100 rounded-full px-3">
              Today, 09 April 2026
           </Badge>
        </div>

        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.sender === "user" ? "ml-auto items-end" : "items-start"
              )}
            >
               <div className={cn(
                  "p-3.5 px-5 rounded-[2rem] text-sm leading-relaxed shadow-sm relative",
                  msg.sender === "user" 
                    ? "bg-primary text-black rounded-tr-none shadow-primary/10" 
                    : "bg-white text-black rounded-tl-none shadow-zinc-100"
               )}>
                  {msg.text}
                  {msg.sender === "user" && (
                    <div className="flex items-center justify-end mt-1 gap-1">
                       <span className="text-[8px] opacity-70 italic">{msg.time}</span>
                       <CheckCircle2 className="w-2.5 h-2.5 opacity-80" />
                    </div>
                  )}
                  {msg.sender === "vendor" && (
                    <span className="text-[8px] text-zinc-300 italic block mt-1">{msg.time}</span>
                  )}
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-zinc-100 safe-area-bottom">
        <div className="flex items-end gap-2 bg-zinc-50 p-2 rounded-[2rem] border border-zinc-200">
          <Button variant="ghost" size="icon" className="rounded-full text-zinc-400 shrink-0 h-10 w-10">
             <Image className="w-5 h-5" />
          </Button>
          <textarea 
            rows={1}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-transparent border-none focus:outline-none py-2 text-sm max-h-32 resize-none no-scrollbar font-medium"
          />
          <Button 
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
               "h-10 w-10 rounded-full p-0 transition-all shadow-lg hover:scale-110 active:scale-95",
               message.trim() ? "bg-primary text-black shadow-primary/30" : "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
            )}
          >
             <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Floating CTA for Mobile inside Chat */}
      <div className="px-4 pb-2 absolute bottom-24 left-0 right-0 z-10 sm:hidden translate-y-[-10px]">
         <motion.div 
           initial={{ y: 0 }}
           animate={{ y: [0, -5, 0] }}
           transition={{ duration: 3, repeat: Infinity }}
           className="w-full"
         >
           <Button 
             className="w-full bg-primary text-black h-12 shadow-xl shadow-primary/30 rounded-2xl border-none font-bold"
             onClick={() => navigate(`/user/finalize/${requestId}/${vendorId}`)}
           >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Finalize Deal (₹3,500)
           </Button>
         </motion.div>
      </div>
    </div>
  );
};

export default ChatPage;
