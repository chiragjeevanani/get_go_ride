import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Calendar, User, 
  Plus, Edit2, Trash2, 
  CheckCircle2, Clock, 
  ShieldCheck, ArrowRight,
  TrendingUp, Zap, Sparkles
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockSubscriptions, mockPlans } from '../data/mockData';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleExtendSubscription = (id) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === id) {
        const currentExpiry = new Date(sub.expiryDate);
        currentExpiry.setDate(currentExpiry.getDate() + 30);
        const newExpiry = currentExpiry.toISOString().split('T')[0];
        showToast(`Subscription for ${sub.vendorName} extended to ${newExpiry}`, 'success');
        return { ...sub, expiryDate: newExpiry, status: 'Active' };
      }
      return sub;
    }));
  };

  const handleCancelSubscription = (id) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === id) {
        showToast(`Subscription for ${sub.vendorName} has been cancelled`, 'error');
        return { ...sub, status: 'Expired' };
      }
      return sub;
    }));
  };

  const subscriptionColumns = [
    { 
      key: "vendorName", 
      label: "Vendor", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-black text-primary text-[10px] uppercase">
             {val[0]}
          </div>
          <span className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-tight">{val}</span>
        </div>
      )
    },
    { 
      key: "plan", 
      label: "Plan Type", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
           <Zap className="w-3 h-3 text-primary" />
           <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{val}</span>
        </div>
      )
    },
    { 
      key: "expiryDate", 
      label: "Expiry Date", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
           <Clock className="w-3 h-3 text-zinc-500" />
           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{val}</span>
        </div>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (val) => (
        <div className={cn(
          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
          val === 'Active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
        )}>
           {val}
        </div>
      )
    },
    { 
      key: "actions", 
      label: "ACTIONS", 
      align: "right",
      render: (_, row) => (
        <div className="flex justify-end gap-2">
           <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5"
            onClick={() => handleExtendSubscription(row.id)}
           >
              Extend
           </Button>
           <Button 
            variant="ghost" 
            size="sm" 
            className="text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/5"
            onClick={() => handleCancelSubscription(row.id)}
           >
              Cancel
           </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Subscription Hub" 
        subtitle="Configure billing plans and manage active subscriptions" 
        actions={
          <Button className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20">
             <Plus className="w-4 h-4 mr-2" />
             Create New Plan
          </Button>
        }
      />

      <Tabs defaultValue="subscriptions" className="space-y-6" onValueChange={setActiveTab}>
         <TabsList className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-1 rounded-2xl w-full max-w-md">
            <TabsTrigger value="subscriptions" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-primary data-[state=active]:text-black">
               Active Subscriptions
            </TabsTrigger>
            <TabsTrigger value="plans" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-primary data-[state=active]:text-black">
               Plan Configuration
            </TabsTrigger>
         </TabsList>

         <TabsContent value="subscriptions" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <DataTable 
              columns={subscriptionColumns} 
              data={subscriptions} 
              searchKey="vendorName"
              searchPlaceholder="Find subscription by vendor name..."
            />
         </TabsContent>

         <TabsContent value="plans" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {mockPlans.map((plan) => (
                  <motion.div 
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className="admin-card p-8 border-2 border-zinc-200 dark:border-zinc-900 hover:border-primary/20 transition-all relative overflow-hidden group"
                  >
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-24 h-24 text-primary" />
                     </div>
                     
                     <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                           <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                              {plan.duration}
                           </Badge>
                           <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{plan.name}</h3>
                        </div>

                        <div className="flex items-baseline gap-1">
                           <span className="text-4xl font-black text-primary italic">₹{plan.price}</span>
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">/ Period</span>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                           {plan.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                 <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">{feature}</span>
                              </div>
                           ))}
                        </div>

                        <div className="flex gap-2 pt-4">
                           <Button 
                             className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-900 dark:text-white font-black uppercase text-[10px] tracking-widest h-10 rounded-xl hover:bg-zinc-700" 
                             onClick={() => handleEditPlan(plan)}
                           >
                              <Edit2 className="w-3.5 h-3.5 mr-2" />
                              Edit
                           </Button>
                           <Button variant="outline" className="w-10 h-10 border-rose-500/20 bg-rose-500/5 text-rose-500 p-0 rounded-xl hover:bg-rose-500/10">
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     </div>
                  </motion.div>
               ))}

               {/* Add Plan Card */}
               <button 
                 onClick={() => setIsPlanModalOpen(true)}
                 className="admin-card p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all group"
               >
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                     <Plus className="w-8 h-8 text-zinc-500 group-hover:text-black transition-all" />
                  </div>
                  <div className="text-center space-y-1">
                     <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest block">Create New Plan</span>
                     <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block">Define pricing & features</span>
                  </div>
               </button>
            </div>
         </TabsContent>
      </Tabs>

      {/* Plan Modal Placeholder */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => { setIsPlanModalOpen(false); setSelectedPlan(null); }}
        title={selectedPlan ? "Edit Subscription Plan" : "Create New Plan"}
        description="Configure pricing, duration and access rules"
        size="md"
      >
        <div className="space-y-4 pt-2">
           {/* Simple Form Layout */}
           <div className="space-y-3">
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Plan Name</label>
                 <input 
                   placeholder="e.g. Premium Yearly"
                   className="w-full h-10 px-4 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-900 focus:outline-none focus:border-primary"
                   defaultValue={selectedPlan?.name}
                 />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pricing (₹)</label>
                    <input 
                      type="number" 
                      placeholder="999"
                      className="w-full h-10 px-4 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-900 focus:outline-none focus:border-primary"
                      defaultValue={selectedPlan?.price}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Duration</label>
                    <input 
                      placeholder="e.g. 30 Days"
                      className="w-full h-10 px-4 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-900 focus:outline-none focus:border-primary"
                      defaultValue={selectedPlan?.duration}
                    />
                 </div>
              </div>
              <div className="space-y-1 pt-1">
                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Plan Features</label>
                 <div className="p-4 rounded-lg border border-dashed border-zinc-200 text-[9px] font-black text-zinc-400 uppercase italic text-center bg-zinc-50/50">
                    Feature management will be implemented in the next phase
                 </div>
              </div>
           </div>

           <div className="pt-4 flex gap-2">
              <Button className="flex-1 bg-primary text-black font-black uppercase text-[9px] tracking-widest h-10 rounded-lg shadow-md shadow-primary/20">
                 Save Plan
              </Button>
              <Button variant="ghost" onClick={() => setIsPlanModalOpen(false)} className="px-4 text-zinc-400 font-black uppercase text-[9px] tracking-widest">
                 Cancel
              </Button>
           </div>
        </div>
      </Modal>

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: '', type: 'success' })} 
      />
    </div>
  );
};

export default SubscriptionManagement;
