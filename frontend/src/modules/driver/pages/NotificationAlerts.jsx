import React from "react";
import { 
  Bell, Smartphone, Mail, MessageSquare, 
  ChevronLeft, Zap, Shield, BarChart2, Volume2, 
  Vibrate, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NotificationAlerts = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = React.useState({
    push: true,
    email: false,
    whatsapp: true,
    newLeads: true,
    urgentLeads: true,
    messages: true,
    subscription: true,
    performance: false,
    sound: true,
    vibration: true
  });

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 pb-24 pt-2 px-1"
    >
      {/* Sharp Header */}
      <header className="flex items-center gap-4 -mx-5 px-5 py-3 border-b-2 border-yellow-400 sticky top-0 bg-white/95 backdrop-blur-md z-30 mb-2">
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-none bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-base font-black text-zinc-900 tracking-tighter uppercase leading-none">Alert Settings</h1>
          <p className="text-[10px] font-bold text-zinc-500 tracking-tight mt-1">Control how we reach you</p>
        </div>
      </header>

      {/* Global Communication Channels */}
      <section className="space-y-2">
         <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase px-1">Main Channels</h3>
         <div className="grid grid-cols-1 gap-2">
            {[
               { id: 'push', label: 'Push Notifications', desc: 'Direct alerts on your device', icon: Smartphone, color: 'text-blue-500' },
               { id: 'whatsapp', label: 'WhatsApp Alerts', desc: 'Real-time updates on WhatsApp', icon: MessageSquare, color: 'text-emerald-500', premium: true },
               { id: 'email', label: 'Email Notifications', desc: 'Summary and document alerts', icon: Mail, color: 'text-zinc-500' },
            ].map((channel) => (
               <Card key={channel.id} className="rounded-none border-zinc-100 shadow-none bg-white overflow-hidden group">
                  <CardContent className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 flex items-center justify-center rounded-none bg-zinc-50 border border-zinc-100 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-colors shrink-0", channel.color.replace('text', 'group-hover:text'))}>
                           <channel.icon className={cn("w-5 h-5", channel.color)} />
                        </div>
                        <div className="space-y-0.5">
                           <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black text-zinc-900 tracking-tight uppercase">{channel.label}</span>
                              {channel.premium && <Badge className="rounded-none bg-primary/20 text-primary border-none text-[8px] uppercase tracking-tighter h-4 px-1">Pro</Badge>}
                           </div>
                           <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{channel.desc}</p>
                        </div>
                     </div>
                     <Switch 
                        checked={settings[channel.id]} 
                        onCheckedChange={() => toggle(channel.id)}
                        className="data-[state=checked]:bg-primary rounded-none shadow-none" 
                     />
                  </CardContent>
               </Card>
            ))}
         </div>
      </section>

      {/* Alert Logic Configuration */}
      <section className="space-y-2">
         <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase px-1">Leads & Business</h3>
         <div className="space-y-0 border-y border-zinc-100 bg-white">
            {[
               { id: 'newLeads', label: 'New Lead Matches', desc: 'Alert when a lead matches your area', icon: Zap },
               { id: 'urgentLeads', label: 'Urgent Leads Only', desc: 'Instant priority for fast bookings', icon: Bell },
               { id: 'messages', label: 'Customer Messages', desc: 'Real-time chat notifications', icon: MessageSquare },
               { id: 'subscription', label: 'Plan & Billing', desc: 'Expiry and renewal remainders', icon: Shield },
               { id: 'performance', label: 'Weekly Summary', desc: 'Your performance stats & growth', icon: BarChart2 },
            ].map((item, idx) => (
               <div key={item.id} className={cn(
                  "flex items-center justify-between p-4",
                  idx !== 4 && "border-b border-zinc-50"
               )}>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-none border border-zinc-100 flex items-center justify-center bg-white">
                        <item.icon className="w-3.5 h-3.5 text-zinc-400" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-tight">{item.label}</span>
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">{item.desc}</span>
                     </div>
                  </div>
                  <Switch 
                     checked={settings[item.id]} 
                     onCheckedChange={() => toggle(item.id)}
                     className="data-[state=checked]:bg-zinc-900 h-5 w-9 [&>span]:w-3.5 [&>span]:h-3.5 rounded-none" 
                  />
               </div>
            ))}
         </div>
      </section>

      {/* Sound & Haptics */}
      <section className="space-y-2">
         <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase px-1">Device Interaction</h3>
         <div className="grid grid-cols-2 gap-2">
            {[
               { id: 'sound', label: 'Alert Sound', icon: Volume2 },
               { id: 'vibration', label: 'Haptic Feedback', icon: Vibrate },
            ].map((pref) => (
               <Button 
                  key={pref.id}
                  variant="outline"
                  onClick={() => toggle(pref.id)}
                  className={cn(
                     "h-auto py-3.5 flex flex-col items-center gap-2 rounded-none border-2 transition-all",
                     settings[pref.id] 
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" 
                        : "bg-white border-zinc-100 text-zinc-400 shadow-sm"
                  )}
               >
                  <pref.icon className={cn("w-4 h-4", settings[pref.id] ? "text-primary" : "text-zinc-200")} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{pref.label}</span>
               </Button>
            ))}
         </div>
      </section>

      {/* Save Status Footer */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="pt-4 flex items-center justify-center gap-2"
      >
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
         <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Changes are saved automatically</span>
      </motion.div>
    </motion.div>
  );
};

export default NotificationAlerts;
