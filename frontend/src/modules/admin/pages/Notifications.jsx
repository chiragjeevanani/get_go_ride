import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Truck, CreditCard, Users,
  Layers, Settings, AlertTriangle,
  Clock, CheckCircle2, MoreVertical,
  Mail, MessageSquare, ShieldCheck,
  Filter, Trash2, Ghost, Send
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';

const Broadcasts = () => {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [broadcasts, setBroadcasts] = React.useState([
    { id: 1, type: 'vendor', title: 'New Platform Rules', message: 'All vendors must re-verify their documents.', time: '2 hours ago', audience: 'All Vendors' },
    { id: 2, type: 'user', title: 'Holiday Discount', message: 'Get 20% off on your next ride!', time: '1 day ago', audience: 'All Users' },
  ]);
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });
  const [isCreating, setIsCreating] = React.useState(false);
  const [newBroadcast, setNewBroadcast] = React.useState({ title: '', message: '', target: 'vendor' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSendBroadcast = () => {
    if(!newBroadcast.title || !newBroadcast.message) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setBroadcasts(prev => [{
      id: Date.now(),
      type: newBroadcast.target,
      title: newBroadcast.title,
      message: newBroadcast.message,
      time: 'Just now',
      audience: newBroadcast.target === 'vendor' ? 'All Vendors' : 'All Users'
    }, ...prev]);
    setIsCreating(false);
    setNewBroadcast({ title: '', message: '', target: 'vendor' });
    showToast('Broadcast sent successfully', 'success');
  };

  const handleDelete = (id) => {
    setBroadcasts(prev => prev.filter(n => n.id !== id));
    showToast("Broadcast removed");
  };

  const filteredBroadcasts = broadcasts.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Admin Broadcast" 
        subtitle="Push notifications and announcements to users and vendors" 
        actions={
          <div className="flex items-center gap-2">
             <Button 
              onClick={() => setIsCreating(true)}
              className="bg-primary text-black font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
             >
                <Send className="w-4 h-4 mr-2" />
                New Broadcast
             </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="space-y-6">
            <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900 overflow-hidden relative group">
               <div className="relative z-10 space-y-6">
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                     <Filter className="w-4 h-4 text-primary" />
                     Broadcast Targets
                  </h3>
                  
                  <div className="space-y-2">
                     {[
                       { id: 'all', label: 'All History' },
                       { id: 'vendor', label: 'Vendors Only' },
                       { id: 'user', label: 'Users Only' },
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
                       </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-3 space-y-4">
            {isCreating && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="admin-card p-6 border-zinc-200 dark:border-zinc-900 space-y-4 bg-zinc-50/50"
              >
                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  Compose Broadcast
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Title</label>
                    <input 
                      type="text" 
                      value={newBroadcast.title}
                      onChange={(e) => setNewBroadcast(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Important Platform Update" 
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Message</label>
                    <textarea 
                      value={newBroadcast.message}
                      onChange={(e) => setNewBroadcast(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter the broadcast message..." 
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:border-primary min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Target Audience</label>
                    <select 
                      value={newBroadcast.target}
                      onChange={(e) => setNewBroadcast(prev => ({ ...prev, target: e.target.value }))}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary"
                    >
                      <option value="vendor">All Vendors</option>
                      <option value="user">All Users</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-zinc-500 hover:bg-zinc-200 font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                    <Button onClick={handleSendBroadcast} className="bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest">Send Now</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {filteredBroadcasts.length > 0 ? (
               filteredBroadcasts.map((b, i) => (
                  <motion.div 
                    key={b.id}
                    initial={{ opacity: 0, y: 10, x: -10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="admin-card p-6 border-zinc-200 dark:border-zinc-900 flex items-start gap-4 transition-all group"
                  >
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                       b.type === 'vendor' ? "bg-primary/10 border-primary/20 text-primary" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                     )}>
                        {b.type === 'vendor' ? <Truck className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                     </div>

                     <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                           <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{b.title}</h4>
                           <span className="text-[9px] font-bold text-zinc-600 uppercase flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {b.time}
                           </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold leading-relaxed uppercase tracking-tight">{b.message}</p>
                        <div className="pt-2">
                           <Badge className="bg-zinc-100 text-zinc-500 border-none uppercase tracking-widest text-[8px]">{b.audience}</Badge>
                        </div>
                     </div>

                     <Button variant="ghost" onClick={() => handleDelete(b.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-2 h-8 w-8 rounded-full transition-all">
                       <Trash2 className="w-4 h-4" />
                     </Button>
                  </motion.div>
               ))
            ) : (
               <div className="admin-card p-20 flex flex-col items-center justify-center opacity-30 text-center gap-4">
                  <Ghost className="w-20 h-20 text-zinc-500" />
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic">No Broadcasts</h3>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">No history found for this category</p>
                  </div>
               </div>
            )}
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

export default Broadcasts;
