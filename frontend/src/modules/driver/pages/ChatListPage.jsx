import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, MessageSquare, ChevronRight, 
  Clock, CheckCircle2, MoreVertical, Zap,
  CheckCheck, Archive, Settings, HelpCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";
import { chatApi } from "@/lib/api";

const ChatListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveChats();
  }, []);

  const loadActiveChats = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getDriverActiveChats();
      const activeChats = res.data || res || [];
      
      const formatted = activeChats.map((c) => {
        const reqInfo = c.requirement || {};
        const userInfo = reqInfo.user || {};
        
        let timeStr = "Just now";
        try {
          const d = new Date(c.lastMessage?.createdAt || reqInfo.createdAt);
          timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch (e) {}

        return {
          id: c.id, // Bid ID
          userName: userInfo.name || "Customer",
          lastMsg: c.lastMessage?.text || `Proposal sent: ₹${c.amount}`,
          time: timeStr,
          unread: 0,
          service: reqInfo.serviceType ? reqInfo.serviceType.toUpperCase() : "LOGISTICS",
          status: c.status === "accepted" ? "Finalized" : "Negotiating"
        };
      });

      setChats(formatted);
    } catch (err) {
      console.error("Error loading driver active chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-4">Retrieving active chats...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-24 pt-0 px-4"
    >
      {/* Header */}
      <header className="flex flex-col gap-3 -mx-4 px-4 py-3 border-b-2 border-yellow-400 sticky top-0 bg-white/90 backdrop-blur-md z-30 mb-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none">Messages</h1>
              <p className="text-[10px] font-semibold text-zinc-500 tracking-tight mt-1">Active Negotiations</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100">
                <MoreVertical className="w-4 h-4 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-zinc-100">
              <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest text-zinc-400 px-3 py-2">Chat Options</DropdownMenuLabel>
              <DropdownMenuItem className="rounded-xl focus:bg-primary/10 focus:text-primary py-2.5 px-3 cursor-pointer">
                <CheckCheck className="w-4 h-4 mr-2" />
                <span className="font-bold text-xs">Mark all as read</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl focus:bg-primary/10 focus:text-primary py-2.5 px-3 cursor-pointer">
                <Archive className="w-4 h-4 mr-2" />
                <span className="font-bold text-xs">Archived Messages</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-zinc-50" />
              <DropdownMenuItem className="rounded-xl focus:bg-primary/10 focus:text-primary py-2.5 px-3 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                <span className="font-bold text-xs">Message Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl focus:bg-primary/10 focus:text-primary py-2.5 px-3 cursor-pointer">
                <HelpCircle className="w-4 h-4 mr-2" />
                <span className="font-bold text-xs">Help & Support</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search conversations..." 
          className="pl-12 h-11 bg-zinc-50 border-zinc-100 rounded-xl font-bold text-xs focus:bg-white transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Chat List */}
      <section className="space-y-3">
         {filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
               <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
               >
                  <Card 
                    onClick={() => navigate(`/driver/chat/${chat.id}`)}
                    className="border border-zinc-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer rounded-2xl overflow-hidden bg-white group"
                  >
                     <CardContent className="p-3.5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center font-bold text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors relative shrink-0 border border-zinc-100 shadow-sm">
                           {chat.userName.split(' ').map(n => n[0]).join('')}
                           {chat.unread > 0 && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-zinc-900 text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                 {chat.unread}
                              </div>
                           )}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-0.5">
                           <div className="flex justify-between items-center">
                              <h3 className="font-bold text-sm text-zinc-900 tracking-tight truncate">{chat.userName}</h3>
                              <span className="text-[9px] font-bold text-zinc-400 tracking-tight">{chat.time}</span>
                           </div>
                           
                           <div className="flex items-center gap-2 mb-0.5">
                              <Badge variant="outline" className="text-[8px] font-bold tracking-tight h-4 px-1.5 border-zinc-100 text-zinc-500 bg-zinc-50/50">
                                 {chat.service}
                              </Badge>
                              {chat.status === "Finalized" && (
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-bold tracking-tight h-4 px-1.5">
                                    Finalized
                                 </Badge>
                              )}
                           </div>
                           
                           <p className={cn(
                              "text-[11px] truncate max-w-full",
                              chat.unread > 0 ? "font-bold text-zinc-900" : "font-semibold text-zinc-400"
                           )}>
                              {chat.lastMsg}
                           </p>
                        </div>
                        
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-200 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
                     </CardContent>
                  </Card>
               </motion.div>
            ))
         ) : (
            <div className="flex flex-col items-center justify-center py-16 px-10 text-center space-y-4">
               <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center grayscale opacity-20">
                  <MessageSquare className="w-8 h-8" />
               </div>
               <div className="space-y-1">
                  <h3 className="font-bold text-zinc-900 tracking-tight">No messages found</h3>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">Start a conversation by accepting a lead!</p>
               </div>
               <Button 
                  onClick={() => navigate("/driver/leads")}
                  className="bg-primary text-zinc-900 font-bold text-[10px] rounded-xl px-6 h-9"
               >
                  Browse Leads
               </Button>
            </div>
         )}
      </section>

      {/* Quick Stats Card */}
      <Card className="bg-zinc-900 border-none p-4.5 rounded-2xl relative overflow-hidden group">
         <div className="relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
               <Zap className="w-5 h-5 text-primary" fill="currentColor" />
            </div>
            <div className="space-y-0.5 text-white">
               <p className="text-[10px] font-bold text-zinc-400 tracking-tight">Average Response Time</p>
               <h4 className="text-xl font-bold tracking-tight">4 Minutes</h4>
            </div>
         </div>
         <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
      </Card>
    </motion.div>
  );
};

export default ChatListPage;
