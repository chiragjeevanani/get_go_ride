import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronRight, MessageSquare, Clock, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const ChatList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const chats = [
    {
      id: "1",
      vendorName: "Vijay Logistics",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vijay",
      lastMessage: "I can provide a 14ft container at ₹5500.",
      time: "10:30 AM",
      unread: 2,
      requirement: "House Shifting - REQ-101",
      status: "ongoing",
      requestId: "REQ-101",
      vendorId: "v1"
    },
    {
      id: "2",
      vendorName: "Rahul Transports",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      lastMessage: "Which date are you planning to shift?",
      time: "Yesterday",
      unread: 0,
      requirement: "House Shifting - REQ-101",
      status: "ongoing",
      requestId: "REQ-101",
      vendorId: "v2"
    },
    {
      id: "3",
      vendorName: "Super Fast Cabs",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cab",
      lastMessage: "Booking confirmed for tomorrow.",
      time: "2 days ago",
      unread: 0,
      requirement: "Airport Drop - REQ-089",
      status: "completed",
      requestId: "REQ-089",
      vendorId: "v3"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-black tracking-tight">Messages</h1>
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
            <Filter className="w-5 h-5" />
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-black transition-colors" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-12 h-14 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus-visible:ring-primary/30"
          />
        </div>
      </header>

      <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black transition-all",
            activeTab === "all" ? "bg-white text-black shadow-sm" : "text-zinc-500"
          )}
        >
          ALL
        </button>
        <button 
          onClick={() => setActiveTab("unread")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black transition-all",
            activeTab === "unread" ? "bg-white text-black shadow-sm" : "text-zinc-500"
          )}
        >
          UNREAD
        </button>
        <button 
          onClick={() => setActiveTab("archived")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black transition-all",
            activeTab === "archived" ? "bg-white text-black shadow-sm" : "text-zinc-500"
          )}
        >
          ARCHIVED
        </button>
      </div>

      <div className="space-y-3">
        {chats.map((chat) => (
          <motion.div
            key={chat.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/user/chat/${chat.requestId}/${chat.vendorId}`)}
          >
            <Card className="border-none shadow-premium hover:shadow-md transition-all cursor-pointer group overflow-hidden relative">
              {chat.unread > 0 && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-zinc-100">
                    <img src={chat.avatar} alt="vendor" className="w-full h-full object-cover" />
                  </div>
                  {chat.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {chat.unread}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-black text-black truncate">{chat.vendorName}</span>
                    <span className="text-[10px] font-bold text-zinc-400 whitespace-nowrap">{chat.time}</span>
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                    {chat.requirement}
                  </span>
                  <p className="text-xs text-zinc-500 line-clamp-1 group-hover:text-zinc-900 transition-colors">
                    {chat.lastMessage}
                  </p>
                </div>
                
                <ChevronRight className="w-5 h-5 text-zinc-200 group-hover:text-black group-hover:translate-x-1 transition-all" />
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
