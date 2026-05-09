import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Package, Truck, Calendar, MapPin, 
  ChevronRight, ArrowRight, ShieldCheck, Star, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { requirementApi, chatApi, userApi, settingsApi } from "@/lib/api";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { toast } from "sonner";

const FinalizationFlow = () => {
  const { requestId, vendorId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const handleCancelAndReopen = () => {
    navigate(-1);
  };

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch requirement details
        const reqRes = await requirementApi.getDetails(requestId);
        const reqData = reqRes.data || reqRes;
        
        // Fetch bids
        const bidsRes = await requirementApi.getBids(requestId);
        const bidsData = bidsRes.data || bidsRes;

        // Find the specific bid belonging to the vendorId
        const activeBid = bidsData.find(b => {
          const vId = b.vendor?._id?.toString() || b.vendor?.toString();
          return vId === vendorId;
        });

        if (!reqData) {
          throw new Error("Requirement not found");
        }

        // Fetch wallet balance
        let walletBal = 0;
        try {
          const walletRes = await userApi.getWallet();
          if (walletRes.success) {
            walletBal = walletRes.data.balance || 0;
          }
        } catch (wErr) {
          console.error("Error loading wallet balance:", wErr);
        }

        setWalletBalance(walletBal);
        setData({
          requirement: reqData,
          bid: activeBid,
        });
      } catch (err) {
        console.error("Error loading finalization details:", err);
        setError("Failed to load deal details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (requestId && vendorId) {
      loadDetails();
    }
  }, [requestId, vendorId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Compiling Deal Summary...</p>
      </div>
    );
  }

  if (error || !data?.requirement) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h3 className="font-bold text-zinc-900 tracking-tight">Deal Not Found</h3>
        <p className="text-[11px] text-zinc-500 font-bold tracking-tight max-w-xs">{error || "This deal request could not be found."}</p>
        <Button onClick={() => navigate("/user/requests")} className="bg-primary text-zinc-900 font-bold text-xs h-10 px-5 rounded-xl">
          Back to My Requests
        </Button>
      </div>
    );
  }

  const reqData = data.requirement;
  const bidData = data.bid;

  const vendor = {
    name: bidData?.vendor?.name || "Driver Partner",
    rating: bidData?.vendor?.rating || 4.8,
    isVerified: bidData?.vendor?.hasVerifiedBadge || bidData?.vendor?.isVerified || false,
    avatar: bidData?.vendor?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(bidData?.vendor?.name || "DP")}`,
    quote: `₹${(bidData?.amount || reqData?.price || 1733).toLocaleString('en-IN')}`
  };

  const request = {
    service: (reqData?.serviceType || "Goods Transport").replace('-', ' ').toUpperCase(),
    pickup: reqData?.pickup?.address || "N/A",
    dropoff: reqData?.drops?.[0]?.address || "N/A",
    date: reqData?.date 
      ? new Date(reqData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      : "N/A",
  };

  const handleConfirmBooking = async () => {
    const bidAmount = bidData?.amount || 0;
    const hasSufficientBalance = walletBalance >= bidAmount;

    try {
      setConfirming(true);

      if (hasSufficientBalance) {
        // 1. Paid fully via wallet
        const res = await chatApi.acceptCompositeDealWithWallet(requestId, vendorId);
        if (res.success) {
          toast.success("Deal Confirmed! Amount deducted from your wallet.", { icon: "🤝" });
          navigate("/user/requests");
        }
      } else {
        // 2. Insufficient balance -> Top up shortfall via Razorpay, then complete booking
        const shortfall = bidAmount - walletBalance;
        
        // Load Razorpay script
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          toast.error("Razorpay SDK failed to load. Please check your connection.");
          setConfirming(false);
          return;
        }

        // Fetch Razorpay key
        const keyRes = await settingsApi.getRazorpayKey();
        const razorpayKey = keyRes.data.keyId;

        // Create a wallet top-up order for the shortfall
        const orderRes = await userApi.createWalletOrder(shortfall);
        if (!orderRes.success) {
          toast.error("Failed to initiate shortfall payment");
          setConfirming(false);
          return;
        }

        const orderData = orderRes.data;

        // Open Razorpay for the shortfall
        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "GoRide Super App",
          description: `Top-up shortfall: ₹${shortfall}`,
          order_id: orderData.id,
          handler: async (response) => {
            setConfirming(true);
            try {
              // Verify top-up
              const verifyRes = await userApi.verifyWalletPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                toast.success(`Shortfall of ₹${shortfall} added! Confirming deal...`);
                
                // Now verify signature succeeds and wallet balance is complete. Deduct full bid amount!
                const finalizeRes = await chatApi.acceptCompositeDealWithWallet(requestId, vendorId);
                if (finalizeRes.success) {
                  toast.success("Deal Accepted & Paid! Your ride is booked.", { icon: "🚗" });
                  navigate("/user/requests");
                }
              } else {
                toast.error("Verification failed on shortfall top-up.");
              }
            } catch (vErr) {
              toast.error(vErr.message || "Failed to finalize booking");
            } finally {
              setConfirming(false);
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
              setConfirming(false);
              toast.info("Payment cancelled");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error("Deal acceptance error:", err);
      toast.error(err.message || "Booking confirmation failed.");
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-10">
      <header className="text-center space-y-4 py-6">
        <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ type: "spring", damping: 12 }}
           className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm"
        >
           <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <div className="space-y-1">
           <h1 className="text-2xl font-bold text-black tracking-tight">Confirm Your Deal</h1>
           <p className="text-sm text-zinc-500 font-bold">You are about to finalize with {vendor.name}</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Deal Summary Card */}
        <Card className="border-none shadow-premium overflow-hidden bg-white rounded-3xl">
           <CardContent className="p-0">
              {/* Vendor Hero in Card */}
              <div className="bg-zinc-50 p-6 flex items-center justify-between border-b border-zinc-100">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-zinc-200 rounded-full">
                       <AvatarImage src={vendor.avatar} />
                       <AvatarFallback>{vendor.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                       <div className="flex items-center gap-1">
                          <h4 className="font-bold text-black">{vendor.name}</h4>
                          {vendor.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary fill-primary/10" />}
                       </div>
                       <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-zinc-600">{vendor.rating}</span>
                          <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap px-1">• {bidData?.vendor?.totalRatings || 124} Completed Jobs</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Total Quote</span>
                    <span className="text-xl font-black text-primary tracking-tight">{vendor.quote}</span>
                 </div>
              </div>

              {/* Details List */}
              <div className="p-6 space-y-5">
                 <div className="flex gap-4">
                    <div className="p-3 bg-primary text-black rounded-2xl h-fit">
                       <Package className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Service Requirement</p>
                        <p className="text-sm font-bold text-black">{request.service}</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="p-3 bg-black text-white rounded-2xl h-fit">
                       <MapPin className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Journey</p>
                        <p className="text-sm font-bold text-black line-clamp-1">{request.pickup}</p>
                        <ArrowRight className="w-3 h-3 text-zinc-300" />
                        <p className="text-sm font-bold text-black line-clamp-1">{request.dropoff}</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="p-3 bg-zinc-100 text-black rounded-2xl h-fit">
                       <Calendar className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Scheduled Date</p>
                        <p className="text-sm font-bold text-black">{request.date}</p>
                    </div>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Payment Summary details */}
        <Card className="border-2 border-zinc-100 rounded-3xl p-5 bg-zinc-50/50 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Payment Breakdown</span>
            <span className="text-[9px] font-black text-zinc-500 bg-white px-2.5 py-1 rounded-full border border-zinc-100 uppercase tracking-wider">Escrow Protected</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-700">
              <span>Required Booking Amount:</span>
              <span className="text-zinc-900 font-black">₹{bidData?.amount?.toLocaleString('en-IN') || "0"}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-zinc-700">
              <span>Your Available Wallet Balance:</span>
              <span className="text-zinc-900 font-black">₹{walletBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="border-t border-zinc-200/60 pt-3">
            {walletBalance >= (bidData?.amount || 0) ? (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black uppercase text-emerald-800 tracking-tight">Wallet Balance Sufficient</h5>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5">Amount will be debited directly upon booking</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black uppercase text-amber-800 tracking-tight">Top-Up Needed (₹{((bidData?.amount || 0) - walletBalance).toLocaleString('en-IN')})</h5>
                  <p className="text-[9px] font-bold text-amber-600 uppercase mt-0.5">Pay remaining via Razorpay securely during confirmation</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action and Terms */}
        <div className="space-y-4 pt-4">
           <div className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[11px] text-zinc-500">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                 By confirming this service, you agree to Getgoride's <span className="text-primary underline cursor-pointer">Escrow Terms</span> and <span className="text-primary underline cursor-pointer">Service Policy</span>. Your payment is held securely and only released after service completion.
              </p>
           </div>
           
           <Button 
             disabled={confirming}
             className="w-full h-16 rounded-3xl bg-primary text-black text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
             onClick={handleConfirmBooking}
           >
              {confirming ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Securing Ride...
                </div>
              ) : walletBalance >= (bidData?.amount || 0) ? "Pay & Book with Wallet" : `Top-up ₹${((bidData?.amount || 0) - walletBalance).toLocaleString('en-IN')} & Book`}
           </Button>
           
           <Button 
              variant="ghost" 
              disabled={confirming}
              className="w-full text-zinc-400 font-bold hover:bg-transparent h-fit p-1 disabled:opacity-50"
              onClick={handleCancelAndReopen}
           >
              Cancel & Return to Chat
           </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalizationFlow;
