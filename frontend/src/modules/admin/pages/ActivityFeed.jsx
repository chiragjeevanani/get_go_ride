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
import { adminApi } from '@/lib/api';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACTIVITY_TYPES = {
  USER: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  VENDOR: { icon: Truck, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  LEAD: { icon: Layers, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  PAYMENT: { icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  SYSTEM: { icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ALERT: { icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    const diff = Math.floor((new Date() - d) / 60000); // diff in minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} mins ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return d.toLocaleDateString();
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const [users, vendors, leads, statsRes] = await Promise.all([
        adminApi.getAllUsers({ limit: 10 }),
        adminApi.getAllVendors({ limit: 10 }),
        adminApi.getAllRequirements({ limit: 10 }),
        adminApi.getStats()
      ]);

      setStats(statsRes.data);

      const userActs = (users.data || []).map(u => ({
        id: `u-${u._id}`,
        type: 'USER',
        user: u.name || 'New User',
        action: 'registered an account',
        target: u.role || 'User',
        time: formatTime(u.createdAt),
        createdAt: new Date(u.createdAt).getTime(),
        detail: `Verified: ${u.isVerified}`
      }));

      const vendorActs = (vendors.data || []).map(v => ({
        id: `v-${v._id}`,
        type: 'VENDOR',
        user: v.name || 'New Vendor',
        action: 'joined platform',
        target: 'Transport Partner',
        time: formatTime(v.createdAt),
        createdAt: new Date(v.createdAt).getTime(),
        detail: `Vehicle: ${v.vehicleRegNumber || 'N/A'}`
      }));

      const leadActs = (leads.data || []).map(l => ({
        id: `l-${l._id}`,
        type: 'LEAD',
        user: l.user?.name || 'Unknown',
        action: 'created a new lead',
        target: l.serviceType,
        time: formatTime(l.createdAt),
        createdAt: new Date(l.createdAt).getTime(),
        detail: `From: ${l.pickup?.address} to ${l.drops?.[0]?.address || 'Local'}`
      }));

      const all = [...userActs, ...vendorActs, ...leadActs].sort((a, b) => b.createdAt - a.createdAt);
      setActivities(all);
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
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
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl relative overflow-hidden group hidden sm:flex">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse relative z-10" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white relative z-10">Live Signal: Active</span>
                <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors" />
             </div>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-black text-[10px] uppercase tracking-widest gap-2">
                   <Filter className="w-3.5 h-3.5 text-zinc-500" />
                   Filter: {filter === "ALL" ? "Full Spectrum" : filter}
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl p-2 shadow-2xl">
                 {["ALL", "LEAD", "VENDOR", "USER", "PAYMENT", "ALERT"].map((f) => (
                    <DropdownMenuItem 
                      key={f} 
                      onClick={() => setFilter(f)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer flex items-center justify-between py-2.5",
                        filter === f ? "bg-primary/10 text-primary focus:bg-primary/20 focus:text-primary" : "text-zinc-500 focus:bg-zinc-100 dark:focus:bg-zinc-900"
                      )}
                    >
                      {f === "ALL" ? "Full Spectrum" : f}
                      {filter === f && <Zap className="w-3 h-3" />}
                    </DropdownMenuItem>
                 ))}
               </DropdownMenuContent>
             </DropdownMenu>
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
                    { label: "Total Leads", val: stats?.totalRequirements || "0", trend: "up" },
                    { label: "Total Vendors", val: stats?.totalVendors || "0", trend: "up" },
                    { label: "Pending Approvals", val: stats?.pendingVendors || "0", trend: "down" },
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
