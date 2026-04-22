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
import { Toast } from '../components/common/Toast';

const Notifications = () => {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [notifications, setNotifications] = React.useState(mockNotifications);
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const [digestSettings, setDigestSettings] = React.useState({
    daily: true,
    instant: true
  });

  const toggleDigest = (key) => {
    const newState = !digestSettings[key];
    setDigestSettings(prev => ({ ...prev, [key]: newState }));
    showToast(`${key === 'daily' ? 'Daily Summary' : 'Instant Critical'} ${newState ? 'enabled' : 'disabled'}`, newState ? 'success' : 'info');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast("All notifications marked as read");
  };

  const handleClearAll = () => {
    setNotifications([]);
    showToast("Notification center cleared", "error");
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast("Notification removed");
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'subs') return n.type === 'subscription';
    return n.type === activeFilter;
  });

  const counts = {
    all: notifications.length,
    vendor: notifications.filter(n => n.type === 'vendor').length,
    subs: notifications.filter(n => n.type === 'subscription').length,
    leads: notifications.filter(n => n.type === 'leads').length,
    system: notifications.filter(n => !['vendor', 'subscription', 'leads'].includes(n.type)).length,
  };

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
             <Button 
              variant="outline" 
              onClick={handleMarkAllRead}
              className="border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all"
             >
                Mark All Read
             </Button>
             <Button 
              variant="outline" 
              onClick={handleClearAll}
              className="border-rose-500/20 bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl hover:bg-rose-500/10 transition-colors"
             >
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
                       { id: 'all', label: 'All Alerts', count: counts.all },
                       { id: 'vendor', label: 'Vendor Events', count: counts.vendor },
                       { id: 'subs', label: 'Subscription Alerts', count: counts.subs },
                       { id: 'leads', label: 'Leads activity', count: counts.leads },
                       { id: 'system', label: 'System Health', count: counts.system },
                     ].map((filter) => (
                       <button
                         key={filter.id}
                         onClick={() => setActiveFilter(filter.id)}
                         className={cn(
                           "w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all group/btn",
                           activeFilter === filter.id 
                            ? "bg-primary/10 border-primary/20 text-primary" 
                            : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-500 dark:text-zinc-400"
                         )}
                       >
                         <span className="text-[10px] font-black uppercase tracking-widest">{filter.label}</span>
                         <Badge className={cn(
                            "text-[9px] transition-all border-none",
                            activeFilter === filter.id 
                                ? "bg-primary text-black" 
                                : "bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-500 group-hover/btn:bg-zinc-200 dark:group-hover/btn:bg-zinc-800"
                         )}>
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
                      <div 
                        onClick={() => toggleDigest('daily')}
                        className={cn(
                          "w-8 h-4 rounded-full relative p-0.5 border cursor-pointer transition-all duration-300",
                          digestSettings.daily ? "bg-emerald-500/20 border-emerald-500/20" : "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                        )}
                      >
                         <div className={cn(
                           "w-3 h-3 rounded-full transition-all duration-300 absolute top-0.5",
                           digestSettings.daily ? "bg-emerald-500 translate-x-3.5" : "bg-zinc-400 translate-x-0"
                         )} />
                      </div>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-900">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Instant Critical</span>
                      <div 
                        onClick={() => toggleDigest('instant')}
                        className={cn(
                          "w-8 h-4 rounded-full relative p-0.5 border cursor-pointer transition-all duration-300",
                          digestSettings.instant ? "bg-emerald-500/20 border-emerald-500/20" : "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                        )}
                      >
                         <div className={cn(
                           "w-3 h-3 rounded-full transition-all duration-300 absolute top-0.5",
                           digestSettings.instant ? "bg-emerald-500 translate-x-3.5" : "bg-zinc-400 translate-x-0"
                         )} />
                      </div>
                   </div>
                </div>
            </div>
         </div>

         {/* Notifications List */}
         <div className="lg:col-span-3 space-y-4">
            {filteredNotifications.length > 0 ? (
               filteredNotifications.map((notification, i) => (
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
                              <Button 
                                variant="link" 
                                onClick={() => {
                                  setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
                                  showToast("Issue reviewed");
                                }}
                                className="p-0 h-fit text-primary font-black uppercase text-[10px] tracking-widest"
                              >
                                Review Issue
                              </Button>
                              <Button 
                                variant="link" 
                                onClick={() => handleDelete(notification.id)}
                                className="p-0 h-fit text-zinc-600 font-black uppercase text-[10px] tracking-widest"
                              >
                                Dismiss
                              </Button>
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
       <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: '', type: 'success' })} 
      />
    </div>
  );
};

export default Notifications;
