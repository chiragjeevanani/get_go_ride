import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2, MapPin, Calendar, Loader2, ChevronLeft,
  Banknote, Smartphone, AlertCircle, QrCode, Clock,
  ArrowRight, User, Copy, ExternalLink, RefreshCw, Truck, Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { paymentApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const GIG_STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700", desc: "Advance paid — gig ready to start" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700", desc: "Gig is underway" },
  arrived: { label: "Arrived", color: "bg-purple-100 text-purple-700", desc: "Arrived at destination, pending OTP" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700", desc: "Gig done & payment settled" },
};

const UpcomingGigDriver = () => {
  const { bidId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [gig, setGig] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [step, setStep] = useState("detail"); // detail | method | qr | done | otp
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [otpInput, setOtpInput] = useState("");

  const loadGig = useCallback(async () => {
    try {
      setFetchError(null);
      const res = await paymentApi.getGigStatus(bidId);
      if (res.success) {
        setGig(res.data);
        if (res.data.gigStatus === 'completed') setStep("done");
        else if (res.data.gigStatus === 'arrived') setStep("otp");
        else if (res.data.finalPaymentMethod === 'online' && res.data.finalPaymentLinkUrl) {
          setPaymentLink(res.data.finalPaymentLinkUrl);
          setStep("qr");
        } else if (res.data.finalPaymentMethod) {
          setStep("method");
        }
      }
    } catch (err) {
      setFetchError("Could not load gig details.");
    } finally {
      setLoading(false);
    }
  }, [bidId]);

  useEffect(() => { loadGig(); }, [loadGig]);

  // Poll for online payment completion
  useEffect(() => {
    if (step !== "qr") return;
    const interval = setInterval(async () => {
      try {
        const res = await paymentApi.verifyFinalPayment(bidId);
        if (res.success && res.data.gigStatus === 'completed') {
          setGig(res.data);
          setStep("done");
          clearInterval(interval);
          toast.success("Payment received! Gig marked complete.", { icon: "🎉" });
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [step, bidId]);

  const handleStartGig = async () => {
    setActionLoading(true);
    try {
      const res = await paymentApi.markGigStarted(bidId);
      if (res.success) {
        setGig(res.data);
        toast.success("Gig started!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to start gig");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkArrived = async () => {
    setActionLoading(true);
    try {
      const res = await paymentApi.markGigArrived(bidId);
      if (res.success) {
        setGig(res.data.bid);
        setStep("otp");
        toast.success("Marked as arrived! Ask customer for OTP.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to mark as arrived");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if(otpInput.length !== 4) return toast.error("Enter a valid 4-digit OTP");
    setActionLoading(true);
    try {
      const res = await paymentApi.verifyGigOtp(bidId, otpInput, null);
      if (res.success) {
        setGig(res.data);
        setStep("method"); // Move to payment method
        toast.success("OTP Verified! Proceed to collect payment.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to verify OTP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerateOtp = async () => {
    setActionLoading(true);
    try {
      const res = await paymentApi.regenerateOtp(bidId);
      if (res.success) {
        setGig(res.data.bid);
        toast.success("New OTP generated!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to regenerate OTP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectMethod = async (method) => {
    setActionLoading(true);
    try {
      const res = await paymentApi.selectPaymentMethod(bidId, method);
      if (res.success) {
        setGig(res.data.bid);
        setStep("method");
        if (method === 'online') {
          // Create the payment link immediately
          const linkRes = await paymentApi.createFinalPaymentLink(bidId);
          if (linkRes.success) {
            setPaymentLink(linkRes.data.paymentLinkUrl);
            setStep("qr");
          }
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to set payment method");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCashComplete = async () => {
    setActionLoading(true);
    try {
      const res = await paymentApi.completeCashPayment(bidId);
      if (res.success) {
        setGig(res.data);
        setStep("done");
        toast.success("Gig completed! Full earnings added to wallet.", { icon: "💰" });
      }
    } catch (err) {
      toast.error(err.message || "Failed to complete gig");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (fetchError || !gig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-zinc-500 font-bold text-center">{fetchError || "Gig not found"}</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (gig.paymentStatus === 'unpaid') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-zinc-50 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">Gig Not Active Yet</h2>
        <p className="text-zinc-500 font-bold text-center text-xs leading-relaxed">
          The customer has not completed the advance payment for this booking yet. 
          You can track and start this gig once the advance is paid.
        </p>
        <Button onClick={() => navigate(-1)} className="w-full h-11 rounded-xl bg-primary text-black font-bold uppercase text-xs">
          Go Back
        </Button>
      </div>
    );
  }

  const req = gig.requirement;
  const totalAmount = gig.amount || 0;
  const advanceAmount = gig.advanceAmount || Math.round(totalAmount * 0.5);
  const finalAmount = gig.finalAmount || (totalAmount - advanceAmount);
  const statusConfig = GIG_STATUS_CONFIG[gig.gigStatus] || GIG_STATUS_CONFIG.scheduled;

  // ── Step: Done ──
  if (step === "done") {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none" onClick={() => navigate("/driver/earnings")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic">Gig Complete</h1>
          </div>
        </header>
        <div className="p-6 flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-black">Gig Completed!</h2>
            <p className="text-sm text-zinc-500 font-bold mt-1">₹{totalAmount.toLocaleString('en-IN')} credited to your wallet</p>
          </div>
          <Card className="w-full border-none shadow-lg rounded-3xl overflow-hidden">
            <div className="bg-emerald-500 p-5 text-white flex justify-between">
              <div><p className="text-[10px] font-black uppercase opacity-80">Total Earned</p><p className="text-2xl font-black">₹{totalAmount.toLocaleString('en-IN')}</p></div>
              <div className="text-right"><p className="text-[10px] font-black uppercase opacity-80">Status</p><Badge className="bg-white/20 border-white/30 text-white font-black text-[10px] mt-1">Active Balance</Badge></div>
            </div>
          </Card>
          <Button className="w-full h-14 rounded-3xl bg-primary text-black font-black" onClick={() => navigate("/driver/earnings")}>
            View Wallet
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: QR / Online payment waiting ──
  if (step === "qr" && paymentLink) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic">Collect Payment</h1>
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Waiting for user to pay</p>
          </div>
        </header>
        <div className="p-5 space-y-5">
          <Card className="border-2 border-zinc-100 rounded-3xl overflow-hidden">
            <div className="bg-zinc-900 p-5 text-white text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount Due from User</p>
              <p className="text-4xl font-black text-primary mt-1">₹{finalAmount.toLocaleString('en-IN')}</p>
            </div>
            <CardContent className="p-5 flex flex-col items-center gap-4">
              {/* QR Code display using Google Charts API */}
              <div className="w-48 h-48 bg-white border-4 border-zinc-100 rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`}
                  alt="Payment QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-zinc-500 font-bold text-center">Ask the user to scan this QR code to pay ₹{finalAmount.toLocaleString('en-IN')}</p>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-10 text-xs font-black"
                  onClick={() => { navigator.clipboard.writeText(paymentLink); toast.success("Link copied!"); }}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-10 text-xs font-black"
                  onClick={() => window.open(paymentLink, '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open Link
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
            <RefreshCw className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-spin" />
            <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
              Waiting for payment… This page will auto-update once the user pays. Your wallet will reflect the full amount automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Verify OTP ──
  if (step === "otp") {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none" onClick={() => setStep("detail")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic">Delivery Verification</h1>
            <p className="text-[8px] font-black text-zinc-400 uppercase">Step 1 of 2</p>
          </div>
        </header>
        <div className="p-5 space-y-4 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-6 shadow-sm">
            <Key className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">Enter Delivery OTP</h2>
          <p className="text-xs text-zinc-500 font-normal mb-6">Ask the customer for the 4-digit OTP shown in their app.</p>
          
          <Input 
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="0000"
            className="h-16 text-center text-2xl font-medium tracking-widest rounded-2xl bg-white shadow-sm border-2 border-zinc-100 focus:border-purple-400 transition-colors"
          />

          <Button 
            disabled={actionLoading || otpInput.length !== 4}
            className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-wide mt-8 shadow-sm hover:bg-yellow-400 transition-all"
            onClick={handleVerifyOtp}
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Verify OTP"}
          </Button>

          <Button
            variant="ghost"
            disabled={actionLoading}
            className="w-full text-xs font-bold text-zinc-500 hover:text-zinc-700 mt-2"
            onClick={handleRegenerateOtp}
          >
            Resend / Regenerate OTP
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: Select payment method ──
  if (step === "method" && !gig.finalPaymentMethod && (gig.gigStatus === 'in_progress' || gig.gigStatus === 'arrived')) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none" onClick={() => setStep("detail")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic">Collect Final Payment</h1>
            <p className="text-[8px] font-black text-zinc-400 uppercase">₹{finalAmount.toLocaleString('en-IN')} remaining</p>
          </div>
        </header>
        <div className="p-5 space-y-4">
          <div className="text-center py-4">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">How is the user paying?</p>
            <p className="text-2xl font-black text-zinc-900 mt-1">₹{finalAmount.toLocaleString('en-IN')}</p>
          </div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Card
              className="border-2 border-zinc-100 rounded-3xl cursor-pointer hover:border-emerald-300 transition-all"
              onClick={() => !actionLoading && handleSelectMethod('cash')}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Banknote className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-zinc-900">Cash Payment</h3>
                  <p className="text-xs text-zinc-500 font-bold">User pays cash directly to you</p>
                </div>
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-300" /> : <ArrowRight className="w-5 h-5 text-zinc-300" />}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileTap={{ scale: 0.97 }}>
            <Card
              className="border-2 border-zinc-100 rounded-3xl cursor-pointer hover:border-primary transition-all"
              onClick={() => !actionLoading && handleSelectMethod('online')}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-zinc-900">Online / QR Payment</h3>
                  <p className="text-xs text-zinc-500 font-bold">Generate QR for user to scan</p>
                </div>
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-300" /> : <ArrowRight className="w-5 h-5 text-zinc-300" />}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Cash confirm screen ──
  if (step === "method" && gig.finalPaymentMethod === 'cash') {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic">Collect Cash</h1>
          </div>
        </header>
        <div className="p-5 space-y-5">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="text-xs text-zinc-400 font-black uppercase tracking-widest">Collect from user</p>
            <p className="text-4xl font-black text-zinc-900 mt-1">₹{finalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center">
            <p className="text-[11px] text-zinc-500 font-bold leading-relaxed">
              Once you collect the cash from the user, tap the button below to complete the gig. The full amount will be credited to your wallet.
            </p>
          </div>
          <Button
            disabled={actionLoading}
            className="w-full h-auto min-h-[3.5rem] py-3 px-4 rounded-xl bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-lg hover:bg-emerald-600 whitespace-normal leading-tight text-center flex items-center justify-center gap-2"
            onClick={handleCashComplete}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>Confirm Cash Collected & Complete Gig</span>
          </Button>
        </div>
      </div>
    );
  }

  // ── Main Detail View ──
  return (
    <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
      <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5 text-zinc-600" />
          </Button>
          <div>
            <h1 className="text-sm font-black text-zinc-900 uppercase tracking-widest italic">Upcoming Gig</h1>
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Active Booking</p>
          </div>
        </div>
        <Badge className={cn("font-black text-[9px] uppercase", statusConfig.color)}>
          {statusConfig.label}
        </Badge>
      </header>

      <div className="p-4 space-y-4">
        {/* Wallet Preview */}
        <Card className="bg-zinc-900 border-none rounded-none shadow-xl overflow-hidden text-white">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Advance Received</p>
                <p className="text-xl font-black text-primary">₹{advanceAmount.toLocaleString('en-IN')}</p>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[8px] font-black mt-1">PENDING</Badge>
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Remaining</p>
                <p className="text-xl font-black text-white">₹{finalAmount.toLocaleString('en-IN')}</p>
                <Badge className="bg-zinc-700 text-zinc-400 border-zinc-600 text-[8px] font-black mt-1">AFTER GIG</Badge>
              </div>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase">Total Earnings</p>
                <p className="text-sm font-black text-white">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-[9px] font-black text-zinc-600 uppercase">{statusConfig.desc}</p>
            </div>
          </CardContent>
        </Card>

        {/* Gig Details */}
        {req && (
          <Card className="border-2 border-zinc-100 rounded-none bg-white">
            <CardContent className="p-4 space-y-3">
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Gig Details</p>
              <div className="flex gap-3 items-start">
                <User className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Customer</p>
                  <p className="text-sm font-black text-zinc-900">{req.user?.name || "Customer"}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Pickup</p>
                  <p className="text-sm font-black text-zinc-900 line-clamp-2">{req.pickup?.address || "N/A"}</p>
                  {req.drops?.[0] && (
                    <>
                      <ArrowRight className="w-3 h-3 text-zinc-300 my-1" />
                      <p className="text-sm font-bold text-zinc-700 line-clamp-1">{req.drops[0].address}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Calendar className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Date & Time</p>
                  <p className="text-sm font-black text-zinc-900">
                    {req.date ? new Date(req.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                    {req.time && ` at ${req.time}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {gig.paymentStatus === 'advance_paid' && gig.gigStatus === 'scheduled' && (
          <Button
            disabled={actionLoading}
            className="w-full h-auto min-h-[3.5rem] py-3 rounded-xl bg-primary text-black font-black text-xs sm:text-sm uppercase tracking-wide px-4 whitespace-normal leading-tight text-center"
            onClick={handleStartGig}
          >
            <Truck className="w-5 h-5 mr-2 shrink-0" />
            {actionLoading ? "Starting..." : "Start Gig"}
          </Button>
        )}

        {gig.gigStatus === 'in_progress' && !gig.finalPaymentMethod && (
          <Button
            disabled={actionLoading}
            className="w-full h-auto min-h-[3.5rem] py-3 rounded-xl bg-purple-500 text-white font-black text-xs sm:text-sm uppercase tracking-wide px-4 whitespace-normal leading-tight text-center hover:bg-purple-600 shadow-sm transition-colors"
            onClick={handleMarkArrived}
          >
            <MapPin className="w-5 h-5 mr-2 shrink-0" />
            Mark Arrived at Destination
          </Button>
        )}

        {gig.gigStatus === 'arrived' && !gig.finalPaymentMethod && (
          <Button
            disabled={actionLoading}
            className="w-full h-auto min-h-[3.5rem] py-3 rounded-xl bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wide px-4 whitespace-normal leading-tight text-center hover:bg-emerald-600 shadow-sm transition-colors"
            onClick={() => setStep("otp")}
          >
            <Key className="w-5 h-5 mr-2 shrink-0" />
            Verify OTP & Complete
          </Button>
        )}

        {gig.paymentStatus !== 'advance_paid' && gig.paymentStatus !== 'completed' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-700 font-bold">Waiting for user to pay the advance. You'll be notified once confirmed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingGigDriver;
