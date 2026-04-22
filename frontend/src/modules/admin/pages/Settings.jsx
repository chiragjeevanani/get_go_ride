import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Shield, Bell, 
  Database, Globe, Mail, 
  Lock, Save, RefreshCw,
  Zap, AlertTriangle, Info,
  ExternalLink, ChevronRight,
  TrendingUp, IndianRupee
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';

const Settings = () => {
  const [activeTab, setActiveTab] = React.useState("Platform Info");
  const [monetizationModel, setMonetizationModel] = React.useState("perc");
  const [toast, setToast] = React.useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const navItems = [
    { label: "Platform Info", icon: Globe },
    { label: "Commission & Fees", icon: Zap },
    { label: "Notifications", icon: Bell },
    { label: "Security & Access", icon: Lock },
    { label: "System health", icon: Database },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure platform operations, security, and integration rules" 
        actions={
          <Button 
            onClick={() => showToast("Configuration saved to cloud registry", "success")}
            className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
             <Save className="w-4 h-4 mr-2" />
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
                        <input defaultValue="Safar Setto" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-xs font-black text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Support Email</label>
                        <input defaultValue="support@safarsetto.com" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-xs font-black text-zinc-900 dark:text-white focus:outline-none focus:border-primary" />
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

            {activeTab === "Commission & Fees" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Commission Model */}
                <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-8">
                   <div className="space-y-1">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Monetization Model</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Choose how the platform earns from lead conversions</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'perc', title: 'Percentage Based', desc: 'A share of the total deal value finalized between user & vendor.', icon: TrendingUp },
                        { id: 'fixed', title: 'Fixed Lead Fee', desc: 'A flat fee charged to the vendor for every successful lead secured.', icon: IndianRupee },
                      ].map((model) => (
                        <button 
                          key={model.id}
                          onClick={() => {
                            setMonetizationModel(model.id);
                            showToast(`Switched to ${model.title} model`);
                          }}
                          className={cn(
                            "p-6 rounded-2xl border-2 text-left transition-all group relative overflow-hidden",
                            monetizationModel === model.id ? "border-primary bg-primary/[0.03]" : "border-zinc-200 dark:border-zinc-900 hover:border-zinc-700"
                          )}
                        >
                           <div className="relative z-10 space-y-4">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm", monetizationModel === model.id ? "bg-primary text-black" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500")}>
                                 <model.icon className="w-5 h-5" />
                              </div>
                              <div className="space-y-1">
                                 <h4 className={cn("text-xs font-black uppercase tracking-widest", monetizationModel === model.id ? "text-zinc-900 dark:text-white" : "text-zinc-500")}>{model.title}</h4>
                                 <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">{model.desc}</p>
                              </div>
                           </div>
                           {monetizationModel === model.id && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                        </button>
                      ))}
                   </div>
                </div>

                 {/* Base Rates */}
                 <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-8">
                    <div className="space-y-1">
                       <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">
                          {monetizationModel === 'perc' ? 'Base Commission Rates' : 'Fixed Fee Configuration'}
                       </h3>
                       <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Default values applied across categories</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">
                            {monetizationModel === 'perc' ? 'Standard Rate (%)' : 'Fixed Fee Per Lead (₹)'}
                         </label>
                         <div className="relative">
                            <input 
                              defaultValue={monetizationModel === 'perc' ? "10" : "150"} 
                              className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-sm font-black text-primary italic focus:outline-none focus:border-primary" 
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-500">
                               {monetizationModel === 'perc' ? '%' : '₹'}
                            </span>
                         </div>
                       </div>
                       
                       {monetizationModel === 'perc' && (
                         <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Min. Guarantee (₹)</label>
                           <div className="relative">
                              <input defaultValue="50" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-sm font-black text-primary italic focus:outline-none focus:border-primary" />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-500">₹</span>
                           </div>
                         </div>
                       )}

                       <div className="space-y-2">
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">GST / Tax (%)</label>
                         <div className="relative">
                            <input defaultValue="18" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-sm font-black text-primary italic focus:outline-none focus:border-primary" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-500">%</span>
                         </div>
                       </div>
                    </div>
                 </div>

                {/* Category Overrides */}
                <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Category Overrides</h3>
                         <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Specific rates for different service types</p>
                      </div>
                      <Button variant="outline" className="h-8 border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest px-4 rounded-lg">
                         Add Override
                      </Button>
                   </div>

                   <div className="space-y-2">
                      {[
                        { category: "House Shifting", rate: "12%", type: "Percentage" },
                        { category: "Emergency Dispatch", rate: "₹99", type: "Fixed" },
                        { category: "Industrial Cargo", rate: "8%", type: "Percentage" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-900 group">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">{item.category}</span>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-primary italic">{item.rate}</p>
                                 <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{item.type}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <RefreshCw className="w-3 h-3 text-zinc-500" />
                              </Button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {/* Empty States for other tabs */}
            {!["Platform Info", "Commission & Fees"].includes(activeTab) && (
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
