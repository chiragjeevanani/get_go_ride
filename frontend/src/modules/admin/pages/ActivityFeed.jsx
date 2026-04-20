import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Clock, Radio, 
  UserPlus, Truck, Layers, 
  CreditCard, ShieldCheck, AlertTriangle,
  ChevronRight, Filter, Search,
  ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ACTIVITY_TYPES = {
  USER: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  VENDOR: { icon: Truck, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  LEAD: { icon: Layers, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  PAYMENT: { icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  SYSTEM: { icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ALERT: { icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

const MOCK_ACTIVITIES = [
  { id: 1, type: "LEAD", user: "Rajesh Kumar", action: "created a new lead", target: "House Shifting (Indore Local)", time: "2 mins ago", detail: "Lead #8942 finalized with budget range ₹4,500 - ₹6,000" },
  { id: 2, type: "VENDOR", user: "Super Fast Movers", action: "submitted a bid", target: "Lead #8940", time: "5 mins ago", detail: "Proposed bid: ₹5,200 with 3 helpers included." },
  { id: 3, type: "USER", user: "Anjali Sharma", action: "registered a new account", target: "Standard User", time: "12 mins ago", detail: "Verification email successfully delivered to anjali.s@gmail.com" },
  { id: 4, type: "PAYMENT", user: "Gajanan Logistics", action: "renewed subscription", target: "Premium Yearly Plan", time: "18 mins ago", detail: "Transaction ID: TXN_904321 finalized for ₹12,999." },
  { id: 5, type: "ALERT", user: "System Monitor", action: "flagged a review", target: "Review #1233", time: "25 mins ago", detail: "Possible spam detected in review for vendor 'City Reliable Movers'." },
  { id: 6, type: "SYSTEM", user: "Admin", action: "updated platform logic", target: "Matching Radius", time: "40 mins ago", detail: "Global scan radius increased from 30km to 50km." },
  { id: 7, type: "LEAD", user: "Vikram Singh", action: "closed a deal", target: "Lead #8902", time: "1 hour ago", detail: "Completed shifting from Vijay Nagar to Bhawarkua." },
];

const ActivityFeed = () => {
  const [activities, setActivities] = useState(MOCK_ACTIVITIES);
  const [filter, setFilter] = useState("ALL");

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        type: ["LEAD", "VENDOR", "USER", "PAYMENT"][Math.floor(Math.random() * 4)],
        user: "Live System",
        action: "detected new interaction",
        target: "Real-time Node",
        time: "Just now",
        detail: "Live telemetry data stream processing incoming request."
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 14)]);
    }, 15000); // Add a new item every 15s to feel alive

    return () => clearInterval(interval);
  }, []);

  const filteredActivities = filter === "ALL" 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Live Signal" 
        subtitle="Real-time Command Center for all platform interactions" 
        actions={
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl relative overflow-hidden group">
             <Radio className="w-4 h-4 text-rose-500 animate-pulse relative z-10" />
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white relative z-10">Live Signal: Active</span>
             <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors" />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Stats Sidebar */}
         <div className="space-y-6">
            <div className="admin-card p-6 border-zinc-200 dark:border-zinc-900 space-y-4">
               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Traffic Intensity
               </h3>
               <div className="space-y-4">
                  {[
                    { label: "Leads/Hr", val: "24", trend: "up" },
                    { label: "Vendor Bids", val: "142", trend: "up" },
                    { label: "Alerts Logged", val: "03", trend: "down" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-zinc-400 uppercase">{stat.label}</span>
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-zinc-900 dark:text-white italic">{stat.val}</span>
                          {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-rose-500" />}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="admin-card p-6 border-zinc-200 dark:border-zinc-900 space-y-4">
               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Signal Filters
               </h3>
               <div className="space-y-2">
                  {["ALL", "LEAD", "VENDOR", "USER", "PAYMENT", "ALERT"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                        filter === f ? "bg-primary text-black" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      )}
                    >
                       <span className="text-[9px] font-black uppercase tracking-widest">{f === "ALL" ? "Full Spectrum" : f}</span>
                       {filter === f && <Zap className="w-3 h-3 fill-black" />}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Main Feed */}
         <div className="lg:col-span-3 space-y-4">
            <AnimatePresence initial={false}>
               {filteredActivities.map((activity) => {
                  const typeInfo = ACTIVITY_TYPES[activity.type];
                  return (
                    <motion.div
                      key={activity.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className="admin-card p-6 border-zinc-200 dark:border-zinc-900 flex gap-6 hover:border-primary/20 transition-all relative overflow-hidden group"
                    >
                       <div className={cn("w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border", typeInfo.bg, typeInfo.color, typeInfo.border)}>
                          <typeInfo.icon className="w-6 h-6" />
                       </div>

                       <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">{activity.user}</span>
                                <Badge className="bg-zinc-100 dark:bg-zinc-900 border-none text-[8px] font-black uppercase tracking-widest text-zinc-500 px-2">
                                   {activity.action}
                                </Badge>
                             </div>
                             <div className="flex items-center gap-2 text-zinc-500">
                                <Clock className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest italic">{activity.time}</span>
                             </div>
                          </div>

                          <div className="space-y-1">
                             <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">
                                {activity.target}
                             </h4>
                             <p className="text-[11px] font-bold text-zinc-500 uppercase leading-relaxed tracking-tight">
                                {activity.detail}
                             </p>
                          </div>
                       </div>
                       
                       <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4 text-primary" />
                       </Button>

                       {/* Decorative scanline effect */}
                       <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/5 animate-scan" />
                    </motion.div>
                  );
               })}
            </AnimatePresence>

            {filteredActivities.length === 0 && (
               <div className="admin-card p-20 flex flex-col items-center justify-center gap-4 text-center border-dashed">
                  <Radio className="w-12 h-12 text-zinc-800 animate-pulse" />
                  <div className="space-y-1">
                     <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">No Signal Found</h3>
                     <p className="text-[10px] font-bold text-zinc-600 uppercase">Adjust filters to re-establish connection</p>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
