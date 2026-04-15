import { motion } from "framer-motion";
import { 
  Shield, Check, ArrowRight, History, 
  CreditCard, Clock, Star, Zap, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDriverState } from "../hooks/useDriverState";

const currentPlan = {
  name: "Standard Plan",
  price: "₹499",
  expiry: "May 15, 2026",
  status: "Active",
  benefits: [
    "Unlimited lead views",
    "Real-time chat with customers",
    "Profile visibility to public"
  ]
};

const history = [
  { id: "TXN-1092", date: "Apr 15, 2026", amount: "₹499", status: "Success" },
  { id: "TXN-0982", date: "Mar 15, 2026", amount: "₹499", status: "Success" },
  { id: "TXN-0873", date: "Feb 15, 2026", amount: "₹499", status: "Success" },
];

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const { driver } = useDriverState();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24 pt-4 px-1"
    >
      {/* Header */}
      <header className="flex items-center gap-4 px-1 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-xl font-black text-black tracking-tight leading-none uppercase italic">Subscription</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Manage your active plan</p>
        </div>
      </header>

      {/* Current Plan Highlight */}
      <section className="relative">
         <Card className="bg-zinc-900 border-none rounded-[2.5rem] overflow-hidden text-white relative z-10 shadow-2xl">
            <CardContent className="p-8 space-y-6">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                     <Badge className="bg-primary text-black font-black text-[9px] uppercase tracking-widest h-6 px-3 border-none">Active</Badge>
                     <h2 className="text-3xl font-black italic uppercase tracking-tight">{currentPlan.name}</h2>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                     <Shield className="w-6 h-6 text-primary" />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                     <Clock className="w-5 h-5 text-primary" />
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Expires on</span>
                        <span className="text-xs font-black uppercase text-white tracking-wide">{currentPlan.expiry}</span>
                     </div>
                  </div>

                  <div className="space-y-3 pt-2">
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2">Your Benefits</span>
                     {currentPlan.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 px-2">
                           <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 text-primary stroke-[4]" />
                           </div>
                           <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-tight">{benefit}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex gap-3 pt-4">
                  <Button className="flex-1 h-14 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-100 shadow-lg">Renew Now</Button>
                  <Button variant="outline" className="flex-1 h-14 bg-transparent border-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5">Upgrade</Button>
               </div>
            </CardContent>
         </Card>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10"></div>
      </section>

      {/* Benefits Reminder */}
      <section className="px-1 space-y-4">
         <div className="p-5 bg-white border-2 border-zinc-100 rounded-[2rem] flex items-center gap-4 group cursor-pointer hover:border-primary/20 transition-all">
            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors cursor-default">
               <Star className="w-6 h-6 text-zinc-300 group-hover:text-primary transition-colors" fill="currentColor" />
            </div>
            <div className="space-y-0.5">
               <h4 className="text-xs font-black text-black uppercase tracking-tight">Need more leads?</h4>
               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Switch to Quarterly for 20% savings</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-200 ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
         </div>
      </section>

      {/* Payment History */}
      <section className="space-y-4">
         <div className="flex items-center gap-2 px-1">
            <History className="w-4 h-4 text-zinc-300" />
            <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Payment History</h3>
         </div>

         <div className="space-y-3">
            {history.map((txn) => (
               <Card key={txn.id} className="border-2 border-zinc-50 shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-4 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                           <CreditCard className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-black tracking-tight">{txn.id}</span>
                           <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{txn.date}</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-black text-black">{txn.amount}</span>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest h-4 px-1.5">Success</Badge>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
         <Button variant="link" className="w-full text-[9px] font-black uppercase tracking-widest text-zinc-400 h-auto p-0 pt-2">Download All Receipts</Button>
      </section>
    </motion.div>
  );
};

export default SubscriptionManagement;
