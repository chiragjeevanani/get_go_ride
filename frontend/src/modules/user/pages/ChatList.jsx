import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronRight, MessageSquare, Clock, Filter, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { requirementApi, chatApi } from "@/lib/api";
import driver1 from "@/assets/Driver/driver1.jpg";
import driver2 from "@/assets/Driver/driver2.jpg";
import driver3 from "@/assets/Driver/driver3.jpg";

const ChatList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadRealChats();
  }, []);

  const loadRealChats = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getUserActiveChats();
      const activeChats = res.data || res || [];
      
      const formattedChats = activeChats.map((c) => {
        const vendorInfo = c.vendor || {};
        const reqInfo = c.requirement || {};
        
        const serviceName = reqInfo.serviceType 
          ? `${reqInfo.serviceType.toUpperCase()} - ${reqInfo.requirementId || reqInfo._id.substring(0, 6).toUpperCase()}` 
          : "Logistics Ride";
          
        let timeStr = "Just now";
        try {
          const d = new Date(c.lastMessage?.createdAt || reqInfo.createdAt);
          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {}

        return {
          id: c.id,
          vendorName: vendorInfo.businessName || vendorInfo.name || "Vijay Logistics",
          avatar: vendorInfo.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${vendorInfo.businessName || "VL"}`,
          lastMessage: c.lastMessage?.text || `Proposal received: ₹${c.amount}`,
          time: timeStr,
          unread: 0,
          requirement: serviceName,
          status: reqInfo.status || "ongoing",
          requestId: reqInfo._id,
          vendorId: vendorInfo._id || "v1"
        };
      });

      setChats(formattedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-zinc-500">Loading Conversations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 pt-4 px-4">
      <header className="flex flex-col gap-1.5 py-1.5 border-b-2 border-primary/20 -mx-4 px-4 sticky top-0 bg-white/80 backdrop-blur-lg z-30">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold text-black tracking-widest uppercase">Messages</h1>
        </div>

        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-black transition-colors" />
          <Input 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8.5 bg-zinc-50 border-none rounded-lg text-[10px] font-medium focus-visible:ring-primary/30"
          />
        </div>
      </header>

      <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl w-fit">
        {["all", "unread", "archived"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all",
              activeTab === tab ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {chats
          .filter(c => {
            if (activeTab === "unread") return c.unread > 0;
            if (activeTab === "archived") return c.status === "archived";
            return true;
          })
          .filter(c => c.vendorName.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((chat) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/user/chat/${chat.requestId}/${chat.vendorId}`)}
          >
            <Card className="border-2 border-primary/10 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden relative rounded-xl bg-white">
              {chat.unread > 0 && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              <CardContent className="p-3 flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-50 shadow-sm">
                    <img src={chat.avatar} alt="vendor" className="w-full h-full object-cover" />
                  </div>
                  {chat.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {chat.unread}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-black text-black text-xs truncate uppercase tracking-tight">{chat.vendorName}</span>
                    <span className="text-[9px] font-black text-zinc-400 whitespace-nowrap uppercase tracking-tighter">{chat.time}</span>
                  </div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 truncate">
                    {chat.requirement}
                  </span>
                  <p className="text-[11px] font-bold text-zinc-500 line-clamp-1 group-hover:text-zinc-900 transition-colors">
                    {chat.lastMessage}
                  </p>
                </div>
                
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {chats.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center">
               <MessageSquare className="w-10 h-10 text-zinc-200" />
            </div>
            <div className="space-y-1">
               <h3 className="text-zinc-900 font-bold">No messages yet</h3>
               <p className="text-xs text-zinc-400 max-w-[200px]">Start posting requirements to receive quotes and chat with vendors.</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default ChatList;
