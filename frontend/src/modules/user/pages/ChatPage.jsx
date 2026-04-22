import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Send, Image, Mic, MoreVertical, 
  CheckCircle2, Info, Star, ShieldCheck, MapPin, Package, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import driverImg from "@/assets/Driver/driver1.jpg";

const ChatPage = () => {
  const { requestId, vendorId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
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
    avatar: driverImg,
    quote: "₹3,500"
  };

  // Negotiation State
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");

  const handleCounterOffer = () => {
    if (!counterPrice) return;
    const newMessage = {
      id: Date.now(),
      sender: "user",
      type: "offer",
      text: `Counter Offer: ₹${counterPrice}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };
    setMessages([...messages, newMessage]);
    setCounterPrice("");
    setShowCounterModal(false);
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
    <div className="flex flex-col h-screen -m-4 bg-zinc-50 relative overflow-hidden">
      {/* ... header & toolbar & messages ... */}
      <header className="bg-white border-b border-zinc-100 p-4 pt-8 sticky top-0 z-40 safe-area-top shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => navigate(-1)}>
               <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-zinc-100 flex items-center justify-center font-black text-black text-xs overflow-hidden">
               <img src={vendor.avatar} alt="logo" className="w-full h-full object-cover" />
            </div>
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
         <div className="flex items-center gap-1 relative">
            <Button 
             variant="ghost" 
             size="icon" 
             className={cn("rounded-full transition-colors", showMenu ? "bg-zinc-100 text-black" : "text-zinc-400")}
             onClick={() => setShowMenu(!showMenu)}
            >
               <MoreVertical className="w-5 h-5" />
            </Button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-zinc-100 p-1.5 z-50 overflow-hidden"
                  >
                     {[
                       { label: "View Profile", icon: Info, onClick: () => navigate(`/user/vendor-profile/${vendorId}`) },
                       { label: "Share Contact", icon: Send, onClick: () => {
                         if (navigator.share) {
                           navigator.share({ title: vendor.name, text: 'Vendor Contact', url: window.location.href });
                         }
                         setShowMenu(false);
                       }},
                       { label: "Block Vendor", icon: X, color: "text-red-500", onClick: () => {
                         alert("Vendor blocked successfully");
                         setShowMenu(false);
                       }},
                     ].map((item, i) => (
                       <button 
                         key={i}
                         className={cn(
                           "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-tighter hover:bg-zinc-50 transition-colors",
                           item.color || "text-zinc-600"
                         )}
                         onClick={() => {
                           if (item.onClick) item.onClick();
                           else setShowMenu(false);
                         }}
                       >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                       </button>
                     ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
         </div>
      </header>

      <div className="bg-white border-b border-zinc-100 p-2 px-4 flex gap-2 overflow-x-auto no-scrollbar relative z-30">
         <Button 
            onClick={() => navigate(`/user/finalize/${requestId}/${vendorId}`)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-9 px-4 text-[10px] font-black uppercase tracking-widest shrink-0 border-none"
         >
            Accept {vendor.quote}
         </Button>
         <Button 
            onClick={() => setShowCounterModal(true)}
            className="bg-primary text-black hover:bg-yellow-400 rounded-xl h-9 px-4 text-[10px] font-black uppercase tracking-widest shrink-0 border-none"
         >
            Counter Offer
         </Button>
         <div className="w-px h-6 bg-zinc-100 self-center mx-1 shrink-0"></div>
         <Button 
            variant="ghost"
            className="text-zinc-400 font-bold text-[9px] uppercase tracking-wider shrink-0 h-9 px-3"
         >
            Request Fleet Photos
         </Button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-32 space-y-2.5 no-scrollbar scroll-smooth"
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
                  "rounded-[1.25rem] text-[13px] leading-snug shadow-sm relative font-medium overflow-hidden",
                  msg.type === "offer" ? "bg-zinc-900 text-white border-2 border-primary/40" :
                  msg.sender === "user" 
                    ? "bg-primary text-black rounded-tr-none shadow-primary/10 border border-primary/20" 
                    : "bg-white text-zinc-900 rounded-tl-none shadow-zinc-100 border border-zinc-100"
               )}>
                  {msg.image ? (
                    <img src={msg.image} alt="shared" className="max-w-full h-auto rounded-lg mb-1" />
                  ) : msg.type === "offer" ? (
                    <div className="p-4 space-y-2">
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="font-black uppercase tracking-widest text-[9px]">Offer Sent</span>
                       </div>
                       <p className="text-xl font-black text-primary tabular-nums">{msg.text.split(': ')[1]}</p>
                       <p className="text-[8px] text-zinc-500 font-bold uppercase">Awaiting vendor response</p>
                    </div>
                  ) : (
                    <div className="p-2.5 px-4">{msg.text}</div>
                  )}
                  <div className={cn(
                    "flex items-center gap-1 mt-1 justify-end px-3 pb-1.5",
                    msg.sender === "user" ? "opacity-60" : "opacity-40"
                  )}>
                     <span className="text-[8px] font-bold uppercase tracking-tighter">{msg.time}</span>
                     {msg.sender === "user" && (
                       <CheckCircle2 className="w-2.5 h-2.5" />
                     )}
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 pt-1 bg-white border-t border-zinc-100 pb-3">
        <div className="flex items-end gap-2 bg-zinc-50 p-2 rounded-[1.5rem] border border-zinc-200">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                const newMessage = {
                  id: Date.now(),
                  sender: "user",
                  text: "Shared an image",
                  image: URL.createObjectURL(e.target.files[0]),
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: "sent"
                };
                setMessages([...messages, newMessage]);
              }
            }}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-zinc-400 shrink-0 h-10 w-10 hover:bg-zinc-100 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
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

      {/* Counter Offer Modal */}
      <AnimatePresence>
         {showCounterModal && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowCounterModal(false)}
                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", damping: 30, stiffness: 300 }}
                 className="relative w-full max-w-md bg-white rounded-t-[2.5rem] p-6 pb-10 shadow-2xl"
               >
                  <div className="w-12 h-1.5 bg-zinc-100 rounded-full mx-auto mb-6"></div>
                  <div className="space-y-6">
                     <div className="text-center space-y-1">
                        <h3 className="text-lg font-black text-zinc-900 uppercase italic">Make a Counter Offer</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vendor Quote: {vendor.quote}</p>
                     </div>

                     <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-zinc-300 italic">₹</span>
                        <input 
                           type="number"
                           placeholder="0"
                           value={counterPrice}
                           onChange={(e) => setCounterPrice(e.target.value)}
                           className="w-full h-20 bg-zinc-50 rounded-[1.5rem] border-none text-center text-4xl font-black focus:ring-2 focus:ring-primary/20 outline-none tabular-nums"
                        />
                     </div>

                     <div className="flex gap-3">
                        <Button 
                          variant="ghost"
                          onClick={() => setShowCounterModal(false)}
                          className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border border-zinc-100"
                        >
                           Cancel
                        </Button>
                        <Button 
                          onClick={handleCounterOffer}
                          disabled={!counterPrice}
                          className="flex-[2] h-14 rounded-2xl bg-zinc-900 text-primary font-black text-xs uppercase tracking-widest shadow-xl shadow-zinc-900/20"
                        >
                           Send Offer
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

export default ChatPage;
