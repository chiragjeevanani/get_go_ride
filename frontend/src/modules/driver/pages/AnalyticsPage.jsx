import React, { useState, useEffect } from "react";
import { 
  BarChart2, TrendingUp, Users, Target, 
  ArrowUpRight, ArrowDownRight, Zap, ChevronLeft, Calendar, 
  ChevronDown, Activity, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "../components/StatCard";
import { cn } from "@/lib/utils";
import { useDriverState } from "../hooks/useDriverState";
import { vendorApi } from "@/lib/api";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await vendorApi.getAnalytics();
        setAnalytics(res.data || res);
      } catch (err) {
        console.error("Failed to fetch live analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Compiling live intelligence...</p>
      </div>
    );
  }

  // Active state data with robust backend fallbacks
  const stats = analytics?.stats || { total: 0, accepted: 0, rejected: 0, totalBids: 0, earnings: 0 };
  const weeklyData = analytics?.weeklyData || [
    { day: "M", value: 0, leads: 0 },
    { day: "T", value: 0, leads: 0 },
    { day: "W", value: 0, leads: 0 },
    { day: "T", value: 0, leads: 0 },
    { day: "F", value: 0, leads: 0 },
    { day: "S", value: 0, leads: 0 },
    { day: "S", value: 0, leads: 0 },
  ];
  const funnel = analytics?.funnel || { received: 0, viewed: 0, offers: 0, finalized: 0 };

  const conversionRate = stats.totalBids > 0 ? Math.round((stats.accepted / stats.totalBids) * 100) : 0;

  const formatEarnings = (val) => {
    if (val >= 1000) {
      return `₹${(val / 1000).toFixed(1)}k`;
    }
    return `₹${val}`;
  };

  const primaryStats = [
    { label: "Total Leads", value: stats.total.toString(), icon: Zap, trend: "+12%", color: "bg-blue-50 text-blue-500" },
    { label: "Accepted", value: stats.accepted.toString(), icon: Target, trend: "+8%", color: "bg-emerald-50 text-emerald-500" },
    { label: "Conversion", value: `${conversionRate}%`, icon: TrendingUp, trend: "+5%", color: "bg-orange-50 text-orange-500" },
    { label: "Earnings", value: formatEarnings(stats.earnings), icon: BarChart2, trend: "+15%", color: "bg-primary/10 text-primary" },
  ];

  const funnelSteps = [
    { label: "Leads Received", value: funnel.received.toString(), width: "100%", color: "bg-zinc-100 text-zinc-900" },
    { label: "Leads Viewed", value: funnel.viewed.toString(), width: "85%", color: "bg-zinc-200 text-zinc-900" },
    { label: "Offers Made", value: funnel.offers.toString(), width: "70%", color: "bg-zinc-800 text-white" },
    { label: "Finalized", value: funnel.finalized.toString(), width: "65%", color: "bg-zinc-950 text-white" }
  ];

  const todayDayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const indexToDayMap = { 1: 'M', 2: 'T', 3: 'W', 4: 'T', 5: 'F', 6: 'S', 0: 'S' };
  const todayLetter = indexToDayMap[todayDayIndex] || 'F';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 pb-24 pt-2 px-4"
    >
      {/* Sharp Header */}
      <header className="flex justify-between items-center -mx-4 px-4 py-3 border-b-2 border-yellow-400 sticky top-0 bg-white/95 backdrop-blur-md z-30 mb-2">
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-4 h-4 text-zinc-600" />
           </Button>
           <div>
              <h1 className="text-base font-semibold text-zinc-900 tracking-tighter uppercase leading-none">Analytics</h1>
              <div className="flex items-center gap-1.5 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Real-time stats</span>
              </div>
           </div>
        </div>

        <div className="relative">
           <Button 
              onClick={() => setIsPeriodOpen(!isPeriodOpen)}
              variant="outline" 
              className="h-9 rounded-xl border-zinc-100 bg-white gap-2 px-3 shadow-sm active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
           >
              <Calendar className="w-3.5 h-3.5 text-zinc-900" />
              <span className="text-[10px] font-semibold text-zinc-900 uppercase tracking-widest">{selectedPeriod}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
           </Button>

           <AnimatePresence>
              {isPeriodOpen && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-11 w-48 bg-white border-2 border-zinc-900 shadow-2xl z-50 rounded-xl overflow-hidden"
                 >
                    <div className="p-3 bg-zinc-900 text-[9px] font-semibold text-primary uppercase tracking-widest border-b border-zinc-800">
                       Select Reporting Period
                    </div>
                    <div className="p-1 grid grid-cols-1 divide-y divide-zinc-50 bg-white">
                       {['Last 7 Days', 'This Month', 'Last Month', 'This Year', 'All Time'].map((period) => (
                          <button 
                             key={period} 
                             onClick={() => {
                                setSelectedPeriod(period);
                                setIsPeriodOpen(false);
                              }}
                             className="h-9 w-full text-left px-3 text-[9px] font-bold uppercase tracking-tighter hover:bg-zinc-100 transition-colors text-zinc-500 hover:text-zinc-900"
                          >
                             {period}
                          </button>
                       ))}
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <section className="grid grid-cols-2 gap-2">
        {primaryStats.map((stat, i) => (
          <Card key={i} className="rounded-xl border-zinc-100 shadow-none bg-white overflow-hidden group hover:border-primary transition-all">
             <CardContent className="p-3 space-y-2 relative">
                <div className="flex justify-between items-center">
                   <p className="text-[8.5px] font-semibold text-zinc-400 uppercase tracking-[0.1em]">{stat.label}</p>
                   <div className="flex items-center gap-0.5">
                      <ArrowUpRight className="w-2.5 h-2.5 text-emerald-500" />
                      <span className="text-[8px] font-semibold text-emerald-500">{stat.trend}</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className={cn("w-7 h-7 flex items-center justify-center rounded-xl border border-current/10 shrink-0", stat.color)}>
                      <stat.icon className="w-3.5 h-3.5" />
                   </div>
                   <h4 className="text-lg font-semibold text-zinc-900 tracking-tighter leading-none">{stat.value}</h4>
                </div>
             </CardContent>
          </Card>
        ))}
      </section>

      {/* Weekly Activity Chart (Sharpened & Light) */}
      <Card className="border-2 border-zinc-100 rounded-xl shadow-none bg-white overflow-hidden relative">
        <CardContent className="p-4 space-y-6">
           <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                 <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <h3 className="font-semibold text-zinc-900 text-[10px] uppercase tracking-widest">Weekly Activity</h3>
                 </div>
                 <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-tighter">Daily Lead Distribution Velocity</p>
              </div>
              <div className="flex items-center gap-2 bg-zinc-50 px-2.5 py-1.5 border border-zinc-100">
                 <div className="w-2 h-2 bg-primary"></div>
                 <span className="text-[8px] font-semibold text-zinc-500 uppercase tracking-widest">Active Leads</span>
              </div>
           </div>

            <div className="flex justify-between items-end h-24 gap-2 px-0 pt-2">
               {weeklyData.map((data, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                     <div className="w-full relative h-[100%] flex items-end">
                        <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${data.value}%` }}
                           transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
                           className="w-full bg-zinc-100 group-hover:bg-primary transition-all duration-300 relative rounded-xl"
                        >
                           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-zinc-900 shadow-[2px_2px_0px_0px_#000]">
                              {data.leads}
                           </div>
                        </motion.div>
                     </div>
                     <span className={cn(
                        "text-[9px] font-semibold tracking-tight uppercase leading-none",
                        data.day === todayLetter ? "text-primary text-[10px]" : "text-zinc-400"
                     )}>{data.day}</span>
                  </div>
               ))}
            </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel (Sharpened) */}
      <section className="bg-white border-none rounded-xl p-5 space-y-4 shadow-none">
         <div className="space-y-1">
            <h3 className="text-[10px] font-semibold text-zinc-900 uppercase tracking-widest">Conversion Funnel</h3>
            <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest">Efficiency through the pipeline</p>
         </div>
         
         <div className="space-y-1">
            {funnelSteps.map((item, i) => (
               <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                     "h-10 rounded-xl flex items-center justify-between px-3.5 transition-all duration-1000 border-l-[4px] border-primary",
                     item.color
                  )} style={{ width: item.width }}>
                     <span className="text-[9px] font-semibold uppercase tracking-tighter truncate">{item.label}</span>
                     <span className="text-xs font-semibold">{item.value}</span>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Smart Insights (Compact) */}
      <section className="space-y-2.5">
         <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase">Fleet Intelligence</h3>
            <Badge className="rounded-xl bg-primary/10 text-primary border-none text-[8px] uppercase tracking-tighter">Automated</Badge>
         </div>
         <div className="space-y-2">
            <div className="p-3.5 bg-zinc-50 border-r-[4px] border-emerald-500 rounded-xl flex gap-4 items-center">
               <div className="w-10 h-10 bg-white rounded-xl border border-emerald-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
               </div>
               <div className="space-y-0.5">
                  <p className="text-[10px] font-semibold text-zinc-900 uppercase tracking-tight">Performance Boost</p>
                  <p className="text-[9px] font-bold text-zinc-500 leading-relaxed tracking-tight">Your conversion rate is 15% higher than average drivers in Indore.</p>
               </div>
            </div>

            <div className="p-3.5 bg-zinc-900 border-none rounded-xl flex gap-4 items-center text-white relative overflow-hidden">
               <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center backdrop-blur-md shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
               </div>
               <div className="space-y-0.5 relative z-10">
                  <p className="text-[10px] font-semibold text-white uppercase tracking-tight">Market Opportunity</p>
                  <p className="text-[9px] font-bold text-zinc-500 tracking-tight">Vijay Nagar area has high demand for Goods Transport currently.</p>
               </div>
               <ArrowUpRight className="absolute -right-4 -top-4 w-16 h-16 text-white/5 rotate-[-15deg]" />
            </div>
         </div>
      </section>
    </motion.div>
  );
};

export default AnalyticsPage;
