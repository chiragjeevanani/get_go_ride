import React from 'react';
import {
  Settings as SettingsIcon, Bell,
  Database, Globe, Mail,
  Lock, Save, RefreshCw,
  AlertTriangle, Info,
  ExternalLink, ChevronRight,
  IndianRupee, Loader2, TrendingUp
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';
import { settingsApi } from '@/lib/api';

const Settings = () => {
  const [activeTab, setActiveTab] = React.useState("Platform Info");
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });

  // Dynamic system configurations state
  const [signupBonus, setSignupBonus] = React.useState("50");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Revenue model state
  const [revenueModel, setRevenueModel] = React.useState('subscription');
  const [commissionRate, setCommissionRate] = React.useState(10);

  const modelOptions = [
    { value: 'subscription', label: 'Subscription Only', desc: 'Driver pays monthly subscription for lead access. No deal commission.' },
    { value: 'subscription_commission', label: 'Subscription + Commission', desc: 'Driver pays subscription AND per-deal commission (both).' },
    { value: 'commission', label: 'Commission Only', desc: 'Driver pays commission per completed deal only. No subscription required.' },
  ];

  React.useEffect(() => {
    fetchSystemSettings();
    fetchRevenueModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const res = await settingsApi.get();
      if (res.success) {
        setSignupBonus(res.data.walletSignupBonus?.toString() || "50");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch system settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueModel = async () => {
    try {
      const res = await settingsApi.getRevenueModel();
      if (res.success) {
        setRevenueModel(res.data.revenueModel || 'subscription');
        setCommissionRate(res.data.commissionRate || 10);
      }
    } catch (err) {
      console.error('Failed to fetch revenue model:', err);
    }
  };

  const handleRevenueModelSave = async () => {
    setSaving(true);
    try {
      const res = await settingsApi.updateRevenueModel({ revenueModel, commissionRate });
      if (res.success) {
        showToast('Revenue model updated successfully', 'success');
      } else {
        showToast(res.message || 'Failed to update revenue model', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update revenue model', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await settingsApi.update({
        walletSignupBonus: Number(signupBonus)
      });
      if (res.success) {
        showToast("All system configurations saved successfully!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to update configurations", "error");
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { label: "Platform Info", icon: Globe },
    { label: "Wallet Settings", icon: IndianRupee },
    { label: "Commission & Fees", icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure platform operations, security, and integration rules" 
        actions={
          <Button 
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
             {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
             Save All Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Navigation / Sidebar */}
         <div className="space-y-6">
            <div className="admin-card p-4 bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900">
               {navItems.map((item, i) => (
                 <button
                   key={i}
                   onClick={() => setActiveTab(item.label)}
                   className={cn(
                     "w-full flex items-center justify-between p-4 rounded-xl transition-all group",
                     activeTab === item.label ? "bg-primary text-black" : "text-zinc-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-100 dark:bg-zinc-900"
                   )}
                 >
                   <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" strokeWidth={activeTab === item.label ? 2.5 : 2} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                   </div>
                   <ChevronRight className={cn("w-4 h-4 opacity-50", activeTab === item.label ? "text-black" : "text-zinc-800")} />
                 </button>
               ))}
            </div>

            <div className="admin-card p-6 border-zinc-200 dark:border-zinc-900 space-y-4">
               <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Support & Documentation
               </h3>
               <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed tracking-tight">Need help with platform configuration? Contact the development team.</p>
               <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest h-10 rounded-xl">
                  Open Support Hub
                  <ExternalLink className="w-3 h-3 ml-2" />
               </Button>
            </div>
         </div>

         {/* Main Settings Content */}
         <div className="lg:col-span-2 space-y-6">
            {activeTab === "Platform Info" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* General Section */}
                <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-8 relative overflow-hidden group">
                  <div className="space-y-1 relative z-10">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Platform Identity</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Core branding and support details</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Application Name</label>
                        <input defaultValue="GetGoLoad" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-xs font-black text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Support Email</label>
                        <input defaultValue="support@getgoload.com" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-xs font-black text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Platform Tagline</label>
                        <input defaultValue="Reliable Multi-Service Vehicle Aggregation" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-xs font-black text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
                      </div>
                  </div>

                  <Globe className="absolute -right-4 -bottom-4 w-32 h-32 text-primary opacity-[0.02] rotate-[-15deg] group-hover:opacity-[0.05] transition-opacity" />
                </div>

                {/* Config Toggles */}
                <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-6">
                  <div className="space-y-1 mb-2">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Functional Toggles</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Enable or disable core system features</p>
                  </div>

                  <div className="space-y-2 divide-y divide-zinc-900">
                      {[
                        { label: "New Vendor Registration", desc: "Allow new drivers to sign up on the platform.", active: true },
                        { label: "User Lead Modification", desc: "Allow users to edit leads after posting them.", active: true },
                        { label: "Review Auto-Approval", desc: "Instantly publish 5-star reviews without moderation.", active: false },
                        { label: "Maintenance Mode", desc: "Suspend all platform operations for scheduled maintenance.", active: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-5 group">
                          <div className="space-y-1">
                              <h4 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">{item.label}</h4>
                              <p className="text-[9px] text-zinc-600 font-extrabold uppercase tracking-widest">{item.desc}</p>
                          </div>
                          <Switch 
                            checked={item.active} 
                            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-zinc-800"
                            />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Wallet Settings" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Wallet System Settings Section */}
                <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-8 relative overflow-hidden group">
                  <div className="space-y-1 relative z-10">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-primary" />
                        Wallet System Configurations
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Define sign-up rewards & maximum wallet balance usage ceilings</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Default Sign Up Reward (INR)</label>
                        <div className="relative">
                          <input 
                            type="number"
                            value={signupBonus} 
                            onChange={(e) => setSignupBonus(e.target.value)}
                            className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-sm font-black text-primary focus:outline-none focus:border-primary" 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 uppercase">₹ Bonus</span>
                        </div>
                        <p className="text-[8px] text-zinc-400 font-bold uppercase block px-1 leading-normal">Free starting wallet balance awarded to users upon successful registration</p>
                      </div>
                  </div>

                  {/* Summary preview */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-1 relative z-10">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Operational Summary:</h4>
                     <p className="text-[9px] text-zinc-500 font-extrabold uppercase leading-relaxed">
                       Newly registered users will start with a free promotional balance of <span className="text-zinc-950 font-black">₹{signupBonus}</span> directly in their wallet upon successful sign-up.
                     </p>
                  </div>

                  <IndianRupee className="absolute -right-4 -bottom-4 w-32 h-32 text-primary opacity-[0.02] rotate-[-15deg] group-hover:opacity-[0.05] transition-opacity" />
                </div>
              </div>
            )}

            {activeTab === "Commission & Fees" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Revenue Model Configuration */}
                <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-8">
                   <div className="space-y-1">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Revenue Model Configuration</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Choose how the platform earns revenue from vendors</p>
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                      {modelOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setRevenueModel(option.value);
                          }}
                          className={cn(
                            "p-6 rounded-2xl border-2 text-left transition-all group relative overflow-hidden",
                            revenueModel === option.value ? "border-primary bg-primary/[0.03]" : "border-zinc-200 dark:border-zinc-900 hover:border-zinc-700"
                          )}
                        >
                           <div className="relative z-10 flex items-start gap-4">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                revenueModel === option.value ? "border-primary bg-primary" : "border-zinc-400"
                              )}>
                                {revenueModel === option.value && (
                                  <div className="w-2 h-2 rounded-full bg-black" />
                                )}
                              </div>
                              <div className="space-y-1">
                                 <h4 className={cn("text-xs font-black uppercase tracking-widest", revenueModel === option.value ? "text-zinc-900 dark:text-white" : "text-zinc-500")}>{option.label}</h4>
                                 <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">{option.desc}</p>
                              </div>
                           </div>
                        </button>
                      ))}
                   </div>

                   {/* Commission Rate Input (shown when commission modes are selected) */}
                   {revenueModel !== 'subscription' && (
                     <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-900">
                       <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">
                          Commission Rate (%)
                       </label>
                       <div className="relative max-w-[200px]">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(Number(e.target.value))}
                            className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-sm font-black text-primary italic focus:outline-none focus:border-primary"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-500">%</span>
                       </div>
                       <p className="text-[8px] text-zinc-400 font-bold uppercase block px-1 leading-normal">
                         Percentage of each completed deal that goes to the platform as commission
                       </p>
                     </div>
                   )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleRevenueModelSave}
                    disabled={saving}
                    className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Revenue Model
                  </Button>
                </div>
              </div>
            )}

            {/* Empty States for other tabs */}
            {!["Platform Info", "Commission & Fees", "Wallet Settings"].includes(activeTab) && (
              <div className="admin-card p-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent flex flex-col items-center justify-center gap-4 text-center">
                 <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <SettingsIcon className="w-8 h-8 text-zinc-700 animate-spin-slow" />
                  </div>
                 <div className="space-y-1">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">{activeTab} Module</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest max-w-[250px]">The {activeTab.toLowerCase()} configuration interface is currently being optimized for deployment.</p>
                 </div>
              </div>
            )}

            {/* Danger Zone - Only show on platform info for now */}
            {activeTab === "Platform Info" && (
              <div className="admin-card p-8 border-rose-500/10 bg-rose-500/[0.02] space-y-6">
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Danger Zone
                    </h3>
                    <p className="text-[10px] text-rose-500/50 font-bold uppercase tracking-widest italic">Destructive actions for system logs</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <Button variant="outline" className="flex-1 border-rose-500/20 bg-rose-500/5 text-rose-500 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl hover:bg-rose-500/10 group">
                      <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                      Purge Expired Leads
                    </Button>
                    <Button variant="outline" className="flex-1 border-rose-500/20 bg-rose-500/5 text-rose-500 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl hover:bg-rose-500/10 group">
                      <Database className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Reset Analytics Cache
                    </Button>
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

export default Settings;
