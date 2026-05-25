import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Package, Truck, Calendar, MapPin, 
  ArrowRight, ShieldCheck, Star, Loader2,
  ArrowLeft, Home, MessageSquare, Clock, Wallet, CreditCard, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { requirementApi, userApi, settingsApi, paymentApi } from "@/lib/api";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { toast } from "sonner";

const FinalizationFlow = () => {
  const { requestId, vendorId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const reqRes = await requirementApi.getDetails(requestId);
        const reqData = reqRes.data || reqRes;

        const bidsRes = await requirementApi.getBids(requestId);
        const bidsData = bidsRes.data || bidsRes;

        const activeBid = bidsData.find(b => {
          const vId = b.vendor?._id?.toString() || b.vendor?.toString();
          return vId === vendorId;
        });

        if (!reqData) throw new Error("Requirement not found");

        // Fetch wallet balance
        let walletBal = 0;
        try {
          const walletRes = await userApi.getWallet();
          if (walletRes.success) walletBal = walletRes.data.balance || 0;
        } catch {}

        setWalletBalance(walletBal);
        setData({ requirement: reqData, bid: activeBid });

        // If advance already paid, redirect to upcoming gig
        if (activeBid?.paymentStatus === 'advance_paid' || activeBid?.paymentStatus === 'completed') {
          const bidId = activeBid._id?.toString();
          navigate(`/user/gig/${bidId}`, { replace: true });
          return;
        }

        const isAlreadyAccepted = reqData.status === 'accepted' || reqData.status === 'Accepted';
        const acceptedBidId = reqData.acceptedBid?._id?.toString() || reqData.acceptedBid?.toString();
        const currentBidId = activeBid?._id?.toString();
        if (isAlreadyAccepted && acceptedBidId === currentBidId && activeBid?.paymentStatus === 'unpaid') {
          // Already accepted but advance not paid — show advance payment screen
        }
      } catch (err) {
        console.error("Error loading finalization details:", err);
        setFetchError("Failed to load deal details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (requestId && vendorId) loadDetails();
  }, [requestId, vendorId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Compiling Deal Summary...</p>
      </div>
    );
  }

  if (fetchError || !data?.requirement) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h3 className="font-bold text-zinc-900">Deal Not Found</h3>
        <p className="text-[11px] text-zinc-500 font-bold max-w-xs">{fetchError || "This deal could not be found."}</p>
        <Button onClick={() => navigate("/user/requests")} className="bg-primary text-zinc-900 font-bold text-xs h-10 px-5 rounded-xl">
          Back to My Requests
        </Button>
      </div>
    );
  }

  const reqData = data.requirement;
  const bidData = data.bid;
  const totalAmount = bidData?.amount || reqData?.price || 0;
  const advanceAmount = Math.round(totalAmount * 0.5);
  const finalAmount = totalAmount - advanceAmount;

  // Wallet-first: use wallet up to advance amount
  const walletUsed = Math.min(walletBalance, advanceAmount);
  const razorpayAmount = advanceAmount - walletUsed;

  const vendor = {
    name: bidData?.vendor?.name || "Driver Partner",
    rating: bidData?.vendor?.rating || 4.8,
    isVerified: bidData?.vendor?.hasVerifiedBadge || bidData?.vendor?.isVerified || false,
    avatar: bidData?.vendor?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(bidData?.vendor?.name || "DP")}`,
  };

  const request = {
    service: (reqData?.serviceType || "Goods Transport").replace('-', ' ').toUpperCase(),
    pickup: reqData?.pickup?.address || "N/A",
    dropoff: reqData?.drops?.[0]?.address || "N/A",
    date: reqData?.date
      ? new Date(reqData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      : "N/A",
  };

  const handlePayAdvance = async () => {
    const bidId = bidData?._id;
    if (!bidId) { toast.error("Bid not found"); return; }

    try {
      setConfirming(true);

      // 1. Create advance order (backend handles wallet-first logic)
      const orderRes = await paymentApi.createAdvanceOrder(bidId);
      if (!orderRes.success) {
        toast.error(orderRes.message || "Failed to initiate payment");
        return;
      }

      const orderData = orderRes.data;

      // If fully covered by wallet
      if (orderData.walletOnly || orderData.razorpayAmount === 0) {
        const verifyRes = await paymentApi.verifyAdvancePayment(bidId, {
          walletOnly: true,
          walletUsed: orderData.walletUsed,
        });
        if (verifyRes.success) {
          toast.success("Advance paid from wallet! Gig is confirmed.", { icon: "🎉" });
          setIsCompleted(true);
        }
        return;
      }

      // 2. Load Razorpay for remaining amount
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Razorpay failed to load. Check your connection.");
        return;
      }

      const keyRes = await settingsApi.getRazorpayKey();
      const razorpayKey = keyRes.data.keyId;

      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "GetGoLoad",
        description: `50% Advance for Gig`,
        order_id: orderData.order.id,
        handler: async (response) => {
          setConfirming(true);
          try {
            const verifyRes = await paymentApi.verifyAdvancePayment(bidId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              walletUsed: orderData.walletUsed,
              walletOnly: false,
            });
            if (verifyRes.success) {
              toast.success("Advance paid! Gig is confirmed.", { icon: "🚛" });
              setIsCompleted(true);
            } else {
              toast.error("Payment verification failed");
            }
          } catch (vErr) {
            toast.error(vErr.message || "Verification failed");
          } finally {
            setConfirming(false);
          }
        },
        prefill: {
          name: localStorage.getItem("gtgl_user") ? JSON.parse(localStorage.getItem("gtgl_user")).name : "",
          contact: localStorage.getItem("gtgl_user") ? JSON.parse(localStorage.getItem("gtgl_user")).phone : "",
        },
        theme: { color: "#facc15" },
        modal: {
          ondismiss: () => {
            setConfirming(false);
            toast.info("Payment cancelled");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Advance payment error:", err);
      toast.error(err.message || "Payment failed");
      setConfirming(false);
    }
  };

  if (isCompleted) {
    const bidId = bidData?._id?.toString();
    return (
      <div className="min-h-screen bg-zinc-50 pb-10">
        <div className="max-w-md mx-auto p-4 space-y-6">
          <header className="text-center space-y-4 py-8">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
              className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-black tracking-tighter">Gig Confirmed!</h1>
              <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest px-8">Advance of ₹{advanceAmount.toLocaleString('en-IN')} paid</p>
            </div>
          </header>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <div className="bg-emerald-500 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Advance Paid</p>
                  <p className="text-3xl font-black">₹{advanceAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Remaining (after gig)</p>
                  <p className="text-xl font-black">₹{finalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                  The remaining ₹{finalAmount.toLocaleString('en-IN')} will be paid after the gig is completed — via cash or online.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 pt-2">
            {bidId && (
              <Button
                className="w-full h-14 rounded-3xl bg-primary text-black text-base font-black shadow-lg"
                onClick={() => navigate(`/user/gig/${bidId}`)}
              >
                <Clock className="w-5 h-5 mr-2" /> Track Upcoming Gig
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full text-zinc-400 font-bold hover:bg-transparent"
              onClick={() => navigate("/user/requests")}
            >
              <Home className="w-4 h-4 mr-2" /> My Requests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <header className="text-center space-y-4 py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto"
          >
            <Truck className="w-10 h-10" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Confirm & Pay Advance</h1>
            <p className="text-sm text-zinc-500 font-bold">Pay 50% now to lock this gig with {vendor.name}</p>
          </div>
        </header>

        {/* Vendor + Gig Details */}
        <Card className="border-none shadow-lg overflow-hidden bg-white rounded-3xl">
          <CardContent className="p-0">
            <div className="bg-zinc-50 p-5 flex items-center justify-between border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={vendor.avatar} />
                  <AvatarFallback>{vendor.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-black">{vendor.name}</h4>
                    {vendor.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-zinc-600">{vendor.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-zinc-400">Total Quote</span>
                <p className="text-xl font-black text-zinc-900">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <div className="p-2.5 bg-primary text-black rounded-xl"><Package className="w-4 h-4" /></div>
                <div><p className="text-[10px] uppercase font-bold text-zinc-400">Service</p><p className="text-sm font-bold text-black">{request.service}</p></div>
              </div>
              <div className="flex gap-3">
                <div className="p-2.5 bg-black text-white rounded-xl"><MapPin className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Route</p>
                  <p className="text-sm font-bold text-black line-clamp-1">{request.pickup}</p>
                  <ArrowRight className="w-3 h-3 text-zinc-300 my-0.5" />
                  <p className="text-sm font-bold text-black line-clamp-1">{request.dropoff}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2.5 bg-zinc-100 text-black rounded-xl"><Calendar className="w-4 h-4" /></div>
                <div><p className="text-[10px] uppercase font-bold text-zinc-400">Date</p><p className="text-sm font-bold text-black">{request.date}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card className="border-2 border-zinc-100 rounded-3xl p-5 bg-zinc-50/50 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Payment Breakdown</span>
            <span className="text-[9px] font-black text-zinc-500 bg-white px-2.5 py-1 rounded-full border border-zinc-100 uppercase">50% Advance</span>
          </div>

          <div className="space-y-3">
            {/* Total */}
            <div className="flex justify-between text-xs font-bold text-zinc-700">
              <span>Total Gig Amount</span>
              <span className="font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <Separator />
            {/* Advance */}
            <div className="flex justify-between text-sm font-bold text-zinc-900">
              <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-primary" /> Pay Now (50%)</span>
              <span className="font-black text-primary">₹{advanceAmount.toLocaleString('en-IN')}</span>
            </div>
            {/* Final */}
            <div className="flex justify-between text-xs font-bold text-zinc-500">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Pay After Gig (50%)</span>
              <span>₹{finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Wallet usage */}
          <div className="border-t border-zinc-200 pt-3 space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-600">
              <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5 text-emerald-500" /> Wallet Balance</span>
              <span>₹{walletBalance.toLocaleString('en-IN')}</span>
            </div>
            {walletUsed > 0 && (
              <div className="flex justify-between text-xs font-bold text-emerald-600">
                <span>Wallet Used</span>
                <span>- ₹{walletUsed.toLocaleString('en-IN')}</span>
              </div>
            )}
            {razorpayAmount > 0 && (
              <div className="flex justify-between text-xs font-bold text-zinc-800">
                <span>Pay via Razorpay</span>
                <span className="font-black">₹{razorpayAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {razorpayAmount === 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[10px] font-black text-emerald-700 uppercase">Fully covered by wallet balance!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Terms */}
        <div className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[11px] text-zinc-500">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your advance payment is held securely by admin. The remaining 50% is paid after gig completion — cash or online.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            disabled={confirming}
            className="w-full h-16 rounded-3xl bg-primary text-black text-base font-black shadow-2xl shadow-primary/30 transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
            onClick={handlePayAdvance}
          >
            {confirming ? (
              <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</div>
            ) : razorpayAmount === 0
              ? `Pay ₹${advanceAmount.toLocaleString('en-IN')} from Wallet & Book`
              : `Pay ₹${razorpayAmount.toLocaleString('en-IN')} via Razorpay & Book`
            }
          </Button>
          <Button
            variant="ghost"
            disabled={confirming}
            className="w-full text-zinc-400 font-bold hover:bg-transparent"
            onClick={() => navigate(-1)}
          >
            Cancel & Return to Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalizationFlow;
