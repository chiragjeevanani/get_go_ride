import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Calendar, Plus, Edit2, Trash2,
  CheckCircle2, Clock, Zap, Sparkles, Loader2,
  ShieldCheck, Star, Megaphone, Infinity
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';
import { adminApi, planApi } from '@/lib/api';

const FEATURE_LIST = [
  { key: 'verifiedBadge', label: 'Verified Badge', icon: ShieldCheck },
  { key: 'prioritySupport', label: 'Priority Support', icon: Star },
  { key: 'freeMarketing', label: 'Free Marketing', icon: Megaphone },
];

const EMPTY_FORM = {
  name: '',
  price: '',
  durationDays: '',
  leadQuota: { type: 'unlimited', limit: '', period: 'day' },
  features: { verifiedBadge: false, prioritySupport: false, freeMarketing: false, custom: [] },
};

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [customFeature, setCustomFeature] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await planApi.getAllAdmin();
      setPlans(res.data || []);
    } catch { showToast('Failed to load plans', 'error'); }
    finally { setLoadingPlans(false); }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoadingSubs(true);
      const res = await adminApi.getAllVendors({ limit: 100 });
      setSubscriptions((res.data || []).map(v => ({
        id: v._id,
        vendorName: v.name || 'Unnamed Vendor',
        plan: v.activeSubscription?.name || 'Free',
        expiryDate: v.subscriptionExpiresAt ? new Date(v.subscriptionExpiresAt).toLocaleDateString() : 'N/A',
        status: v.subscriptionStatus || 'None',
        hasVerifiedBadge: v.hasVerifiedBadge,
      })));
    } catch { showToast('Failed to load subscriptions', 'error'); }
    finally { setLoadingSubs(false); }
  };

  useEffect(() => { fetchPlans(); fetchSubscriptions(); }, []);

  const openCreate = () => { setEditingPlan(null); setForm(EMPTY_FORM); setIsPlanModalOpen(true); };
  const openEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      leadQuota: { ...plan.leadQuota, limit: plan.leadQuota?.limit || '' },
      features: { ...plan.features },
    });
    setIsPlanModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || form.price === '' || !form.durationDays) {
      showToast('Name, price, and duration are required', 'error'); return;
    }
    try {
      setSaving(true);
      const payload = { ...form, price: Number(form.price), durationDays: Number(form.durationDays) };
      if (payload.leadQuota.type === 'limited') payload.leadQuota.limit = Number(payload.leadQuota.limit);
      else payload.leadQuota.limit = null;

      if (editingPlan) await planApi.update(editingPlan._id, payload);
      else await planApi.create(payload);

      showToast(editingPlan ? 'Plan updated!' : 'Plan created!');
      setIsPlanModalOpen(false);
      fetchPlans();
    } catch { showToast('Failed to save plan', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Deactivate "${plan.name}"?`)) return;
    try {
      await planApi.delete(plan._id);
      showToast('Plan deactivated');
      fetchPlans();
    } catch { showToast('Failed to deactivate plan', 'error'); }
  };

  const addCustomFeature = () => {
    if (!customFeature.trim()) return;
    setForm(f => ({ ...f, features: { ...f.features, custom: [...(f.features.custom || []), customFeature.trim()] } }));
    setCustomFeature('');
  };

  const removeCustomFeature = (i) => {
    setForm(f => ({ ...f, features: { ...f.features, custom: f.features.custom.filter((_, idx) => idx !== i) } }));
  };

  const subscriptionColumns = [
    { key: "vendorName", label: "Driver", sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-black text-primary text-[10px] uppercase">{val[0]}</div>
          <div className="flex flex-col">
            <span className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-tight">{val}</span>
            {row.hasVerifiedBadge && <span className="text-[9px] text-emerald-500 font-black flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" />Verified</span>}
          </div>
        </div>
      )
    },
    { key: "plan", label: "Plan", sortable: true,
      render: (val) => <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-primary" /><span className="text-xs font-black text-zinc-400 uppercase">{val}</span></div>
    },
    { key: "expiryDate", label: "Expiry", sortable: true,
      render: (val) => <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-zinc-500" /><span className="text-[10px] font-black text-zinc-500 uppercase">{val}</span></div>
    },
    { key: "status", label: "Status", sortable: true,
      render: (val) => (
        <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit",
          val === 'Active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
          val === 'Expired' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
          "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800"
        )}>{val}</div>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="Subscription Hub" subtitle="Configure billing plans and manage active subscriptions"
        actions={
          <Button onClick={openCreate} className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Create Plan
          </Button>
        }
      />

      <Tabs defaultValue="subscriptions" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-1 rounded-2xl w-fit">
          <TabsTrigger value="subscriptions" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-black">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="plans" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-black">Plan Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          {loadingSubs ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
            <DataTable columns={subscriptionColumns} data={subscriptions} searchKey="vendorName" searchPlaceholder="Find subscription by driver name..." />
          )}
        </TabsContent>

        <TabsContent value="plans">
          {loadingPlans ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <motion.div key={plan._id} whileHover={{ scale: 1.01 }}
                  className={cn("admin-card p-5 border-2 hover:border-primary/20 transition-all relative overflow-hidden group flex flex-col justify-between min-h-[370px]",
                    plan.isActive ? "border-zinc-200 dark:border-zinc-900" : "border-dashed border-zinc-300 dark:border-zinc-800 opacity-60"
                  )}>
                  <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-16 h-16 text-primary" />
                  </div>
                  
                  {/* Top content area */}
                  <div className="flex flex-col justify-between flex-1 relative z-10">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">{plan.durationDays} Days</Badge>
                          {!plan.isActive && <Badge className="bg-zinc-200 text-zinc-500 border-none text-[8px] font-black uppercase px-2 py-0.5">Inactive</Badge>}
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter min-h-[44px] flex items-center leading-tight">{plan.name}</h3>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-primary italic">₹{plan.price}</span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">/ Period</span>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        {/* Lead Quota */}
                        <div className="flex items-center gap-2">
                          {plan.leadQuota?.type === 'unlimited'
                            ? <Infinity className="w-3.5 h-3.5 text-emerald-500" />
                            : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">
                            {plan.leadQuota?.type === 'unlimited' ? 'Unlimited Leads' : `${plan.leadQuota?.limit} Leads/${plan.leadQuota?.period}`}
                          </span>
                        </div>
                        {/* Feature toggles */}
                        {FEATURE_LIST.filter(f => plan.features?.[f.key]).map(f => (
                          <div key={f.key} className="flex items-center gap-2">
                            <f.icon className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">{f.label}</span>
                          </div>
                        ))}
                        {/* Custom features */}
                        {(plan.features?.custom || []).map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Area (forced to bottom) */}
                    <div className="flex gap-2 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-900">
                      <Button className="flex-1 bg-zinc-800 text-white font-black uppercase text-[10px] tracking-widest h-9 rounded-xl hover:bg-zinc-700" onClick={() => openEdit(plan)}>
                        <Edit2 className="w-3 h-3 mr-1.5" /> Edit
                      </Button>
                      <Button variant="outline" onClick={() => handleDelete(plan)} className="w-9 h-9 border-rose-500/20 bg-rose-500/5 text-rose-500 p-0 rounded-xl hover:bg-rose-500/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              <button onClick={openCreate} className="admin-card p-5 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all group min-h-[370px]">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                  <Plus className="w-6 h-6 text-zinc-500 group-hover:text-black transition-all" />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest block">Create New Plan</span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block">Define pricing & features</span>
                </div>
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Plan Create/Edit Modal */}
      <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? "Edit Plan" : "Create New Plan"}
        description="Configure pricing, duration, lead quota and features" size="md">
        <div className="space-y-5 pt-2">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Plan Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Premium Monthly"
              className="w-full h-10 px-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Price (₹)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="999"
                className="w-full h-10 px-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Duration (Days)</label>
              <input type="number" value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))}
                placeholder="30"
                className="w-full h-10 px-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
            </div>
          </div>

          {/* Lead Quota */}
          <div className="space-y-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Lead Quota</label>
            <div className="flex gap-2">
              {['unlimited', 'limited'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, leadQuota: { ...f.leadQuota, type: t } }))}
                  className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                    form.leadQuota.type === t ? "bg-primary text-black border-primary" : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400")}>
                  {t === 'unlimited' ? '∞ Unlimited' : '# Limited'}
                </button>
              ))}
            </div>
            {form.leadQuota.type === 'limited' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Lead Limit</label>
                  <input type="number" value={form.leadQuota.limit} onChange={e => setForm(f => ({ ...f, leadQuota: { ...f.leadQuota, limit: e.target.value } }))}
                    placeholder="10"
                    className="w-full h-9 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Per Period</label>
                  <select value={form.leadQuota.period} onChange={e => setForm(f => ({ ...f, leadQuota: { ...f.leadQuota, period: e.target.value } }))}
                    className="w-full h-9 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary">
                    <option value="day">Per Day</option>
                    <option value="week">Per Week</option>
                    <option value="month">Per Month</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Feature Toggles */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Features</label>
            <div className="space-y-2">
              {FEATURE_LIST.map(f => (
                <label key={f.key} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-primary/30 transition-all group">
                  <div onClick={() => setForm(prev => ({ ...prev, features: { ...prev.features, [f.key]: !prev.features[f.key] } }))}
                    className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                      form.features[f.key] ? "bg-primary border-primary" : "border-zinc-300 dark:border-zinc-700")}>
                    {form.features[f.key] && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </div>
                  <f.icon className={cn("w-4 h-4 transition-colors", form.features[f.key] ? "text-primary" : "text-zinc-400")} />
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", form.features[f.key] ? "text-zinc-900 dark:text-white" : "text-zinc-400")}>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Features */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Custom Features</label>
            <div className="flex gap-2">
              <input value={customFeature} onChange={e => setCustomFeature(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomFeature()}
                placeholder="e.g. Free GPS Tracking"
                className="flex-1 h-9 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
              <Button onClick={addCustomFeature} className="h-9 px-4 bg-primary text-black font-black text-[10px] rounded-lg">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.features.custom || []).map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-[10px] font-black text-zinc-600 uppercase">
                  {c}
                  <button onClick={() => removeCustomFeature(i)} className="text-zinc-400 hover:text-rose-500">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-black font-black uppercase text-[9px] tracking-widest h-10 rounded-lg shadow-md shadow-primary/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
            <Button variant="ghost" onClick={() => setIsPlanModalOpen(false)} className="px-4 text-zinc-400 font-black uppercase text-[9px] tracking-widest">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
    </div>
  );
};

export default SubscriptionManagement;
