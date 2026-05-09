import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Send, Image, MoreVertical, 
  CheckCircle2, Info, Star, ShieldCheck, X, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { chatApi } from "@/lib/api";
import { io } from "socket.io-client";

const ChatPage = () => {
  const { requestId, vendorId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // Dynamic States
  const [activeBid, setActiveBid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  
  const socketRef = useRef(null);

  // Initialize Socket.io Connection
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

  // Fetch Message History on Mount
  useEffect(() => {
    loadChatData();
  }, [requestId, vendorId]);

  const loadChatData = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getCompositeMessages(requestId, vendorId);
      const data = res.data || {};
      setActiveBid(data.bid);
      
      const dbMessages = (data.messages || []).map((m) => ({
        id: m._id,
        sender: m.senderRole,
        type: m.type,
        text: m.text,
        image: m.image,
        price: m.price,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: m.status
      }));

      setMessages(dbMessages);
    } catch (err) {
      console.error("Error loading chat data:", err);
      toast.error("Could not load negotiation history.");
    } finally {
      setLoading(false);
    }
  };

  // Bind Room Events once activeBid is loaded
  useEffect(() => {
    if (activeBid?._id && socketRef.current) {
      socketRef.current.emit("join_chat", { bidId: activeBid._id });

      // Live message receipt listener
      socketRef.current.on("receive_message", (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg._id)) return prev;
          return [
            ...prev,
            {
              id: newMsg._id,
              sender: newMsg.senderRole,
              type: newMsg.type,
              text: newMsg.text,
              image: newMsg.image,
              price: newMsg.price,
              time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: newMsg.status
            }
          ];
        });
      });

      // Live price update listener
      socketRef.current.on("bid_updated", ({ bidId, amount }) => {
        if (activeBid._id === bidId) {
          setActiveBid((prev) => ({ ...prev, amount }));
        }
      });

      // Live contract finalized listener
      socketRef.current.on("deal_accepted", ({ bidId }) => {
        if (activeBid._id === bidId) {
          toast.success("Deal Accepted! Navigating to finalize booking...", {
            icon: "🤝"
          });
          setTimeout(() => {
            navigate(`/user/finalize/${requestId}/${vendorId}`);
          }, 1500);
        }
      });

      // Live contract reopened listener
      socketRef.current.on("deal_reopened", ({ bidId }) => {
        if (activeBid._id === bidId) {
          setActiveBid((prev) => ({ ...prev, status: "pending" }));
          toast.info("Negotiation reopened! Chat is unlocked.", {
            icon: "⚠️"
          });
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit("leave_chat", { bidId: activeBid._id });
          socketRef.current.off("receive_message");
          socketRef.current.off("bid_updated");
          socketRef.current.off("deal_accepted");
          socketRef.current.off("deal_reopened");
        }
      };
    }
  }, [activeBid?._id]);

  const handleMessageChange = (val) => {
    if (/[0-9]/.test(val)) {
      toast.warning("Direct numbers are blocked in chat text. Please use the 'Counter Offer' button to suggest a price!");
      const cleaned = val.replace(/[0-9]/g, "");
      setMessage(cleaned);
    } else {
      setMessage(val);
    }
  };

  const handleCounterOffer = async () => {
    if (!counterPrice || isNaN(counterPrice) || Number(counterPrice) <= 0) {
      return toast.error("Please enter a valid price.");
    }
    try {
      await chatApi.sendCompositeOffer(requestId, vendorId, Number(counterPrice));
      setCounterPrice("");
      setShowCounterModal(false);
      toast.success("Counter offer submitted!");
    } catch (err) {
      console.error("Counter offer failed:", err);
      toast.error(err.response?.data?.message || "Could not submit offer.");
    }
  };

  const handleAcceptDeal = () => {
    navigate(`/user/finalize/${requestId}/${vendorId}`);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const bodyText = message;
    setMessage("");

    try {
      await chatApi.sendCompositeMessage(requestId, vendorId, { text: bodyText, type: "text" });
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Message could not be sent.");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 h-screen bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-4">Connecting to room...</p>
      </div>
    );
  }

  const vendorInfo = activeBid?.vendor || {};
  const vendor = {
    name: vendorInfo.businessName || vendorInfo.name || "Shiv Logistics",
    rating: vendorInfo.rating || 4.8,
    isVerified: vendorInfo.isVerified || false,
    avatar: vendorInfo.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${vendorInfo.businessName || "VL"}`,
    quote: `₹${activeBid?.amount || 0}`
  };

  return (
    <div className="flex flex-col h-screen -m-4 bg-zinc-50 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 p-4 pt-8 sticky top-0 z-40 safe-area-top shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-zinc-100 flex items-center justify-center font-black text-black text-xs overflow-hidden">
            <img src={vendor.avatar} alt="avatar" className="w-full h-full object-cover" />
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

      {/* Action Strip */}
      <div className="bg-white border-b border-zinc-100 p-2 px-4 flex gap-2 overflow-x-auto no-scrollbar relative z-30">
        {activeBid?.status === "accepted" ? (
          <Button 
            onClick={() => navigate(`/user/finalize/${requestId}/${vendorId}`)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-9 px-4 text-[10px] font-black uppercase tracking-widest shrink-0 border-none animate-pulse shadow-md shadow-emerald-500/20"
          >
            Go to Finalization Page
          </Button>
        ) : (
          <Button 
            onClick={handleAcceptDeal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-9 px-4 text-[10px] font-black uppercase tracking-widest shrink-0 border-none"
          >
            Accept {vendor.quote}
          </Button>
        )}
        <Button 
          onClick={() => setShowCounterModal(true)}
          disabled={activeBid?.status === "accepted"}
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

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-32 space-y-2.5 no-scrollbar scroll-smooth"
      >
        <div className="flex justify-center my-6">
          <Badge variant="outline" className="bg-white/50 text-zinc-400 text-[9px] uppercase font-bold tracking-widest border-zinc-100 rounded-full px-3">
            Active Conversation
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
                  <div className="p-4 space-y-2 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="font-black uppercase tracking-widest text-[9px]">
                        {msg.sender === "user" ? "Counter Offer Sent" : "Official Proposal Received"}
                      </span>
                    </div>
                    <p className="text-xl font-black text-primary tabular-nums">
                      ₹{msg.price || msg.text}
                    </p>
                    <p className="text-[8px] text-zinc-400 font-bold uppercase">
                      {msg.sender === "user" ? "Awaiting driver response" : "Review and accept deal above"}
                    </p>
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

      {/* Input Tray */}
      <div className="p-4 pt-1 bg-white border-t border-zinc-100 pb-3">
        <div className="flex items-end gap-2 bg-zinc-50 p-2 rounded-[1.5rem] border border-zinc-200">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            disabled={activeBid?.status === "accepted"}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                toast.info("Image upload not configured; sending mock dynamic state.");
              }
            }}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={activeBid?.status === "accepted"}
            className="rounded-full text-zinc-400 shrink-0 h-10 w-10 hover:bg-zinc-100 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-5 h-5" />
          </Button>
          <textarea 
            rows={1}
            placeholder={activeBid?.status === "accepted" ? "Deal is completed" : "Type a message..."}
            value={message}
            disabled={activeBid?.status === "accepted"}
            onChange={(e) => handleMessageChange(e.target.value)}
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
            disabled={!message.trim() || activeBid?.status === "accepted"}
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
