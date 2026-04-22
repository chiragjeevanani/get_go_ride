import { useState } from "react";
import { 
  ChevronLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, 
  History, CreditCard, Plus, Gift, Info, ChevronRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Wallet = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const walletData = {
    balance: "₹1,250",
    coins: "450",
    history: [
      { id: 1, type: "debit", title: "Booking Advance", subtitle: "REQ-402", amount: "₹450", date: "Today, 2:30 PM", status: "Completed" },
      { id: 2, type: "credit", title: "Refund Processed", subtitle: "REQ-398", amount: "₹120", date: "Yesterday", status: "Completed" },
      { id: 3, type: "debit", title: "Coin Purchase", subtitle: "Package - Mini", amount: "₹200", date: "12 Oct", status: "Completed" },
      { id: 4, type: "credit", title: "Referral Bonus", subtitle: "Shiv Logistics", amount: "50 Coins", date: "10 Oct", isCoin: true, status: "Completed" },
    ]
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-lg font-black text-zinc-900 tracking-tight leading-none italic uppercase">My Wallet</h1>
          <p className="text-[10px] font-bold text-zinc-400 tracking-tight mt-1 uppercase">Payments & Coins</p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Balance Card - High Density Design */}
        <section>
           <Card className="bg-zinc-900 border-none rounded-[2rem] overflow-hidden text-white relative shadow-2xl shadow-zinc-200 group">
              <CardContent className="p-6 space-y-6 relative z-10">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Available Balance</span>
                       <h2 className="text-4xl font-black tracking-tighter tabular-nums">{walletData.balance}</h2>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/5">
                       <WalletIcon className="w-6 h-6 text-primary" />
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="flex-1 space-y-1 p-3 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Safar Coins</span>
                       <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                          <span className="text-base font-black text-white">{walletData.coins}</span>
                       </div>
                    </div>
                    <Button 
                      className="flex-1 h-auto py-3 bg-primary text-zinc-900 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-primary/20"
                    >
                       Add Money
                    </Button>
                 </div>
              </CardContent>
              {/* Background gradient element */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>
           </Card>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3">
           <Card className="border-2 border-zinc-50 rounded-2xl p-4 bg-white hover:border-primary/20 transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                 <Plus className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
              </div>
              <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Buy Coins</h4>
              <p className="text-[9px] font-bold text-zinc-400 mt-1">Get discounts on rides</p>
           </Card>
           <Card className="border-2 border-zinc-50 rounded-2xl p-4 bg-white hover:border-primary/20 transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                 <CreditCard className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
              </div>
              <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Cards</h4>
              <p className="text-[9px] font-bold text-zinc-400 mt-1">Manage saved cards</p>
           </Card>
        </section>

        {/* Transaction History */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 italic">
                 <History className="w-4 h-4" /> History
              </h3>
              <TabsList className="bg-zinc-100 p-1 rounded-xl h-8">
                 {["all", "debit", "credit"].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"
                      )}
                    >
                       {tab}
                    </button>
                 ))}
              </TabsList>
           </div>

           <div className="space-y-3">
              {walletData.history
                .filter(item => activeTab === "all" || item.type === activeTab)
                .map((item) => (
                 <Card key={item.id} className="border border-zinc-100 shadow-sm rounded-2xl overflow-hidden hover:border-primary/20 transition-all">
                    <CardContent className="p-4 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center",
                             item.type === "credit" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                          )}>
                             {item.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div>
                             <h4 className="text-xs font-black text-zinc-900 tracking-tight">{item.title}</h4>
                             <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.subtitle}</p>
                          </div>
                       </div>
                       <div className="text-right space-y-0.5">
                          <span className={cn(
                             "text-sm font-black tabular-nums",
                             item.type === "credit" ? "text-emerald-500" : "text-zinc-900"
                          )}>
                             {item.type === "credit" ? "+" : "-"}{item.amount}
                          </span>
                          <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">{item.date}</p>
                       </div>
                    </CardContent>
                 </Card>
              ))}
           </div>
        </section>
      </div>

      {/* Premium Offer Banner */}
      <section className="px-4 mt-6">
         <Card className="bg-primary/10 border-2 border-dashed border-primary/40 p-4 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10 space-y-2">
               <Badge className="bg-primary text-zinc-900 border-none font-black text-[8px] tracking-widest">LIMITED OFFER</Badge>
               <h4 className="text-sm font-black text-zinc-900 leading-tight">Get 10% Extra Coins on your next top-up!</h4>
               <Button variant="link" className="p-0 h-auto text-[10px] font-black text-zinc-900 uppercase tracking-widest gap-2">
                  Learn More <ChevronRight className="w-3 h-3" />
               </Button>
            </div>
            <Gift className="absolute -right-4 -bottom-4 w-20 h-20 text-primary opacity-20 rotate-[-15deg] group-hover:rotate-0 transition-transform" />
         </Card>
      </section>
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
