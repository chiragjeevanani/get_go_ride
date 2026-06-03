import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2, MapPin, Calendar, Loader2, ChevronLeft,
  Banknote, QrCode, Clock, ArrowRight, Star, ShieldCheck,
  MessageSquare, AlertCircle, RefreshCw, Truck, Key, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { paymentApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAYMENT_STATUS_CONFIG = {
  unpaid: { label: "Awaiting Advance", color: "bg-red-100 text-red-700" },
  advance_paid: { label: "Advance Paid", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Fully Paid", color: "bg-emerald-100 text-emerald-700" },
};

const GIG_STATUS_CONFIG = {
  scheduled: { label: "Scheduled", desc: "Driver will start on the scheduled date" },
  in_progress: { label: "In Progress", desc: "Gig is currently underway" },
  arrived: { label: "Arrived", desc: "Driver arrived. Please provide OTP to confirm." },
  completed: { label: "Completed", desc: "Gig successfully completed" },
};

const UpcomingGigUser = () => {
  const { bidId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [gig, setGig] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);


  const loadGig = useCallback(async () => {
    try {
      setFetchError(null);
      const res = await paymentApi.getGigStatus(bidId);
      if (res.success) setGig(res.data);
    } catch (err) {
      setFetchError("Could not load gig details.");
    } finally {
      setLoading(false);
    }
  }, [bidId]);

  useEffect(() => { loadGig(); }, [loadGig]);

  const handleSubmitFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const res = await paymentApi.submitFeedback(bidId, { rating, comment });
      if (res.success) {
        setGig(res.data);
        toast.success("Feedback submitted!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Poll for gig status updates (e.g. driver arriving, or gig completed)
  useEffect(() => {
    if (!gig || gig.gigStatus === 'completed') return;
    const interval = setInterval(async () => {
      try {
        const res = await paymentApi.getGigStatus(bidId);
        if (res.success) {
          setGig(res.data);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [gig?.gigStatus, bidId]);

  // Poll when driver has selected online and is showing QR
  useEffect(() => {
    if (!gig || gig.gigStatus === 'completed' || gig.finalPaymentMethod !== 'online') return;
    const interval = setInterval(async () => {
      try {
        const res = await paymentApi.verifyFinalPayment(bidId);
        if (res.success) {
          setGig(res.data);
          if (res.data.gigStatus === 'completed') {
            clearInterval(interval);
            toast.success("Gig completed! Thank you.", { icon: "🎉" });
          }
        }
      } catch {}
    }, 6000);
    return () => clearInterval(interval);
  }, [gig?.finalPaymentMethod, gig?.gigStatus, bidId]);

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
        <Button onClick={() => navigate("/user/requests")} variant="outline">My Requests</Button>
      </div>
    );
  }

  const req = gig.requirement;
  const vendorData = gig.vendor;
  const totalAmount = gig.amount || 0;
  const advanceAmount = gig.advanceAmount || Math.round(totalAmount * 0.5);
  const finalAmount = gig.finalAmount || (totalAmount - advanceAmount);
  const paymentStatusConfig = PAYMENT_STATUS_CONFIG[gig.paymentStatus] || PAYMENT_STATUS_CONFIG.unpaid;
  const gigStatusConfig = GIG_STATUS_CONFIG[gig.gigStatus] || GIG_STATUS_CONFIG.scheduled;

  // ── Gig Completed ──
  if (gig.gigStatus === 'completed') {
    return (
      <div className="min-h-screen bg-zinc-50 pb-10">
        <div className="max-w-md mx-auto p-4 space-y-6">
          <header className="text-center space-y-4 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black text-black">Gig Complete!</h1>
              <p className="text-sm text-zinc-500 font-bold mt-1 uppercase tracking-widest">
                {gig.finalPaymentMethod === 'cash' ? 'Paid via Cash' : 'Paid via Online'}
              </p>
            </div>
          </header>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <div className="bg-emerald-500 p-6 text-white">
              <div className="flex justify-between">
                <div><p className="text-[10px] font-black uppercase opacity-80">Total Paid</p><p className="text-3xl font-black">₹{totalAmount.toLocaleString('en-IN')}</p></div>
                <Badge className="bg-white/20 border-white/30 text-white font-black text-[10px] self-start">COMPLETED</Badge>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-zinc-50">
                  <AvatarImage src={vendorData?.profileImage} />
                  <AvatarFallback>{(vendorData?.name || "DR").substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-black text-zinc-900">{vendorData?.name || "Driver"}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-zinc-500">{vendorData?.rating || "4.8"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!gig.feedback && (
            <Card className="border-2 border-zinc-100 rounded-3xl p-6 bg-white shadow-sm">
              <h3 className="text-sm font-black text-center uppercase tracking-widest mb-4">Rate Your Driver</h3>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={cn("w-8 h-8 cursor-pointer transition-colors", rating >= star ? "text-amber-400 fill-amber-400" : "text-zinc-200")}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <input 
                placeholder="Optional feedback..."
                className="w-full text-sm p-3 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-amber-400 transition-colors mb-4"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <Button disabled={feedbackLoading} className="w-full h-12 rounded-xl bg-amber-400 text-black font-black" onClick={handleSubmitFeedback}>
                {feedbackLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Feedback
              </Button>
            </Card>
          )}

          {gig.feedback && (
            <Card className="border-2 border-amber-100 rounded-3xl p-5 bg-amber-50 shadow-sm text-center">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Your Rating</p>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(gig.feedback.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
              </div>
              {gig.feedback.comment && <p className="text-xs font-bold text-amber-700 italic">"{gig.feedback.comment}"</p>}
            </Card>
          )}

          <Button className="w-full h-14 rounded-3xl bg-primary text-black font-black" onClick={() => navigate("/user/requests")}>
            Back to My Requests
          </Button>
        </div>
      </div>
    );
  }

  // ── Gig Active ──
  return (
    <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-black text-zinc-900">Upcoming Gig</h1>
            <p className="text-[9px] text-zinc-400 font-bold uppercase">{gigStatusConfig.desc}</p>
          </div>
        </div>
        <Badge className={cn("text-[9px] font-black uppercase", paymentStatusConfig.color)}>
          {paymentStatusConfig.label}
        </Badge>
      </header>

      <div className="p-4 space-y-4">
        {/* Driver Card */}
        <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-zinc-100">
                <AvatarImage src={vendorData?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(vendorData?.name || "DR")}`} />
                <AvatarFallback>{(vendorData?.name || "DR").substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-zinc-900">{vendorData?.name || "Your Driver"}</h3>
                  {vendorData?.isVerified && <ShieldCheck className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-zinc-500">{vendorData?.rating || "4.8"}</span>
                  <span className="text-[10px] text-zinc-300">•</span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">{vendorData?.vehicleType}</span>
                </div>
              </div>
              {req && (
                <Button
                  size="icon"
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => {
                    const reqId = req._id?.toString();
                    const vId = vendorData?._id?.toString();
                    if (reqId && vId) navigate(`/user/chat/${reqId}/${vId}`);
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Trip Tracking Stepper */}
        <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-5 space-y-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Live Trip Tracking</p>
            
            <div className="relative space-y-6">
              {/* Dynamic Connection Line */}
              <div className="absolute left-[10px] top-2 bottom-2 w-0.5 bg-zinc-100 -translate-x-1/2">
                <div 
                  className="bg-primary w-full origin-top transition-all duration-500"
                  style={{
                    height: 
                      gig.gigStatus === 'scheduled' ? '0%' :
                      gig.gigStatus === 'in_progress' ? '33%' :
                      gig.gigStatus === 'arrived' ? '66%' :
                      gig.gigStatus === 'completed' ? '100%' : '0%'
                  }}
                />
              </div>

              {/* Step 1: Scheduled */}
              <div className="relative flex gap-4 items-start pl-7">
                <div className={cn(
                  "absolute left-[10px] top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 -translate-x-1/2",
                  (gig.gigStatus === 'scheduled' || gig.gigStatus === 'in_progress' || gig.gigStatus === 'arrived' || gig.gigStatus === 'completed')
                    ? "bg-primary border-primary text-black shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                    : "bg-white border-zinc-200 text-zinc-400"
                )}>
                  <Calendar className="w-2.5 h-2.5" />
                </div>
                <div>
                  <h4 className={cn(
                    "text-xs font-black leading-none",
                    (gig.gigStatus === 'scheduled' || gig.gigStatus === 'in_progress' || gig.gigStatus === 'arrived' || gig.gigStatus === 'completed') ? "text-zinc-900" : "text-zinc-400"
                  )}>Gig Scheduled</h4>
                  <p className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">Driver is assigned & confirmed</p>
                </div>
              </div>

              {/* Step 2: Underway */}
              <div className="relative flex gap-4 items-start pl-7">
                <div className={cn(
                  "absolute left-[10px] top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 -translate-x-1/2",
                  (gig.gigStatus === 'in_progress' || gig.gigStatus === 'arrived' || gig.gigStatus === 'completed')
                    ? "bg-primary border-primary text-black shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                    : "bg-white border-zinc-200 text-zinc-400"
                )}>
                  <Truck className="w-2.5 h-2.5" />
                </div>
                <div>
                  <h4 className={cn(
                    "text-xs font-black leading-none",
                    (gig.gigStatus === 'in_progress' || gig.gigStatus === 'arrived' || gig.gigStatus === 'completed') ? "text-zinc-900" : "text-zinc-400"
                  )}>Gig Underway</h4>
                  <p className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">Driver is currently on route</p>
                </div>
              </div>

              {/* Step 3: Arrived */}
              <div className="relative flex gap-4 items-start pl-7">
                <div className={cn(
                  "absolute left-[10px] top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 -translate-x-1/2",
                  (gig.gigStatus === 'arrived' || gig.gigStatus === 'completed')
                    ? "bg-primary border-primary text-black shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                    : "bg-white border-zinc-200 text-zinc-400"
                )}>
                  <MapPin className="w-2.5 h-2.5" />
                </div>
                <div>
                  <h4 className={cn(
                    "text-xs font-black leading-none",
                    (gig.gigStatus === 'arrived' || gig.gigStatus === 'completed') ? "text-zinc-900" : "text-zinc-400"
                  )}>Driver Arrived</h4>
                  <p className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">Share the Delivery OTP with driver</p>
                </div>
              </div>

              {/* Step 4: Completed */}
              <div className="relative flex gap-4 items-start pl-7">
                <div className={cn(
                  "absolute left-[10px] top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 -translate-x-1/2",
                  gig.gigStatus === 'completed'
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    : "bg-white border-zinc-200 text-zinc-400"
                )}>
                  <CheckCircle2 className="w-2.5 h-2.5" />
                </div>
                <div>
                  <h4 className={cn(
                    "text-xs font-black leading-none",
                    gig.gigStatus === 'completed' ? "text-zinc-900" : "text-zinc-400"
                  )}>Completed</h4>
                  <p className="text-[9px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">Delivery verified & completed</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card className="border-2 border-zinc-100 rounded-3xl p-5 bg-white space-y-4">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Summary</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-700">Total Amount</span>
              <span className="text-sm font-black text-zinc-900">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-zinc-700">Advance Paid (50%)</span>
              </div>
              <span className="text-sm font-black text-emerald-600">₹{advanceAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-500">Remaining (50%)</span>
              </div>
              <span className="text-sm font-black text-zinc-700">₹{finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        {/* OTP Display when arrived */}
        {gig.gigStatus === 'arrived' && (
          <Card className="border-2 border-purple-100 rounded-3xl p-5 bg-purple-50 text-center relative overflow-hidden">
            <Key className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Delivery OTP</p>
            {gig.completionOtp ? (
              <>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <p className="text-4xl font-black text-purple-700 tracking-widest">{gig.completionOtp}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full text-purple-600 hover:bg-purple-100 hover:text-purple-800"
                    onClick={() => {
                      navigator.clipboard.writeText(gig.completionOtp);
                      toast.success("OTP copied!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-purple-600 font-bold mt-2">Share this code with the driver to confirm delivery</p>
              </>
            ) : (
              <div className="py-2 space-y-1">
                <p className="text-xs text-purple-600 font-bold">Verification Pending</p>
                <p className="text-[10px] text-zinc-500 font-bold">Ask the driver to generate/verify the delivery OTP from their app.</p>
              </div>
            )}
          </Card>
        )}

        {/* Final payment method info (when driver has chosen) */}
        {gig.finalPaymentMethod === 'cash' && gig.gigStatus === 'in_progress' && (
          <Card className="border-2 border-emerald-100 rounded-3xl p-5 bg-emerald-50">
            <div className="flex gap-3 items-start">
              <Banknote className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-[11px] font-black text-emerald-700 uppercase">Pay Cash to Driver</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">₹{finalAmount.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">Hand over cash once gig is complete.</p>
              </div>
            </div>
          </Card>
        )}

        {gig.finalPaymentMethod === 'online' && gig.finalPaymentLinkUrl && gig.gigStatus !== 'completed' && (
          <Card className="border-2 border-zinc-100 rounded-3xl overflow-hidden bg-white">
            <div className="bg-zinc-900 p-4 text-white text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Scan to Pay</p>
              <p className="text-3xl font-black text-primary mt-1">₹{finalAmount.toLocaleString('en-IN')}</p>
            </div>
            <CardContent className="p-5 flex flex-col items-center gap-4">
              <div className="w-44 h-44 bg-white border-4 border-zinc-100 rounded-2xl overflow-hidden">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(gig.finalPaymentLinkUrl)}`}
                  alt="Payment QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <Button
                className="w-full h-12 rounded-2xl bg-primary text-black font-black"
                onClick={() => window.open(gig.finalPaymentLinkUrl, '_blank')}
              >
                <QrCode className="w-4 h-4 mr-2" /> Open Payment Page
              </Button>
              <div className="flex items-center gap-2 text-zinc-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <p className="text-[10px] font-bold uppercase">Checking payment status…</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gig Details */}
        {req && (
          <Card className="border-2 border-zinc-100 rounded-3xl p-5 bg-white space-y-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gig Details</p>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Service</p>
                <p className="text-sm font-black text-zinc-900">{(req.serviceType || "Transport").replace('-', ' ').toUpperCase()}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Route</p>
                <p className="text-sm font-black text-zinc-900 line-clamp-1">{req.pickup?.address}</p>
                <ArrowRight className="w-3 h-3 text-zinc-300 my-0.5" />
                <p className="text-sm font-bold text-zinc-600 line-clamp-1">{req.drops?.[0]?.address}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Date</p>
                <p className="text-sm font-black text-zinc-900">
                  {req.date ? new Date(req.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  {req.time && ` at ${req.time}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Status info */}
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
            {gig.gigStatus === 'scheduled'
              ? "Your advance is secured. The driver will start on the scheduled date."
              : gig.gigStatus === 'in_progress'
              ? "Your gig is in progress. Prepare to pay the remaining amount."
              : "Gig completed. Thank you for using GetGoLoad!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpcomingGigUser;
