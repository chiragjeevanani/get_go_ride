import { useState, useEffect } from "react";
import { 
  ChevronLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, 
  History, Banknote, Info, TrendingUp, Download, Calendar, 
  Filter, Loader2, AlertCircle, Clock, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { vendorApi } from "@/lib/api";
import { toast } from "sonner";

const TX_TYPE_CONFIG = {
  credit: { label: "Credit", color: "text-emerald-500", bg: "border-emerald-100 bg-emerald-50/30", icon: ArrowDownLeft },
  debit: { label: "Debit", color: "text-red-500", bg: "border-red-100 bg-red-50/30", icon: ArrowUpRight },
  advance_hold: { label: "Advance Hold", color: "text-amber-500", bg: "border-amber-100 bg-amber-50/30", icon: Clock },
  advance_release: { label: "Earnings Released", color: "text-emerald-500", bg: "border-emerald-100 bg-emerald-50/30", icon: ArrowDownLeft },
  withdrawal: { label: "Withdrawal", color: "text-zinc-500", bg: "border-zinc-100 bg-zinc-50/30", icon: ArrowUpRight },
};

const EarningsWallet = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true);
        const res = await vendorApi.getWallet();
        if (res.success) setWallet(res.data);
        else setError("Failed to load wallet");
      } catch (err) {
        setError("Could not load wallet data");
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const filteredTxns = wallet?.transactions
    ? wallet.transactions
        .filter(t => activeTab === "all" || t.type === activeTab)
        .slice()
        .reverse() // newest first
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-zinc-500 font-bold">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
      </div>
    );
  }

  const activeBalance = wallet?.activeBalance || 0;
  const pendingBalance = wallet?.pendingBalance || 0;
  const totalEarnings = wallet?.transactions
    ?.filter(t => t.type === 'advance_release')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5 text-zinc-600" />
          </Button>
          <div>
            <h1 className="text-sm font-black text-zinc-900 tracking-widest uppercase italic">Earnings Hub</h1>
            <p className="text-[8px] font-black text-zinc-400 tracking-widest uppercase mt-0.5">Financial Console</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none border border-zinc-100" onClick={() => navigate("/driver/withdraw")}>
          <Banknote className="w-4 h-4 text-zinc-400" />
        </Button>
      </header>

      <div className="p-4 space-y-6">
        {/* Main Balance Card */}
        <section>
          <Card className="bg-zinc-900 border-none rounded-none overflow-hidden text-white shadow-2xl border-l-4 border-primary">
            <CardContent className="p-6 space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Active Balance</span>
                  <h2 className="text-4xl font-black tracking-tighter tabular-nums text-primary">
                    ₹{activeBalance.toLocaleString('en-IN')}
                  </h2>
                </div>
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-5">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                  <p className="text-sm font-black text-amber-400">
                    ₹{pendingBalance.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[7px] text-zinc-600 font-bold uppercase">Released after gig</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Lifetime Pay</span>
                  <p className="text-sm font-black text-emerald-500">₹{totalEarnings.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 h-10 bg-primary text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-none hover:bg-yellow-400"
                  onClick={() => navigate("/driver/withdraw")}
                >
                  Request Payout
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-10 border-white/20 text-white font-black text-[10px] uppercase tracking-[0.15em] rounded-none hover:bg-white/10 hover:text-white bg-transparent"
                  onClick={() => navigate("/driver/bank-details")}
                >
                  <Building2 className="w-3.5 h-3.5 mr-1" /> Bank Details
                </Button>
              </div>
            </CardContent>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary opacity-5 rounded-full blur-3xl"></div>
          </Card>
        </section>

        {/* Analytics Mini-Grid */}
        <section className="grid grid-cols-3 gap-2">
          {[
            { label: "Active", val: `₹${(activeBalance / 1000).toFixed(1)}k`, icon: WalletIcon },
            { label: "Pending", val: `₹${(pendingBalance / 1000).toFixed(1)}k`, icon: Clock },
            { label: "Gigs", val: wallet?.transactions?.filter(t => t.type === 'advance_release').length || 0, icon: TrendingUp },
          ].map((stat, i) => (
            <Card key={i} className="rounded-none border-2 border-zinc-100 bg-white p-2.5 flex flex-col items-center gap-1">
              <stat.icon className="w-3.5 h-3.5 text-zinc-300" />
              <span className="text-xs font-black text-black leading-none">{stat.val}</span>
              <span className="text-[7px] font-black text-zinc-400 uppercase tracking-tighter">{stat.label}</span>
            </Card>
          ))}
        </section>

        {/* Pending Balance Info */}
        {pendingBalance > 0 && (
          <section>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 flex gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-tight">Pending Balance: ₹{pendingBalance.toLocaleString('en-IN')}</p>
                <p className="text-[9px] font-bold text-amber-600 leading-relaxed mt-0.5">
                  This is the advance received from booked gigs. It becomes active once you complete the gig.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Transaction History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2 italic">
              <History className="w-3.5 h-3.5" /> Ledger
            </h3>
            <div className="flex gap-1 bg-zinc-100 p-1 overflow-x-auto">
              {["all", "advance_hold", "advance_release", "withdrawal"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-2 h-6 text-[7px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                    activeTab === tab ? "bg-white text-black shadow-sm" : "text-zinc-400"
                  )}
                >
                  {tab === "all" ? "All" : tab === "advance_hold" ? "Holds" : tab === "advance_release" ? "Earnings" : "Withdrawal"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredTxns.length === 0 ? (
              <div className="text-center py-10">
                <History className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">No transactions yet</p>
              </div>
            ) : (
              filteredTxns.map((item, idx) => {
                const config = TX_TYPE_CONFIG[item.type] || TX_TYPE_CONFIG.credit;
                const Icon = config.icon;
                const isPositive = ['credit', 'advance_hold', 'advance_release'].includes(item.type);
                return (
                  <Card key={idx} className="border-2 border-zinc-100 rounded-none shadow-none hover:border-primary/40 transition-all bg-white">
                    <CardContent className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 flex items-center justify-center border-2", config.bg)}>
                          <Icon className={cn("w-5 h-5", config.color)} />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tighter">{config.label}</h4>
                          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1 line-clamp-1">
                            {item.description || (item.gigId ? `Gig: ${item.gigId.slice(-6)}` : '')}
                          </p>
                          <p className="text-[7px] font-bold text-zinc-300 uppercase mt-0.5">
                            {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                          </p>
                        </div>
                      </div>
                      <span className={cn("text-[13px] font-black tabular-nums", isPositive ? "text-emerald-500" : "text-zinc-900")}>
                        {isPositive ? "+" : "-"}₹{(item.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Info Banner */}
      <section className="px-4 pb-4">
        <div className="bg-zinc-100 border-l-4 border-zinc-400 p-4 flex gap-4">
          <Info className="w-5 h-5 text-zinc-400 shrink-0" />
          <p className="text-[9px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">
            Active balance is withdrawable. Pending balance is released once you complete the gig. Add bank details before requesting payout.
          </p>
        </div>
      </section>
    </div>
  );
};

export default EarningsWallet;
