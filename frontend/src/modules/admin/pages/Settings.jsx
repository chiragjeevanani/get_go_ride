import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Shield, Bell, 
  Database, Globe, Mail, 
  Lock, Save, RefreshCw,
  Zap, AlertTriangle, Info,
  ExternalLink, ChevronRight
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const Settings = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure platform operations, security, and integration rules" 
        actions={
          <Button className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20">
             <Save className="w-4 h-4 mr-2" />
             Save All Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Navigation / Sidebar */}
         <div className="space-y-6">
            <div className="admin-card p-4 bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900">
               {[
                 { label: "Platform Info", icon: Globe, active: true },
                 { label: "Commission & Fees", icon: Zap, active: false },
                 { label: "Notifications", icon: Bell, active: false },
                 { label: "Security & Access", icon: Lock, active: false },
                 { label: "System health", icon: Database, active: false },
               ].map((item, i) => (
                 <button
                   key={i}
                   className={cn(
                     "w-full flex items-center justify-between p-4 rounded-xl transition-all group",
                     item.active ? "bg-primary text-black" : "text-zinc-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-100 dark:bg-zinc-900"
                   )}
                 >
                   <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" strokeWidth={item.active ? 2.5 : 2} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                   </div>
                   <ChevronRight className={cn("w-4 h-4 opacity-50", item.active ? "text-black" : "text-zinc-800")} />
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

            {/* Danger Zone */}
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
         </div>
      </div>
    </div>
  );
};

export default Settings;
