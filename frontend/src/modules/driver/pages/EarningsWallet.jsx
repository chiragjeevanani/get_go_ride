import { useState } from "react";
import { 
  ChevronLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, 
  History, CreditCard, Plus, Banknote, Info, ChevronRight, TrendingUp,
  Download, Calendar, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const EarningsWallet = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const walletData = {
    balance: "₹14,500",
    pending: "₹2,200",
    totalWithdrawn: "₹45,000",
    history: [
      { id: 1, type: "credit", title: "Ride Payment", subtitle: "REQ-402 • Shiv Logistics", amount: "₹3,500", date: "Today, 2:30 PM", status: "Completed" },
      { id: 2, type: "debit", title: "Wallet Withdrawal", subtitle: "To Bank Account", amount: "₹5,000", date: "Yesterday", status: "Completed" },
      { id: 3, type: "credit", title: "Ride Payment", subtitle: "REQ-395 • House Shifting", amount: "₹8,200", date: "12 Oct", status: "Completed" },
      { id: 4, type: "credit", title: "Referral Bonus", subtitle: "New Driver Invite", amount: "₹500", date: "10 Oct", status: "Completed" },
    ]
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
      {/* Industrial Header */}
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
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none border border-zinc-100">
           <Download className="w-4 h-4 text-zinc-400" />
        </Button>
      </header>

      <div className="p-4 space-y-6">
        {/* Main Balance Card - Industrial/Sharp Aesthetic */}
        <section>
           <Card className="bg-zinc-900 border-none rounded-none overflow-hidden text-white relative shadow-2xl group border-l-4 border-primary">
              <CardContent className="p-6 space-y-8 relative z-10">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-none">Net Balance</span>
                       <h2 className="text-4xl font-black tracking-tighter tabular-nums text-primary">{walletData.balance}</h2>
                    </div>
                    <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center">
                       <Banknote className="w-6 h-6 text-primary" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                    <div className="space-y-1">
                       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Pending Clear</span>
                       <p className="text-sm font-black text-white">{walletData.pending}</p>
                    </div>
                    <div className="space-y-1 text-right">
                       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Lifetime Pay</span>
                       <p className="text-sm font-black text-emerald-500">{walletData.totalWithdrawn}</p>
                    </div>
                 </div>

                 <Button 
                    className="w-full h-12 bg-primary text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-none hover:bg-yellow-400 transition-all shadow-xl shadow-primary/10"
                 >
                    Request Payout
                 </Button>
              </CardContent>
              {/* Background graphic element */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary opacity-5 rounded-full blur-3xl"></div>
           </Card>
        </section>

        {/* Analytics Mini-Grid */}
        <section className="grid grid-cols-3 gap-2">
           {[
             { label: "Today", val: "₹1,2k", icon: Calendar },
             { label: "Growth", val: "+12%", icon: TrendingUp },
             { label: "Orders", val: "24", icon: History },
           ].map((stat, i) => (
             <Card key={i} className="rounded-none border-2 border-zinc-100 bg-white p-2.5 flex flex-col items-center gap-1">
                <stat.icon className="w-3.5 h-3.5 text-zinc-300" />
                <span className="text-xs font-black text-black leading-none">{stat.val}</span>
                <span className="text-[7px] font-black text-zinc-400 uppercase tracking-tighter">{stat.label}</span>
             </Card>
           ))}
        </section>

        {/* Transaction History Section */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                 <History className="w-3.5 h-3.5" /> Ledger
              </h3>
              <div className="flex gap-1 bg-zinc-100 p-1">
                 {["all", "credit", "debit"].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 h-6 text-[8px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab ? "bg-white text-black shadow-sm" : "text-zinc-400"
                      )}
                    >
                       {tab}
                    </button>
                 ))}
              </div>
           </div>

           <div className="space-y-2.5">
              {walletData.history
                .filter(item => activeTab === "all" || item.type === activeTab)
                .map((item) => (
                 <Card key={item.id} className="border-2 border-zinc-100 rounded-none shadow-none hover:border-primary/40 transition-all group bg-white">
                    <CardContent className="p-3.5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                             "w-10 h-10 flex items-center justify-center border-2",
                             item.type === "credit" ? "border-emerald-100 text-emerald-500 bg-emerald-50/30" : "border-red-100 text-red-500 bg-red-50/30"
                          )}>
                             {item.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tighter">{item.title}</h4>
                             <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">{item.subtitle}</p>
                          </div>
                       </div>
                       <div className="text-right space-y-1">
                          <span className={cn(
                             "text-[13px] font-black tabular-nums",
                             item.type === "credit" ? "text-emerald-500" : "text-zinc-900"
                          )}>
                             {item.type === "credit" ? "+" : "-"}{item.amount}
                          </span>
                          <p className="text-[7px] font-black text-zinc-300 uppercase tracking-tighter">{item.date}</p>
                       </div>
                    </CardContent>
                 </Card>
              ))}
           </div>
        </section>
      </div>

      {/* Info Banner */}
      <section className="px-4">
         <div className="bg-zinc-100 border-l-4 border-zinc-400 p-4 flex gap-4">
            <Info className="w-5 h-5 text-zinc-400 shrink-0" />
            <p className="text-[9px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">
               Settlements are processed every Tuesday. Ensure your bank details are verified in the profile section for instant payouts.
            </p>
         </div>
      </section>
    </div>
  );
};

export default EarningsWallet;
