import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Package, MapPin, CheckCircle2, 
  CreditCard, Wallet, Truck, ShieldCheck, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import paymentSuccessLottie from "@/assets/Lottie/PaymentSuccess.json";

// Assets

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads } = useDriverState();
  const lead = leads.find(l => l.id === id) || leads[0];
  
  const [step, setStep] = useState('payment'); // 'payment' | 'processing' | 'success'

  const handleProcessPayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative flex flex-col">
      {/* Precision Header */}
      <header className="bg-white border-b-2 border-yellow-400 p-4 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="w-8 h-8 rounded-none bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-4 h-4 text-zinc-600" />
           </Button>
           <div className="flex flex-col">
              <h1 className="text-xs font-black text-black leading-none uppercase tracking-tighter">Deal Confirmation</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                 <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Lead ID: {id}</span>
              </div>
           </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        <AnimatePresence mode="wait">
          {step !== 'success' && (
            <motion.div 
               key="checkout-form"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="space-y-6 pb-24"
            >
              {/* Order Context */}
              <section className="space-y-3">
                 <h3 className="text-[8px] font-black tracking-[0.2em] text-zinc-400 uppercase px-1">Lead Identification</h3>
                 <Card className="rounded-none border-2 border-zinc-100 shadow-none bg-white overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b-2 border-zinc-50">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                             <Package className="w-5 h-5 fill-current" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-black uppercase tracking-tight">{lead?.service}</span>
                             <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{lead?.weight} payload</span>
                          </div>
                       </div>
                       <Badge className="rounded-none bg-zinc-900 text-white border-none text-[8px] font-black uppercase tracking-widest">Locked Rate</Badge>
                    </div>
                    <div className="p-4 bg-zinc-50/50 space-y-3">
                       <div className="flex gap-3">
                          <div className="flex flex-col items-center gap-1 mt-1">
                             <div className="w-1.5 h-1.5 bg-emerald-500"></div>
                             <div className="w-0.5 flex-1 bg-zinc-200 min-h-[16px]"></div>
                             <div className="w-1.5 h-1.5 bg-red-500"></div>
                          </div>
                          <div className="flex-1 space-y-3">
                             <div className="space-y-0.5">
                                <p className="text-[7px] font-black text-zinc-400 uppercase">Pickup</p>
                                <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-tighter leading-tight">{lead?.pickup}</p>
                             </div>
                             <div className="space-y-0.5">
                                <p className="text-[7px] font-black text-zinc-400 uppercase">Destination</p>
                                <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-tighter leading-tight">{lead?.drop}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </Card>
              </section>

              {/* Fare Summary */}
              <section className="space-y-3">
                 <h3 className="text-[8px] font-black tracking-[0.2em] text-zinc-400 uppercase px-1">Fare Summary</h3>
                 <div className="bg-zinc-900 p-6 space-y-4">
                    <div className="space-y-2.5">
                       <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          <span>Agreed Value</span>
                          <span className="text-white font-black">₹ 1500.00</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          <span>Gateway Service</span>
                          <span className="text-white font-black">₹ 45.00</span>
                       </div>
                    </div>
                    <div className="h-px bg-zinc-800 w-full"></div>
                    <div className="flex justify-between items-center">
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Net Total</p>
                          <p className="text-2xl font-black text-white tracking-tighter">₹ 1,545.00</p>
                       </div>
                       <ShieldCheck className="w-8 h-8 text-primary/20" />
                    </div>
                 </div>
              </section>


            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div 
               key="processing"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="fixed inset-0 bg-white z-[120] flex flex-col items-center justify-center p-8 space-y-8"
            >
               <div className="flex flex-col items-center gap-6 w-full max-w-[280px]">
                  {/* Cinematic Lottie Animation */}
                  <div className="w-48 h-48 flex items-center justify-center">
                     <Lottie 
                        animationData={paymentSuccessLottie} 
                        loop={true} 
                        className="w-full h-full"
                     />
                  </div>

                  {/* Progressive Sync Protocol */}
                  <div className="w-full space-y-6">
                     {/* Visual Progress Bar */}
                     <div className="h-1 bg-zinc-100 w-full rounded-none overflow-hidden relative">
                        <motion.div 
                           initial={{ width: "0%" }}
                           animate={{ width: "100%" }}
                           transition={{ duration: 2.5, ease: "easeInOut" }}
                           className="absolute top-0 left-0 bottom-0 bg-yellow-400"
                        />
                     </div>

                     {/* Sequential Execution Log */}
                     <div className="flex flex-col gap-1.5">
                        {[
                           { t: "Verifying Driver Details", delay: 0.2 },
                           { t: "Securing Connection", delay: 1.0 },
                           { t: "Finalizing Lead Assignment", delay: 1.8 }
                        ].map((log, i) => (
                           <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: log.delay }}
                              className="flex items-center gap-2"
                           >
                              <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                              <span className="text-[7.5px] font-black text-zinc-400 uppercase tracking-widest leading-none">{log.t}...</span>
                              <CheckCircle2 className="w-2 h-2 text-emerald-500 ml-auto" />
                           </motion.div>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
               key="success"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 space-y-12"
            >
               <div className="flex flex-col items-center gap-6">
                  <motion.div 
                     initial={{ scale: 0.5, rotate: -10 }}
                     animate={{ scale: 1, rotate: 0 }}
                     transition={{ type: "spring", bounce: 0.5 }}
                     className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 text-white flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)] ring-8 ring-green-50"
                  >
                     <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
                  </motion.div>
                  <div className="text-center space-y-3 px-4">
                     <h2 className="text-2xl font-black text-zinc-900 uppercase leading-none tracking-tighter">Deal Locked</h2>
                     <div className="h-1 bg-green-500 w-12 mx-auto rounded-full"></div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-zinc-900 uppercase tracking-[0.2em] opacity-80">
                           Ride Assigned
                        </p>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                           Pickup details shared with rider.
                        </p>
                     </div>
                  </div>
               </div>
               <div className="w-full max-w-xs pt-8">
                  <Button 
                    onClick={() => navigate("/driver/dashboard")} 
                    className="w-full h-14 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs rounded-none shadow-xl shadow-zinc-200 hover:bg-black transition-all"
                  >
                     Return to Command Center
                  </Button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(step === 'payment' || step === 'processing') && (
         <div className="p-3 pb-6 border-t border-zinc-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)] fixed bottom-0 left-0 right-0 z-50">
            <Button 
               onClick={handleProcessPayment}
               disabled={step === 'processing'}
               className="w-full h-12 bg-yellow-400 text-black font-black uppercase tracking-widest text-[10px] rounded-none shadow-lg shadow-yellow-100 hover:bg-yellow-500 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
            >
               {step === 'processing' ? 'Confirming Ride...' : 'Confirm Ride'} <ArrowRight className="w-4 h-4" />
            </Button>
         </div>
      )}
    </div>
  );
};

export default CheckoutPage;
