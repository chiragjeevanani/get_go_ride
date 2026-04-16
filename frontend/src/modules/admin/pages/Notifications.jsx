import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Truck, CreditCard, 
  Layers, Settings, AlertTriangle,
  Clock, CheckCircle2, MoreVertical,
  Mail, MessageSquare, ShieldCheck,
  Filter, Trash2, Ghost
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Button } from "@/components/ui/button";
import { mockNotifications } from '../data/mockData';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Notifications = () => {
  const getIcon = (type) => {
    switch (type) {
      case 'vendor': return <Truck className="w-5 h-5 text-primary" />;
      case 'subscription': return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'leads': return <Layers className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'vendor': return "bg-primary/10 text-primary border-primary/20";
      case 'subscription': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case 'leads': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-zinc-800 text-zinc-500 border-zinc-700";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="System Notifications" 
        subtitle="Manage platform alerts and administrative reports" 
        actions={
          <div className="flex items-center gap-2">
             <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl">
                Mark All Read
             </Button>
             <Button variant="outline" className="border-rose-500/20 bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl">
                Clear All
             </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Filter Sidebar */}
         <div className="space-y-6">
            <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900 overflow-hidden relative group">
               <div className="relative z-10 space-y-6">
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                     <Filter className="w-4 h-4 text-primary" />
                     Alert Categories
                  </h3>
                  
                  <div className="space-y-2">
                     {[
                       { id: 'all', label: 'All Alerts', count: 42 },
                       { id: 'vendor', label: 'Vendor Events', count: 12 },
                       { id: 'subs', label: 'Subscription Alerts', count: 8 },
                       { id: 'leads', label: 'Leads activity', count: 15 },
                       { id: 'system', label: 'System Health', count: 7 },
                     ].map((filter) => (
                       <button
                         key={filter.id}
                         className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:text-white transition-all group/btn"
                       >
                         <span className="text-[10px] font-black uppercase tracking-widest">{filter.label}</span>
                         <Badge className="bg-zinc-50 dark:bg-zinc-950 text-zinc-600 border-zinc-200 dark:border-zinc-800 text-[9px] group-hover/btn:bg-primary group-hover/btn:text-black transition-all">
                            {filter.count}
                         </Badge>
                       </button>
                     ))}
                  </div>
               </div>
               <Bell className="absolute -right-4 -bottom-4 w-32 h-32 text-primary opacity-[0.02] rotate-[-15deg]" />
            </div>

            <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900">
               <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-zinc-500" />
                  Email Digest
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-900">
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Daily Summary</span>
                     <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative p-0.5 border border-emerald-500/20">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full absolute right-0.5" />
                     </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-900">
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Instant Critical</span>
                     <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative p-0.5 border border-emerald-500/20">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full absolute right-0.5" />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Notifications List */}
         <div className="lg:col-span-3 space-y-4">
            {mockNotifications.length > 0 ? (
               mockNotifications.map((notification, i) => (
                  <motion.div 
                    key={notification.id}
                    initial={{ opacity: 0, y: 10, x: -10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "admin-card p-6 border-zinc-200 dark:border-zinc-900 flex items-start gap-4 transition-all group cursor-pointer relative",
                      !notification.isRead ? "bg-zinc-100 dark:bg-zinc-900/50 border-l-4 border-l-primary" : "opacity-80 hover:opacity-100"
                    )}
                  >
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                       getBadgeColor(notification.type)
                     )}>
                        {getIcon(notification.type)}
                     </div>

                     <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                           <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{notification.title}</h4>
                           <span className="text-[9px] font-bold text-zinc-600 uppercase flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {notification.time}
                           </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold leading-relaxed uppercase tracking-tight">{notification.message}</p>
                        
                        {!notification.isRead && (
                           <div className="pt-3 flex gap-4">
                              <Button variant="link" className="p-0 h-fit text-primary font-black uppercase text-[10px] tracking-widest">Review Issue</Button>
                              <Button variant="link" className="p-0 h-fit text-zinc-600 font-black uppercase text-[10px] tracking-widest">Dismiss</Button>
                           </div>
                        )}
                     </div>

                     <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-zinc-700" />
                     </div>
                  </motion.div>
               ))
            ) : (
               <div className="admin-card p-20 flex flex-col items-center justify-center opacity-30 text-center gap-4">
                  <Ghost className="w-20 h-20 text-zinc-500" />
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic">All caught up!</h3>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">No new alerts at this moment</p>
                  </div>
               </div>
            )}
            
            <div className="pt-8 flex justify-center">
               <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 dark:text-white font-black uppercase text-[10px] tracking-[0.3em] gap-2">
                  Load Archived Alerts
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Notifications;
