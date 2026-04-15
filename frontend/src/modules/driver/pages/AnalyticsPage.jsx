import { 
  BarChart2, TrendingUp, Users, Target, 
  ArrowUpRight, ArrowDownRight, Zap, ChevronLeft, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StatCard } from "../components/StatCard";
import { cn } from "@/lib/utils";

const AnalyticsPage = () => {
  const navigate = useNavigate();

  const primaryStats = [
    { label: "Total Leads", value: "142", icon: Zap, trend: "+12%", color: "bg-blue-50 text-blue-500" },
    { label: "Accepted", value: "86", icon: Target, trend: "+8%", color: "bg-emerald-50 text-emerald-500" },
    { label: "Conversion", value: "61%", icon: TrendingUp, trend: "+5%", color: "bg-orange-50 text-orange-500" },
    { label: "Est. Earnings", value: "₹42k", icon: BarChart2, trend: "+15%", color: "bg-primary/10 text-primary" },
  ];

  const weeklyData = [
    { day: "Mon", value: 65, leads: 8 },
    { day: "Tue", value: 45, leads: 5 },
    { day: "Wed", value: 85, leads: 12 },
    { day: "Thu", value: 35, leads: 4 },
    { day: "Fri", value: 95, leads: 15 },
    { day: "Sat", value: 75, leads: 10 },
    { day: "Sun", value: 55, leads: 7 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24 pt-4 px-1"
    >
      {/* Header */}
      <header className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" className="rounded-full bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5 text-zinc-600" />
           </Button>
           <div>
              <h1 className="text-xl font-black text-black tracking-tight uppercase italic leading-none">Analytics</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Performance Overview</p>
           </div>
        </div>
        <Button variant="outline" className="h-10 rounded-xl border-zinc-100 bg-white gap-2 px-3">
           <Calendar className="w-4 h-4 text-zinc-400" />
           <span className="text-[10px] font-black uppercase tracking-widest">This Month</span>
        </Button>
      </header>

      {/* Primary Stats Grid */}
      <section className="grid grid-cols-2 gap-3">
        {primaryStats.map((stat, i) => (
          <StatCard 
            key={i}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            trendColor={stat.color}
          />
        ))}
      </section>

      {/* Weekly Activity Chart (Visual Bars) */}
      <Card className="border-2 border-zinc-50 shadow-premium rounded-[2rem] bg-white overflow-hidden">
        <CardContent className="p-8 space-y-8">
           <div className="flex justify-between items-end">
              <div className="space-y-1">
                 <h3 className="font-black text-black text-xs uppercase tracking-tight">Weekly Activity</h3>
                 <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Leads received per day</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                 <span className="text-[9px] font-black text-black uppercase">Leads Received</span>
              </div>
           </div>

           <div className="flex justify-between items-end h-40 gap-2 px-1">
              {weeklyData.map((data, i) => (
                 <div key={i} className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-full relative group">
                       <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${data.value}%` }}
                          transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                          className="w-full bg-zinc-50 rounded-t-xl group-hover:bg-primary transition-colors relative"
                       >
                          {/* Value Tooltip on Hover */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                             {data.leads}
                          </div>
                       </motion.div>
                    </div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{data.day}</span>
                 </div>
              ))}
           </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <section className="space-y-4">
         <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase px-1">Smart Insights</h3>
         <div className="space-y-3">
            <div className="p-5 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] flex gap-4 items-center">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
               </div>
               <div className="space-y-1">
                  <p className="text-xs font-black text-emerald-700 uppercase leading-tight">Great Performace!</p>
                  <p className="text-[9px] font-bold text-emerald-600/80 uppercase leading-relaxed tracking-tight">Your conversion rate is 15% higher than average drivers in Indore.</p>
               </div>
            </div>

            <div className="p-5 bg-zinc-900 border-none rounded-[2rem] flex gap-4 items-center text-white relative overflow-hidden">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
                  <Zap className="w-6 h-6 text-primary" />
               </div>
               <div className="space-y-1 relative z-10">
                  <p className="text-xs font-black text-white uppercase leading-tight">Peak Demand Zone</p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase leading-relaxed tracking-tight">Vijay Nagar area has high demand for Goods Transport currently.</p>
               </div>
               <ArrowUpRight className="absolute -right-4 -top-4 w-20 h-20 text-white/5 rotate-[-15deg]" />
            </div>
         </div>
      </section>

      {/* Conversion Funnel (Simplistic) */}
      <section className="bg-white border-2 border-zinc-50 rounded-[2rem] p-8 space-y-6 shadow-sm">
         <h3 className="text-xs font-black text-black uppercase tracking-tight text-center">Conversion Funnel</h3>
         <div className="space-y-2">
            {[
               { label: "Leads Received", value: "142", width: "100%", color: "bg-zinc-100" },
               { label: "Leads Viewed", value: "118", width: "85%", color: "bg-zinc-200" },
               { label: "Offers Made", value: "94", width: "65%", color: "bg-zinc-600 text-white" },
               { label: "Finalized", value: "86", width: "60%", color: "bg-black text-white" }
            ].map((item, i) => (
               <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                     "h-10 rounded-xl flex items-center justify-between px-4 transition-all duration-1000",
                     item.color
                  )} style={{ width: item.width }}>
                     <span className="text-[9px] font-black uppercase tracking-widest truncate">{item.label}</span>
                     <span className="text-[10px] font-black">{item.value}</span>
                  </div>
               </div>
            ))}
         </div>
      </section>
    </motion.div>
  );
};

export default AnalyticsPage;
