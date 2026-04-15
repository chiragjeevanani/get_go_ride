import { motion } from "framer-motion";
import { Shield, Check, Zap, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "₹499",
    period: "/mo",
    badge: "Most Flexible",
    color: "border-zinc-100",
    description: "Perfect for testing the platform."
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: "₹1,299",
    period: "/3mo",
    badge: "Popular 🔥",
    color: "border-primary/40",
    featured: true,
    description: "Better value for regular drivers."
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "₹3,999",
    period: "/year",
    badge: "Best Value ⭐",
    color: "border-zinc-100",
    description: "Maximize your earnings all year."
  }
];

const benefits = [
  "Access to high-quality leads",
  "Increased profile visibility",
  "Negotiate directly with customers",
  "Dedicated support"
];

const SubscriptionGate = () => {
  const navigate = useNavigate();
  const { activateSubscription } = useDriverState();

  const handleActivate = (planId) => {
    activateSubscription(planId);
    navigate("/driver/dashboard");
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative overflow-hidden flex flex-col pt-12 pb-8 px-6">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="relative z-10 space-y-8 flex flex-col h-full">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center relative shadow-inner">
             <Shield className="w-10 h-10 text-primary" strokeWidth={2.5} />
             <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-4 border-white">
                <Check className="w-3 h-3 text-black font-black" strokeWidth={4} />
             </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-black tracking-tight leading-tight">Activate Account</h1>
            <p className="text-sm font-bold text-zinc-400 leading-relaxed max-w-[240px] mx-auto uppercase tracking-wider">Start receiving leads and grow your business today</p>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleActivate(plan.id)}
              className="cursor-pointer"
            >
              <Card className={cn(
                "relative border-2 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                plan.featured ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-zinc-100 bg-white"
              )}>
                {plan.badge && (
                  <div className="absolute -top-3 left-6">
                    <Badge className="bg-primary text-black font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border-2 border-white">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-0.5">{plan.name}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-black">{plan.price}</span>
                      <span className="text-xs font-bold text-zinc-400">{plan.period}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                    <ArrowRight className={cn("w-5 h-5", plan.featured ? "text-primary" : "text-zinc-200")} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Checklist */}
        <section className="bg-zinc-50/50 rounded-3xl p-6 border border-zinc-100 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Benefits include</h3>
          <div className="grid grid-cols-1 gap-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary stroke-[4]" />
                </div>
                <span className="text-xs font-bold text-zinc-600">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Sticky CTA Button (Fake interaction since plans are clickable) */}
        <div className="mt-auto pt-6 text-center">
           <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-4">Secure payment via UPI or Cards</p>
           <motion.div
             animate={{ scale: [1, 1.02, 1] }}
             transition={{ duration: 2, repeat: Infinity }}
           >
             <Button className="w-full h-16 rounded-3xl bg-primary text-black text-lg font-black shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                Activate Premium Now
             </Button>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGate;
