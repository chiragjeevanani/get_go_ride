import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Check, ArrowRight, History, 
  CreditCard, Clock, Star, Zap, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";

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
  const [isRenewModalOpen, setIsRenewModalOpen] = React.useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [renewStep, setRenewStep] = React.useState('confirm'); // 'confirm' | 'payment' | 'success'
  const [upgradeStep, setUpgradeStep] = React.useState('list'); // 'list' | 'checkout' | 'payment' | 'success'
  const [selectedPlanData, setSelectedPlanData] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState('upi');

  const handleUpgradeSelection = (plan) => {
    setSelectedPlanData(plan);
    setUpgradeStep('checkout');
  };

  const handleUpgradeCheckout = () => {
    setUpgradeStep('payment');
  };

  const handleUpgradePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
       setIsProcessing(false);
       setUpgradeStep('success');
       setTimeout(() => {
          setIsUpgradeModalOpen(false);
          setUpgradeStep('list');
          setSelectedPlanData(null);
       }, 2000);
    }, 2000);
  };

  const handleRenew = () => {
    if (renewStep === 'confirm') {
       setRenewStep('payment');
       return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setRenewStep('success');
      setTimeout(() => {
         setIsRenewModalOpen(false);
         setRenewStep('confirm');
      }, 2000);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24 pt-4 px-1"
    >
      {/* Header */}
      <header className="flex items-center gap-4 -mx-5 px-5 py-3 border-b-2 border-yellow-400 sticky top-0 bg-white/90 backdrop-blur-md z-30 mb-5">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none uppercase">Subscription</h1>
          <p className="text-[10px] font-semibold text-zinc-500 tracking-tight mt-1">Manage your active plan</p>
        </div>
      </header>

      {/* Current Plan Highlight */}
      <section className="relative px-1">
          <Card className="bg-zinc-900 border-none rounded-none overflow-hidden text-white relative z-10 shadow-2xl">
             <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                   <div className="space-y-0.5">
                      <Badge className="bg-primary text-zinc-900 font-bold text-[9px] tracking-widest h-5 px-2 border-none uppercase rounded-none">Active</Badge>
                      <h2 className="text-xl font-bold tracking-tight uppercase">{currentPlan.name}</h2>
                   </div>
                   <div className="w-9 h-9 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-md border border-white/5">
                      <Shield className="w-4.5 h-4.5 text-primary" />
                   </div>
                </div>
 
                <div className="space-y-3.5">
                   <div className="flex items-center gap-3 bg-white/5 p-3 rounded-none border border-white/10">
                      <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Expires on</span>
                         <span className="text-xs font-bold text-white tracking-tight">{currentPlan.expiry}</span>
                      </div>
                   </div>
 
                   <div className="space-y-1.5 pt-0.5">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">Active Benefits</span>
                      <div className="grid grid-cols-1 gap-2">
                         {currentPlan.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2.5 px-1 text-zinc-400">
                               <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[4]" />
                               <span className="text-[10px] font-bold tracking-tight">{benefit}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
 
                <div className="flex gap-2.5 pt-1">
                   <Button onClick={() => setIsRenewModalOpen(true)} className="flex-1 h-11 bg-white text-zinc-900 font-bold text-[10px] rounded-none hover:bg-zinc-100 uppercase tracking-widest">Renew Now</Button>
                   <Button onClick={() => setIsUpgradeModalOpen(true)} variant="outline" className="flex-1 h-11 bg-transparent border-white/20 text-white font-bold text-[10px] rounded-none hover:bg-white/5 uppercase tracking-widest">Upgrade</Button>
                </div>
             </CardContent>
          </Card>
       </section>

      {/* Benefits Reminder */}
      <section className="px-1 space-y-4">
         <div className="p-4 bg-white border border-zinc-100 rounded-none flex items-center gap-4 group cursor-pointer hover:border-primary transition-all shadow-sm">
            <div className="w-10 h-10 bg-zinc-50 rounded-none flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors cursor-default">
               <Star className="w-5 h-5 text-zinc-300 group-hover:text-primary transition-colors" fill="currentColor" />
            </div>
            <div className="space-y-0.5">
               <h4 className="text-[11px] font-bold text-zinc-900 tracking-tight uppercase">Need more leads?</h4>
               <p className="text-[10px] text-zinc-400 font-bold tracking-tight">Switch to Quarterly for 20% savings</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-200 ml-auto group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
         </div>
      </section>

      {/* Payment History */}
      <section className="space-y-4 px-1">
         <div className="flex items-center gap-2 px-1">
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <h3 className="text-[10px] font-bold tracking-tight text-zinc-500 uppercase">Payment History</h3>
         </div>

         <div className="space-y-0">
            {history.map((txn) => (
               <Card key={txn.id} className="border border-zinc-100 shadow-none rounded-none border-b-0 last:border-b overflow-hidden bg-white">
                  <CardContent className="p-3.5 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-zinc-50 flex items-center justify-center border border-zinc-100">
                           <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[11px] font-bold text-zinc-900 tracking-tight">{txn.id}</span>
                           <span className="text-[9px] font-bold text-zinc-400 tracking-tight">{txn.date}</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold text-zinc-900">{txn.amount}</span>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-bold tracking-tight h-4 px-1.5 rounded-none uppercase">Success</Badge>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
         <Button variant="link" className="w-full text-[9px] font-bold text-zinc-400 h-auto p-0 pt-2 tracking-tight uppercase">Download All Receipts</Button>
      </section>

      {/* Renew Modal */}
      <Dialog open={isRenewModalOpen} onOpenChange={(val) => {
         setIsRenewModalOpen(val);
         if (!val) setRenewStep('confirm');
      }}>
        <DialogContent className="sm:max-w-md rounded-none border-none p-0 bg-white shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
             {renewStep === 'confirm' && (
                <motion.div 
                   key="confirm"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="p-8 space-y-6"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-none flex items-center justify-center border border-primary/10">
                         <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                         <h2 className="text-xl font-bold tracking-tight text-zinc-900 uppercase">Renew Plan</h2>
                         <p className="text-[11px] font-semibold text-zinc-500 tracking-tight">Extend your platform access</p>
                      </div>
                   </div>
                   
                   <div className="p-5 bg-zinc-900 rounded-none text-white space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-zinc-500 uppercase">Current Plan</span>
                         <Badge className="bg-primary text-zinc-900 font-black border-none text-[8px] h-4 rounded-none">STANDARD</Badge>
                      </div>
                      <div className="flex items-baseline justify-between">
                         <p className="text-3xl font-black text-white">{currentPlan.price}<span className="text-xs font-bold text-zinc-500"> / Month</span></p>
                      </div>
                   </div>

                   <div className="flex flex-col gap-2 pt-2">
                     <Button onClick={handleRenew} className="w-full h-12 bg-zinc-900 text-white rounded-none font-black shadow-xl shadow-zinc-900/10 uppercase text-[11px] tracking-widest">Proceed to Payment</Button>
                     <Button variant="ghost" onClick={() => setIsRenewModalOpen(false)} className="w-full h-11 rounded-none font-bold text-zinc-400 text-xs uppercase">Cancel</Button>
                   </div>
                </motion.div>
             )}

             {renewStep === 'payment' && (
                <motion.div 
                   key="payment"
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   className="p-8 space-y-6"
                >
                   <div className="space-y-1">
                      <h2 className="text-xl font-bold tracking-tight text-zinc-900 uppercase">Select Payment</h2>
                      <p className="text-[11px] font-semibold text-zinc-500 tracking-tight">Choose your preferred method</p>
                   </div>

                   <div className="space-y-3">
                      {[
                         { id: 'upi', label: 'UPI (GPay, PhonePe)', icon: '📱' },
                         { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                         { id: 'wallet', label: 'Wallets', icon: '👛' }
                      ].map((method) => (
                         <div 
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={cn(
                               "p-4 rounded-none border-2 transition-all cursor-pointer flex items-center gap-4",
                               paymentMethod === method.id 
                                 ? "border-primary bg-primary/5" 
                                 : "border-zinc-50 bg-zinc-50 hover:border-zinc-100"
                            )}
                         >
                            <span className="text-xl">{method.icon}</span>
                            <span className="text-sm font-bold text-zinc-900">{method.label}</span>
                            {paymentMethod === method.id && <Check className="w-4 h-4 text-primary ml-auto stroke-[4]" />}
                         </div>
                      ))}
                   </div>

                   <Button 
                      onClick={handleRenew} 
                      disabled={isProcessing}
                      className="w-full h-12 bg-zinc-900 text-white rounded-none font-black shadow-xl shadow-zinc-900/10 uppercase tracking-widest text-[11px]"
                    >
                      {isProcessing ? "Processing..." : "Complete Payment"}
                    </Button>
                </motion.div>
             )}

             {renewStep === 'success' && (
                <motion.div 
                   key="success"
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="p-10 flex flex-col items-center text-center space-y-4"
                >
                   <div className="w-20 h-20 bg-emerald-500 rounded-none flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                      <Check className="w-10 h-10 text-white stroke-[3.5]" />
                   </div>
                   <div className="space-y-1">
                      <h2 className="text-xl font-bold text-zinc-900 uppercase">Renewal Successful!</h2>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">Your plan has been extended</p>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={(val) => {
         setIsUpgradeModalOpen(val);
         if (!val) {
            setUpgradeStep('list');
            setSelectedPlanData(null);
         }
      }}>
        <DialogContent className="sm:max-w-md rounded-none border-none p-0 bg-white overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
          <AnimatePresence mode="wait">
             {upgradeStep === 'list' && (
                <motion.div 
                   key="list"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0, scale: 0.98 }}
                   className="flex flex-col h-full"
                >
                   <div className="bg-zinc-900 p-6 pb-4 text-white">
                      <div className="space-y-1">
                         <h2 className="text-xl font-bold tracking-tight uppercase">Premium Plans</h2>
                         <p className="text-[10px] font-bold text-zinc-500 tracking-tight uppercase">Scale your fleet growth now</p>
                      </div>
                   </div>
                   
                   <div className="p-4 flex-1 overflow-y-auto space-y-3 pb-8 bg-zinc-50 text-black">
                      {[
                         { 
                            name: "Standard", 
                            price: "499", 
                            period: "1 Mo", 
                            benefits: ["Unlimited leads", "Live chat", "Profile Search"],
                            popular: false
                         },
                         { 
                            name: "Quarterly", 
                            price: "1299", 
                            period: "3 Mo", 
                            benefits: ["All Standard +", "Priority Alerts", "Verified Badge", "Fleet Stats"],
                            popular: true
                         },
                         { 
                            name: "Annual", 
                            price: "3999", 
                            period: "12 Mo", 
                            benefits: ["Max Scale", "24/7 Support", "Advanced Analytics", "Lead CRM"],
                            popular: false
                         }
                      ].map((plan, i) => (
                         <Card key={i} className={cn(
                            "border-2 rounded-none p-4 relative overflow-hidden transition-all",
                            plan.popular ? "border-primary bg-white shadow-xl scale-[1.01]" : "border-zinc-200 bg-white"
                         )}>
                            {plan.popular && (
                               <Badge className="absolute top-0 right-0 bg-primary text-zinc-900 border-none font-black text-[7px] uppercase tracking-widest px-2 py-1 rounded-none">MOST POPULAR</Badge>
                            )}
                            <div className="flex justify-between items-center gap-4">
                               <div className="space-y-1 flex-1 text-black">
                                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{plan.name}</h4>
                                  <div className="flex items-baseline gap-1">
                                     <span className="text-xl font-black text-zinc-900">₹{plan.price}</span>
                                     <span className="text-[9px] font-bold text-zinc-400">/ {plan.period}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                                     {plan.benefits.slice(0, 2).map((b, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5">
                                           <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[3.5]" />
                                           <span className="text-[8px] font-bold text-zinc-500 tracking-tight uppercase">{b}</span>
                                        </div>
                                     ))}
                                  </div>
                               </div>

                               <Button onClick={() => handleUpgradeSelection(plan)} className={cn(
                                  "h-9 px-4 rounded-none font-black text-[9px] uppercase tracking-widest shrink-0 transition-all",
                                  plan.popular ? "bg-primary text-zinc-900 shadow-lg shadow-primary/20" : "bg-zinc-900 text-white hover:bg-zinc-800"
                               )}>
                                  Select
                               </Button>
                            </div>
                         </Card>
                      ))}
                   </div>
                </motion.div>
             )}

             {upgradeStep === 'checkout' && selectedPlanData && (
                <motion.div 
                   key="checkout"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="p-8 space-y-6"
                >
                   <div className="space-y-1">
                      <Button variant="ghost" onClick={() => setUpgradeStep('list')} className="p-0 h-auto hover:bg-transparent text-zinc-400 text-[10px] uppercase font-bold flex items-center gap-1 mb-2">
                         <ChevronLeft className="w-3 h-3" /> Back to plans
                      </Button>
                      <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Review Plan</h2>
                   </div>

                   <div className="p-6 bg-zinc-900 text-white space-y-6 border-l-4 border-primary">
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Selected Tier</span>
                         <h3 className="text-2xl font-black uppercase text-primary leading-none">{selectedPlanData.name}</h3>
                         <p className="text-xs font-bold text-zinc-400 tracking-tight">{selectedPlanData.period} Access Tier</p>
                      </div>

                      <div className="space-y-3">
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Included Features</span>
                         <div className="grid grid-cols-1 gap-2.5">
                            {selectedPlanData.benefits.map((b, i) => (
                               <div key={i} className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-none bg-primary/10 flex items-center justify-center border border-primary/10">
                                     <Check className="w-2.5 h-2.5 text-primary stroke-[4]" />
                                  </div>
                                  <span className="text-[10px] font-bold text-zinc-300 uppercase leading-none">{b}</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-between items-baseline">
                         <span className="text-xs font-bold text-zinc-500 uppercase">Total to Pay</span>
                         <span className="text-2xl font-black text-white">₹{selectedPlanData.price}</span>
                      </div>
                   </div>

                   <Button onClick={handleUpgradeCheckout} className="w-full h-12 bg-zinc-900 text-white rounded-none font-black shadow-xl shadow-zinc-900/10 uppercase tracking-widest text-[11px]">Proceed to Checkout</Button>
                </motion.div>
             )}

             {upgradeStep === 'payment' && (
                <motion.div 
                   key="payment"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="p-8 space-y-6"
                >
                   <div className="space-y-1">
                      <h2 className="text-xl font-bold tracking-tight text-zinc-900 uppercase">Secure Payment</h2>
                      <p className="text-[11px] font-semibold text-zinc-500 tracking-tight uppercase">Pay ₹{selectedPlanData?.price} via safe gateway</p>
                   </div>

                   <div className="space-y-3">
                      {[
                         { id: 'upi', label: 'UPI (GPay, PhonePe, BHIM)', icon: '📱' },
                         { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                         { id: 'wallet', label: 'Digital Wallets', icon: '👛' }
                      ].map((method) => (
                         <div 
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={cn(
                               "p-4 rounded-none border-2 transition-all cursor-pointer flex items-center gap-4",
                               paymentMethod === method.id 
                                 ? "border-primary bg-primary/5" 
                                 : "border-zinc-50 bg-zinc-50 hover:border-zinc-100"
                            )}
                         >
                            <span className="text-xl">{method.icon}</span>
                            <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">{method.label}</span>
                            {paymentMethod === method.id && <Check className="w-4 h-4 text-primary ml-auto stroke-[4]" />}
                         </div>
                      ))}
                   </div>

                   <Button 
                      onClick={handleUpgradePayment} 
                      disabled={isProcessing}
                      className="w-full h-12 bg-zinc-900 text-white rounded-none font-black shadow-xl shadow-zinc-900/10 uppercase tracking-widest text-[11px]"
                    >
                      {isProcessing ? "Verifying..." : `Pay ₹${selectedPlanData?.price} Now`}
                    </Button>
                </motion.div>
             )}

             {upgradeStep === 'success' && (
                <motion.div 
                   key="success"
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="p-12 flex flex-col items-center text-center space-y-6"
                >
                   <div className="w-24 h-24 bg-emerald-500 rounded-none flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                      <Check className="w-12 h-12 text-white stroke-[4]" />
                   </div>
                   <div className="space-y-2">
                      <h2 className="text-2xl font-black text-zinc-900 uppercase leading-none tracking-tighter">Upgrade Activated!</h2>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-tight">Your fleet is now running on {selectedPlanData?.name} tier.</p>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SubscriptionManagement;
