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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20 min-h-screen bg-white"
    >
      {/* Header */}
      <header className="flex justify-between items-center py-3 px-4 border-b-2 border-yellow-400 sticky top-0 bg-white/90 backdrop-blur-md z-30 w-full mb-4">
        <div className="flex items-center gap-2.5">
          <div 
             onClick={() => navigate("/driver/profile")}
             className="w-9 h-9 rounded-xl bg-zinc-50 overflow-hidden border-2 border-primary/20 shadow-sm cursor-pointer active:scale-90 transition-transform"
          >
            <img src={profileImg} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-zinc-900 leading-none tracking-tight">Hi, {driver.name.split(' ')[0]}</h2>
            <p className="text-[10px] font-semibold text-zinc-500 tracking-tight">{driver.vehicle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-zinc-50/50 p-1 px-2.5 rounded-xl border border-zinc-100">
          <span className={cn(
            "text-[10px] font-bold tracking-tight",
            driver.isOnline ? "text-emerald-600" : "text-zinc-500"
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
      
      <div className="px-4 space-y-4 pt-1">

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
           <Card className="bg-primary/5 border-2 border-dashed border-primary/40 p-3 relative overflow-hidden group">
             <div className="relative z-10 space-y-2">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-xs text-zinc-900 tracking-tight">Activate Your Account</h3>
                  <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">Your profile is hidden from customers until you subscribe.</p>
                </div>
                <Button 
                  onClick={() => navigate("/driver/subscribe")}
                  className="w-full h-9 bg-primary text-zinc-900 font-bold text-[10px] tracking-tight rounded-xl shadow-lg shadow-primary/20 transition-all"
                >
                  View Plans & Activate
                </Button>
             </div>
             <Shield className="absolute -right-4 -bottom-4 w-20 h-20 text-primary opacity-10 rotate-[-15deg]" />
           </Card>
         </motion.div>
      )}

      {/* Quick Actions */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase px-1">Quick Fleet Actions</h3>
        <div className="grid grid-cols-3 gap-2">
           {[
             { label: "My Pricing", path: "/driver/profile/pricing" },
             { label: "Vehicle Info", path: "/driver/profile/vehicle" },
             { label: "Leads Stats", path: "/driver/analytics" }
           ].map((action, i) => (
              <Button 
                key={i} 
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center gap-1.5 border-2 border-zinc-100 rounded-none bg-white hover:bg-zinc-900 hover:border-zinc-900 hover:text-white transition-all font-black text-[9px] tracking-widest text-zinc-600 uppercase shadow-sm active:scale-95 shadow-zinc-100"
               onClick={() => navigate(action.path)}
             >
               <div className="w-1 h-1 bg-primary rounded-full mb-1 group-hover:bg-white"></div>
               {action.label}
              </Button>
           ))}
        </div>
      </section>

      {/* Recent Leads Preview */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold tracking-tight text-zinc-500">Incoming Leads</h3>
          <Button 
             variant="ghost" 
             onClick={() => navigate("/driver/leads")}
             className="text-[10px] font-bold tracking-tight text-primary p-0 h-auto hover:bg-transparent"
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
      </div>
    </motion.div>
  );
};

export default DriverDashboard;
