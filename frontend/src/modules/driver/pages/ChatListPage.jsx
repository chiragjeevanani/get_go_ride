import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, MessageSquare, ChevronRight, 
  Clock, CheckCircle2, MoreVertical, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";

const ChatListPage = () => {
  const navigate = useNavigate();
  const { leads } = useDriverState();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock active chats based on leads (simulating accepted leads with conversations)
  const activeChats = [
    {
      id: "L-001",
      userName: "John Doe",
      lastMsg: "Thanks, let me check and get back to you.",
      time: "12:35 PM",
      unread: 0,
      service: "Goods Transport",
      status: "Negotiating"
    },
    {
      id: "L-002",
      userName: "Anita Sharma",
      lastMsg: "Can we do it for ₹1800?",
      time: "11:20 AM",
      unread: 2,
      service: "House Shifting",
      status: "Waiting"
    },
    {
      id: "L-003",
      userName: "Vikram Singh",
      lastMsg: "See you at 4 PM tomorrow.",
      time: "Yesterday",
      unread: 0,
      service: "Passenger",
      status: "Finalized"
    }
  ];

  const filteredChats = activeChats.filter(chat => 
    chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-24 pt-4 px-1"
    >
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-black text-black tracking-tight leading-none uppercase italic">Messages</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Active Negotiations</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl bg-zinc-50 border border-zinc-100">
            <MoreVertical className="w-5 h-5 text-zinc-400" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative group px-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-12 h-14 bg-zinc-50 border-zinc-100 rounded-[1.25rem] font-bold text-xs focus:bg-white transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

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
                    className="border-2 border-zinc-50 shadow-sm hover:shadow-md hover:border-primary/10 transition-all cursor-pointer rounded-3xl overflow-hidden bg-white group"
                  >
                     <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors relative shrink-0">
                           {chat.userName.split(' ').map(n => n[0]).join('')}
                           {chat.unread > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center">
                                 {chat.unread}
                              </div>
                           )}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                           <div className="flex justify-between items-center">
                              <h3 className="font-black text-sm text-black uppercase tracking-tight truncate">{chat.userName}</h3>
                              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{chat.time}</span>
                           </div>
                           
                           <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest h-4 px-1.5 border-zinc-100 text-zinc-400 bg-zinc-50/50">
                                 {chat.service}
                              </Badge>
                              {chat.status === "Finalized" && (
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none text-[7px] font-black uppercase tracking-widest h-4 px-1.5">
                                    Finalized
                                 </Badge>
                              )}
                           </div>
                           
                           <p className={cn(
                              "text-xs truncate max-w-full",
                              chat.unread > 0 ? "font-black text-black" : "font-bold text-zinc-400"
                           )}>
                              {chat.lastMsg}
                           </p>
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-zinc-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                     </CardContent>
                  </Card>
               </motion.div>
            ))
         ) : (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center space-y-4">
               <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center grayscale opacity-20">
                  <MessageSquare className="w-10 h-10" />
               </div>
               <div className="space-y-1">
                  <h3 className="font-black text-black uppercase tracking-tight">No messages found</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Start a conversation by accepting a lead!</p>
               </div>
               <Button 
                  onClick={() => navigate("/driver/leads")}
                  className="bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-xl px-6"
               >
                  Browse Leads
               </Button>
            </div>
         )}
      </section>

      {/* Quick Stats Card */}
      <Card className="bg-zinc-900 border-none p-5 rounded-[2rem] mx-1 relative overflow-hidden group">
         <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
               <Zap className="w-6 h-6 text-primary" fill="currentColor" />
            </div>
            <div className="space-y-0.5 text-white">
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Average Response Time</p>
               <h4 className="text-xl font-black italic uppercase tracking-tight">4 Minutes</h4>
            </div>
         </div>
         <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
      </Card>
    </motion.div>
  );
};

export default ChatListPage;
