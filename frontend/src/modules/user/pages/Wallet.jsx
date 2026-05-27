import { useState, useEffect } from "react";
import { 
  ChevronLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, 
  History, CreditCard, Plus, ShieldCheck, ChevronRight, Loader2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { userApi, settingsApi } from "@/lib/api";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { toast } from "sonner";

const Wallet = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  // Modals state
  const [addMoneyModal, setAddMoneyModal] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    try {
      const res = await userApi.getWallet();
      if (res.success) {
        setBalance(res.data.balance || 0);
        setHistory(res.data.transactions || []);
      }
    } catch (err) {
      toast.error("Failed to load wallet information");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const val = Number(amountToAdd);
    if (!val || val <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Load Razorpay script
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your connection.");
        setSubmitting(false);
        return;
      }

      // 2. Fetch the Razorpay key
      const keyRes = await settingsApi.getRazorpayKey();
      const razorpayKey = keyRes.data.keyId;

      // 3. Create wallet order on the server
      const orderRes = await userApi.createWalletOrder(val);
      if (!orderRes.success) {
        toast.error("Failed to create Razorpay wallet order");
        setSubmitting(false);
        return;
      }

      const orderData = orderRes.data;

      // 4. Configure Razorpay checkout options
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "GoRide Super App",
        description: `Wallet Top-up: ₹${val}`,
        order_id: orderData.id,
        handler: async (response) => {
          setSubmitting(true);
          try {
            // 5. Verify transaction on backend
            const verifyRes = await userApi.verifyWalletPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: val,
            });

            if (verifyRes.success) {
              toast.success(`₹${val} successfully added to wallet via Razorpay!`);
              setBalance(verifyRes.data.balance || 0);
              setHistory(verifyRes.data.transactions || []);
              setAmountToAdd("");
              setAddMoneyModal(false);
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
          name: localStorage.getItem("gtgl_user") ? JSON.parse(localStorage.getItem("gtgl_user")).name : "",
          phone: localStorage.getItem("gtgl_user") ? JSON.parse(localStorage.getItem("gtgl_user")).phone : "",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">Loading Wallet...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-primary/50 px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 tracking-tight leading-none italic uppercase">My Wallet</h1>
          <p className="text-[10px] font-bold text-zinc-400 tracking-tight mt-1 uppercase">Payments & Top-Up</p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Balance Card - Simplified & High Density */}
        <section>
           <Card className="bg-zinc-900 border-none rounded-[2rem] overflow-hidden text-white relative shadow-2xl shadow-zinc-200 group">
              <CardContent className="p-6 relative z-10 flex flex-col justify-between min-h-[140px]">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest leading-none">Available Balance</span>
                       <h2 className="text-4xl font-semibold tracking-tighter tabular-nums">₹{balance.toLocaleString('en-IN')}</h2>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/5">
                       <WalletIcon className="w-6 h-6 text-primary" />
                    </div>
                 </div>

                 <div className="pt-4 flex">
                    <Button 
                      onClick={() => setAddMoneyModal(true)}
                      className="w-full h-11 bg-primary text-zinc-900 font-semibold text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-primary/20"
                    >
                       Add Money to Wallet
                    </Button>
                 </div>
              </CardContent>
              {/* Background gradient element */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>
           </Card>
        </section>

        {/* Transaction History */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-widest flex items-center gap-2 italic">
                 <History className="w-4 h-4" /> History
              </h3>
              <TabsList className="bg-zinc-100 p-1 rounded-xl h-8">
                 {["all", "debit", "credit"].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all",
                        activeTab === tab ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"
                      )}
                    >
                       {tab}
                    </button>
                 ))}
              </TabsList>
           </div>

           <div className="space-y-3">
              {history.length > 0 ? (
                history
                  .filter(item => activeTab === "all" || item.type === activeTab)
                  .map((item, index) => (
                   <Card key={item._id || index} className="border border-zinc-100 shadow-sm rounded-2xl overflow-hidden hover:border-primary/20 transition-all">
                      <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={cn(
                               "w-10 h-10 rounded-xl flex items-center justify-center",
                               item.type === "credit" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                            )}>
                               {item.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                               <h4 className="text-xs font-semibold text-zinc-900 tracking-tight">{item.description}</h4>
                               <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                 {item.type === "credit" ? "Deposit" : "Payment"}
                               </p>
                            </div>
                         </div>
                         <div className="text-right space-y-0.5">
                            <span className={cn(
                               "text-sm font-semibold tabular-nums",
                               item.type === "credit" ? "text-emerald-500" : "text-zinc-900"
                            )}>
                               {item.type === "credit" ? "+" : "-"}₹{item.amount.toLocaleString('en-IN')}
                            </span>
                            <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">
                              {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                         </div>
                      </CardContent>
                   </Card>
                ))
              ) : (
                <div className="py-8 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50 rounded-2xl">
                  No Transactions Found
                </div>
              )}
           </div>
        </section>
      </div>

      {/* Premium Protection Banner */}
      <section className="px-4 mt-6">
         <Card className="bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 p-4 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10 space-y-2">
               <Badge className="bg-emerald-500 text-white border-none font-semibold text-[8px] tracking-widest">SECURED SYSTEM</Badge>
               <h4 className="text-sm font-semibold text-zinc-900 leading-tight">Your digital wallet is highly secured.</h4>
               <p className="text-[10px] font-bold text-zinc-400 uppercase leading-normal tracking-tight">Funds are held in compliance with PCI-DSS safety standards.</p>
            </div>
            <ShieldCheck className="absolute -right-4 -bottom-4 w-20 h-20 text-emerald-500 opacity-20 rotate-[-15deg] group-hover:rotate-0 transition-transform" />
         </Card>
      </section>

      {/* Add Money Modal */}
      {addMoneyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[2.5rem] w-full max-w-md p-6 pb-8 space-y-6 animate-in slide-in-from-bottom-12 duration-300 shadow-2xl relative">
            <header className="flex justify-between items-center">
              <div className="flex flex-col">
                <h2 className="text-base font-semibold text-black uppercase tracking-tight">Top Up Wallet</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Add money instantly</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-zinc-50 hover:bg-zinc-100" 
                onClick={() => setAddMoneyModal(false)}
              >
                <X className="w-4 h-4 text-zinc-500" />
              </Button>
            </header>

            <form onSubmit={handleAddMoney} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest block ml-1">Amount to Add (INR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 500"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000].map(amt => (
                  <Button
                    key={amt}
                    type="button"
                    variant="ghost"
                    onClick={() => setAmountToAdd(amt.toString())}
                    className="h-9 rounded-xl border border-zinc-200 text-xs font-bold bg-zinc-50/50 hover:bg-zinc-50"
                  >
                    +₹{amt}
                  </Button>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 h-12 bg-primary text-black font-semibold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/20"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Top Up"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setAddMoneyModal(false)}
                  className="px-6 text-zinc-500 font-semibold uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Simplified TabsList for use inside the component
const TabsList = ({ children, className }) => (
  <div className={cn("flex", className)}>
    {children}
  </div>
);

export default Wallet;
