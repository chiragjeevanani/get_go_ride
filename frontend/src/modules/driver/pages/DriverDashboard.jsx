import { useState } from "react";
import { Bolt, Flame, CheckCircle, Shield, Package, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StatCard } from "../components/StatCard";
import { LeadCard } from "../components/LeadCard";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";
import profileImg from "@/assets/profile.jpg";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { driver, leads, toggleOnline, acceptLead, rejectLead } = useDriverState();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20 pt-4"
    >
      {/* Header */}
      <header className="flex justify-between items-center py-2 px-1">
        <div className="flex items-center gap-3">
          <div 
             onClick={() => navigate("/driver/profile")}
             className="w-10 h-10 rounded-xl bg-zinc-50 overflow-hidden border-2 border-primary/20 shadow-sm cursor-pointer active:scale-90 transition-transform"
          >
            <img src={profileImg} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-black leading-none tracking-tight">Hi, {driver.name.split(' ')[0]}</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{driver.vehicle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-zinc-50/50 p-1.5 px-3 rounded-2xl border border-zinc-100">
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest",
            driver.isOnline ? "text-emerald-500" : "text-zinc-400"
          )}>
            {driver.isOnline ? "Online" : "Offline"}
          </span>
          <Switch 
            checked={driver.isOnline} 
            onCheckedChange={toggleOnline}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard 
          icon={Bolt} 
          label="Leads Today" 
          value="5" 
          trend="+2" 
          trendColor="bg-blue-50 text-blue-500" 
        />
        <StatCard 
          icon={Flame} 
          label="Active Leads" 
          value={leads.length} 
          trend="Live" 
          trendColor="bg-orange-50 text-orange-500" 
        />
        <StatCard 
          icon={CheckCircle} 
          label="Accepted" 
          value="8" 
        />
        <StatCard 
          icon={Shield} 
          label="Sub. Ends" 
          value="May 15" 
          trend="Active" 
          trendColor="bg-emerald-50 text-emerald-500 shadow-sm"
        />
      </section>

      {/* Subscription Alert (if not subscribed) */}
      {!driver.isSubscribed && (
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
         >
           <Card className="bg-primary/5 border-2 border-dashed border-primary/40 p-4 relative overflow-hidden group">
             <div className="relative z-10 space-y-3">
               <div className="space-y-1">
                 <h3 className="font-black text-sm text-black uppercase tracking-tight">Activate your account</h3>
                 <p className="text-[11px] text-zinc-500 font-bold leading-relaxed">Your profile is hidden from customers until you subscribe.</p>
               </div>
               <Button 
                 onClick={() => navigate("/driver/subscribe")}
                 className="w-full h-10 bg-primary text-black font-black text-[10px] uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-primary/20"
               >
                 View Plans & Activate
               </Button>
             </div>
             <Shield className="absolute -right-4 -bottom-4 w-24 h-24 text-primary opacity-10 rotate-[-15deg]" />
           </Card>
         </motion.div>
      )}

      {/* Quick Actions */}
      <section className="space-y-4">
        <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase px-1">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-2">
           {[
             { label: "My Pricing", path: "/driver/profile" },
             { label: "Vehicle", path: "/driver/profile" },
             { label: "Stats", path: "/driver/analytics" }
           ].map((action, i) => (
             <Button 
               key={i} 
               variant="outline" 
               className="h-16 flex flex-col gap-1 border-zinc-100 rounded-2xl bg-white hover:bg-zinc-50 hover:border-primary/20 transition-all font-black text-[9px] uppercase tracking-tighter text-zinc-500"
               onClick={() => navigate(action.path)}
             >
               {action.label}
             </Button>
           ))}
        </div>
      </section>

      {/* Recent Leads Preview */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Incoming Leads</h3>
          <Button 
             variant="ghost" 
             onClick={() => navigate("/driver/leads")}
             className="text-[10px] font-black uppercase tracking-widest text-primary p-0 h-auto hover:bg-transparent"
          >
            See All <ChevronRight className="w-3 h-3 ml-0.5" />
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {leads.slice(0, 2).map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onReject={rejectLead}
              onView={(id) => navigate(`/driver/leads/${id}`)}
            />
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default DriverDashboard;
