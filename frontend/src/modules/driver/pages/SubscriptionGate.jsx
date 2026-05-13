import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Check, Zap, Star, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";
import { planApi, settingsApi } from "@/lib/api";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { toast } from "sonner";

const benefits = [
  "Access to high-quality leads",
  "Increased profile visibility",
  "Negotiate directly with customers",
  "Dedicated support"
];

const SubscriptionGate = () => {
  const navigate = useNavigate();
  const { setDriver } = useDriverState();
  const [dbPlans, setDbPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await planApi.getAll();
        const activePlans = res.data || [];
        setDbPlans(activePlans);
        
        // Auto-select the first paid plan as default active plan
        const defaultPaid = activePlans.find(p => p.price > 0);
        if (defaultPaid) {
          setSelectedPlanId(defaultPaid._id);
        }
      } catch (err) {
        console.error("Failed to load subscription plans:", err);
        toast.error("Unable to load latest subscription plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleActivate = async (planId) => {
    if (submitting) return;

    const plan = dbPlans.find(p => p._id === planId);
    if (!plan) return;

    setSubmitting(true);
    try {
      // 1. If it's a free trial, directly subscribe
      if (plan.price === 0) {
        const res = await planApi.subscribe(planId);
        localStorage.setItem('gtgl_driver', JSON.stringify(res.data.vendor));
        setDriver(res.data.vendor);
        toast.success(`Plan "${res.data.plan.name}" activated successfully!`);
        navigate("/driver/dashboard");
        return;
      }

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your connection.");
        setSubmitting(false);
        return;
      }

      // 3. Fetch Razorpay key
      const keyRes = await settingsApi.getRazorpayKey();
      const razorpayKey = keyRes.data.keyId;

      // 4. Create subscription order
      const orderRes = await planApi.createSubscriptionOrder(planId);
      if (!orderRes.success) {
        toast.error("Failed to initialize subscription order");
        setSubmitting(false);
        return;
      }

      const orderData = orderRes.data;

      // 5. Setup Razorpay options
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "GoRide Premium",
        description: `Subscription: ${plan.name}`,
        order_id: orderData.id,
        handler: async (response) => {
          setSubmitting(true);
          try {
            // Verify payment on server
            const verifyRes = await planApi.verifySubscriptionPayment(planId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              localStorage.setItem('gtgl_driver', JSON.stringify(verifyRes.data.vendor));
              setDriver(verifyRes.data.vendor);
              toast.success(`Plan "${verifyRes.data.plan.name}" activated successfully!`);
              navigate("/driver/dashboard");
            } else {
              toast.error("Signature verification failed.");
            }
          } catch (verifyErr) {
            toast.error(verifyErr.message || "Failed to verify transaction");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: localStorage.getItem("gtgl_driver") ? JSON.parse(localStorage.getItem("gtgl_driver")).name : "",
          phone: localStorage.getItem("gtgl_driver") ? JSON.parse(localStorage.getItem("gtgl_driver")).phone : "",
        },
        theme: {
          color: "#facc15",
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast.info("Payment cancelled");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Failed to configure Razorpay checkouts");
      setSubmitting(false);
    }
  };

  const freePlan = dbPlans.find(p => p.price === 0);
  const paidPlans = dbPlans.filter(p => p.price > 0);

  const formatPeriod = (days) => {
    if (days === 30) return "/mo";
    if (days === 90) return "/3mo";
    if (days === 365) return "/year";
    return `/${days} days`;
  };

  const getPlanBadge = (plan) => {
    if (plan.price >= 8000) return "Best Value ⭐";
    if (plan.leadQuota?.type === 'unlimited') return "Popular 🔥";
    return "Most Flexible";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
         <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
         <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Loading Premium Plans...</span>
      </div>
    );
  }

  const selectedPlan = dbPlans.find(p => p._id === selectedPlanId);

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative overflow-hidden flex flex-col pt-8 pb-6 px-5">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="relative z-10 space-y-6 flex flex-col h-full">
        {/* Simple Header with Back Button */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-2">
           <Button 
             variant="ghost" 
             size="icon" 
             className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100" 
             onClick={() => navigate(-1)}
           >
              <ChevronLeft className="w-5 h-5 text-zinc-600" />
           </Button>
           <h2 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Subscription Plans</h2>
           <div className="w-9"></div>
        </div>

        {/* Header */}
        <div className="space-y-2 text-center pt-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center relative shadow-inner animate-pulse">
             <Shield className="w-8 h-8 text-primary" strokeWidth={2.5} />
             <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-4 border-white">
                <Check className="w-2.5 h-2.5 text-zinc-900 font-bold" strokeWidth={4} />
             </div>
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight leading-tight">Activate Account</h1>
            <p className="text-[10px] font-bold text-zinc-400 leading-relaxed max-w-[200px] mx-auto tracking-tight">Start receiving leads and grow your business today</p>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="space-y-3">
          {paidPlans.map((plan, index) => {
            const isSelected = selectedPlanId === plan._id;
            const badge = getPlanBadge(plan);
            const isPopular = plan.leadQuota?.type === 'unlimited';

            return (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPlanId(plan._id)}
                className="cursor-pointer"
              >
                <Card className={cn(
                  "relative border-2 rounded-2xl transition-all duration-300 hover:shadow-xl",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.01]" 
                    : "border-zinc-100 bg-white"
                )}>
                  {badge && (
                    <div className="absolute -top-2.5 left-4">
                      <Badge className={cn(
                        "font-bold text-[8px] tracking-tight px-2 py-0.5 border-2 border-white uppercase",
                        isSelected ? "bg-primary text-zinc-900" : "bg-zinc-100 text-zinc-500"
                      )}>
                        {badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black tracking-wider uppercase text-zinc-400 mb-0.5">{plan.name}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-zinc-900">₹{plan.price}</span>
                        <span className="text-[10px] font-bold text-zinc-400">{formatPeriod(plan.durationDays)}</span>
                      </div>
                      <p className="text-[9px] font-bold text-zinc-500 mt-1 leading-none">
                        {isPopular ? "✓ Unlimited leads" : `✓ ${plan.leadQuota?.limit || 10} leads per day`}
                      </p>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                      isSelected ? "bg-primary border-primary text-zinc-900 shadow-sm" : "bg-white border-zinc-100 text-zinc-300"
                    )}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Checklist */}
        <section className="bg-zinc-50/50 rounded-2xl p-4 border border-zinc-100 space-y-3">
          <h3 className="text-[10px] font-bold tracking-tight text-zinc-400 text-center">Benefits include</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-primary stroke-[4]" />
                </div>
                <span className="text-[11px] font-bold text-zinc-600">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Free Plan Skip Action */}
        {freePlan && (
          <div className="bg-amber-50/20 border border-dashed border-amber-500/20 rounded-2xl p-4 flex flex-col gap-2.5 items-center text-center">
             <div className="space-y-0.5">
               <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Safarsetto Basic</span>
               <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight">Try 30-Day Free Trial</h4>
               <p className="text-[9px] text-zinc-500 font-bold leading-relaxed">Skip payment and operate with {freePlan.leadQuota?.limit || 5} leads daily for 30 days.</p>
             </div>
             <Button 
               variant="outline"
               disabled={submitting}
               onClick={() => handleActivate(freePlan._id)}
               className="w-full h-9 rounded-xl border-2 border-zinc-200/80 text-zinc-800 bg-white hover:bg-zinc-50 text-[10px] font-black uppercase tracking-wider transition-all"
             >
               {submitting ? "Processing..." : "Skip & Try Free Plan"}
             </Button>
          </div>
        )}

        {/* Sticky CTA Button */}
        <div className="mt-auto pt-4 text-center space-y-2">
           <p className="text-[9px] text-zinc-400 font-bold tracking-tight">Secure payment via Upi or Cards</p>
           <Button 
             disabled={!selectedPlanId || submitting}
             onClick={() => handleActivate(selectedPlanId)}
             className="w-full h-12 rounded-xl bg-primary text-zinc-900 text-sm font-black uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
           >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Activation...
                </>
              ) : (
                `Activate ${selectedPlan ? selectedPlan.name : "Premium"} Now`
              )}
           </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGate;
