import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Banknote, AlertCircle, CheckCircle2, Clock,
  XCircle, ArrowUpRight, Building2, Loader2, Plus, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { vendorApi, withdrawalApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
};

const WithdrawalPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState("");
  const [view, setView] = useState("main"); // main | confirm

  useEffect(() => {
    const load = async () => {
      try {
        const [walletRes, bankRes, withdrawRes] = await Promise.all([
          vendorApi.getWallet(),
          withdrawalApi.getBankDetails(),
          withdrawalApi.getMyWithdrawals(),
        ]);
        if (walletRes.success) setWallet(walletRes.data);
        if (bankRes.success) setBankDetails(bankRes.data?.accountNumber ? bankRes.data : null);
        if (withdrawRes.success) setWithdrawals(withdrawRes.data || []);
      } catch (err) {
        toast.error("Failed to load withdrawal data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeBalance = wallet?.activeBalance || 0;
  const hasPendingRequest = withdrawals.some(w => w.status === 'pending');

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (!amt || amt < 100) { toast.error("Minimum withdrawal is ₹100"); return; }
    if (amt > activeBalance) { toast.error("Amount exceeds active balance"); return; }

    setSubmitting(true);
    try {
      const res = await withdrawalApi.requestWithdrawal(amt);
      if (res.success) {
        toast.success("Withdrawal request submitted!", { icon: "🏦" });
        setWithdrawals(prev => [res.data, ...prev]);
        setAmount("");
        setView("main");
        // Refresh wallet
        const walletRes = await vendorApi.getWallet();
        if (walletRes.success) setWallet(walletRes.data);
      } else {
        toast.error(res.message || "Failed to submit request");
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
      <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-sm font-black text-zinc-900 tracking-widest uppercase italic">Withdraw</h1>
          <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Payout Request</p>
        </div>
      </header>

      <div className="p-4 space-y-5">
        {/* Balance Card */}
        <Card className="bg-zinc-900 border-none rounded-none text-white shadow-xl border-l-4 border-primary">
          <CardContent className="p-5">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Available for Withdrawal</p>
            <p className="text-4xl font-black text-primary mt-1">₹{activeBalance.toLocaleString('en-IN')}</p>
            {wallet?.pendingBalance > 0 && (
              <p className="text-[10px] text-zinc-500 font-bold mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                ₹{wallet.pendingBalance.toLocaleString('en-IN')} pending (gig completion required)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bank Details Check */}
        {!bankDetails ? (
          <Card className="border-2 border-red-100 rounded-none bg-red-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[11px] font-black text-red-700 uppercase">Bank Details Required</p>
                <p className="text-[10px] text-red-500 font-bold mt-1">Add your bank account before requesting a withdrawal.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-zinc-100 rounded-none bg-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 rounded-none flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Bank Account</p>
                  <p className="text-sm font-black text-zinc-900">{bankDetails.bankName}</p>
                  <p className="text-[10px] text-zinc-400 font-bold font-mono">••••{bankDetails.accountNumber.slice(-4)}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] font-black text-primary" onClick={() => navigate("/driver/bank-details")}>
                Edit
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pending request warning */}
        {hasPendingRequest && (
          <div className="bg-amber-50 border border-amber-200 rounded-none p-4 flex gap-3">
            <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 font-bold">You have a pending withdrawal request. Wait for admin to process it before requesting another.</p>
          </div>
        )}

        {/* Withdrawal Form */}
        {!hasPendingRequest && bankDetails && activeBalance >= 100 && (
          <Card className="border-2 border-zinc-100 rounded-none bg-white">
            <CardContent className="p-5 space-y-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">New Withdrawal Request</p>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-sm">₹</span>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    min="100"
                    max={activeBalance}
                    placeholder={`Max ₹${activeBalance.toLocaleString('en-IN')}`}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="pl-7 rounded-none border-2 border-zinc-100 font-black text-zinc-900 focus:border-primary text-lg h-12"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[500, 1000, 2000, 5000].filter(v => v <= activeBalance).map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className={cn(
                        "px-3 h-7 text-[10px] font-black border-2 uppercase transition-all",
                        amount === String(v) ? "border-primary bg-primary text-black" : "border-zinc-100 text-zinc-500 hover:border-zinc-300"
                      )}
                    >
                      ₹{v.toLocaleString('en-IN')}
                    </button>
                  ))}
                  <button
                    onClick={() => setAmount(String(activeBalance))}
                    className={cn(
                      "px-3 h-7 text-[10px] font-black border-2 uppercase transition-all",
                      amount === String(activeBalance) ? "border-primary bg-primary text-black" : "border-zinc-100 text-zinc-500 hover:border-zinc-300"
                    )}
                  >
                    Max
                  </button>
                </div>
              </div>

              <Button
                disabled={submitting || !amount || Number(amount) < 100}
                className="w-full h-12 rounded-none bg-primary text-black font-black text-sm uppercase tracking-widest"
                onClick={handleSubmit}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowUpRight className="w-5 h-5 mr-2" />}
                {submitting ? "Submitting..." : `Request ₹${Number(amount || 0).toLocaleString('en-IN')} Withdrawal`}
              </Button>
            </CardContent>
          </Card>
        )}

        {!bankDetails && (
          <Button
            className="w-full h-12 rounded-none bg-primary text-black font-black text-sm uppercase tracking-widest"
            onClick={() => navigate("/driver/bank-details")}
          >
            <Plus className="w-5 h-5 mr-2" /> Add Bank Details
          </Button>
        )}

        {/* Withdrawal History */}
        {withdrawals.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Withdrawal History</h3>
            </div>
            <div className="space-y-2">
              {withdrawals.map((w) => {
                const sc = STATUS_CONFIG[w.status] || STATUS_CONFIG.pending;
                const Icon = sc.icon;
                return (
                  <Card key={w._id} className="border-2 border-zinc-100 rounded-none bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center">
                          <Banknote className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900">₹{(w.amount || 0).toLocaleString('en-IN')}</p>
                          <p className="text-[9px] text-zinc-400 font-bold">
                            {w.createdAt ? new Date(w.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                          </p>
                          {w.transactionRef && (
                            <p className="text-[9px] text-zinc-400 font-mono">UTR: {w.transactionRef}</p>
                          )}
                          {w.adminNote && (
                            <p className="text-[9px] text-red-400 font-bold">{w.adminNote}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={cn("font-black text-[9px] uppercase flex items-center gap-1", sc.color)}>
                        <Icon className="w-3 h-3" /> {sc.label}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default WithdrawalPage;
