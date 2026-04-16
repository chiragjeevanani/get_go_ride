import React from 'react';
import { motion } from 'framer-motion';
import { 
  IndianRupee, TrendingUp, TrendingDown, 
  CreditCard, PieChart, BarChart3,
  Calendar, ArrowUpRight, ArrowDownRight,
  Download, Filter, Target, Zap
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { BarChart } from '../components/charts/BarChart';
import { LineChart } from '../components/charts/LineChart';
import { DonutChart } from '../components/charts/DonutChart';
import { Button } from "@/components/ui/button";
import { mockRevenueData, mockLeadsTrend } from '../data/mockData';
import { cn } from "@/lib/utils";

const Revenue = () => {
  const revenueStats = [
    { title: "Total Earnings", value: "₹18.4L", icon: IndianRupee, trend: "+12.5%", trendDirection: "up", color: "primary" },
    { title: "Active Subscriptions", value: "342", icon: CreditCard, trend: "+4.2%", trendDirection: "up" },
    { title: "Monthly Growth", value: "24.5%", icon: TrendingUp, trend: "+2.1%", trendDirection: "up" },
    { title: "Avg. Plan Value", value: "₹2,450", icon: Target, trend: "-1.2%", trendDirection: "down" },
  ];

  const planDistribution = [
    { name: 'Premium Yearly', value: 45, count: 154 },
    { name: 'Premium Monthly', value: 35, count: 120 },
    { name: 'Basic Monthly', value: 20, count: 68 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader 
        title="Revenue & Analytics" 
        subtitle="Detailed financial performance and subscription growth" 
        actions={
          <div className="flex items-center gap-2">
             <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
             </Button>
             <Button className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20">
                <Calendar className="w-4 h-4 mr-2" />
                This Quarter
             </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Revenue Chart */}
         <div className="lg:col-span-2">
            <ChartCard 
              title="Revenue Trajectory" 
              subtitle="Monthly subscription earnings comparison (FY 2024)"
            >
               <BarChart data={mockRevenueData} dataKey="revenue" />
            </ChartCard>
         </div>

         {/* Distribution Chart */}
         <ChartCard 
           title="Plan Participation" 
           subtitle="Market share by subscription tier"
         >
            <DonutChart data={planDistribution} dataKey="value" nameKey="name" />
         </ChartCard>
      </div>

      {/* Analytics Insights & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Subscription Growth Line */}
         <div className="lg:col-span-2">
            <ChartCard 
               title="Subscription Growth" 
               subtitle="New monthly signups vs target benchmarks"
            >
               <LineChart data={mockLeadsTrend} dataKey="leads" />
            </ChartCard>
         </div>

         {/* Future Outlook / Placeholders */}
         <div className="space-y-6">
            <div className="admin-card p-6 bg-primary/5 border-primary/20 relative overflow-hidden group">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                     <Zap className="w-5 h-5 text-primary" />
                     <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Commission Tracking</h3>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed tracking-tight italic">
                     We are currently developing a commission-based revenue model for lead finalization. 
                     Expected launch: Q3 2024.
                  </p>
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-900 rounded-xl">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Potential Revenue Hike</span>
                        <span className="text-xs font-black text-emerald-500 italic">+35% Est.</span>
                     </div>
                  </div>
               </div>
               <PieChart className="absolute -right-4 -bottom-4 w-24 h-24 text-primary opacity-5 rotate-[15deg] group-hover:opacity-10 transition-opacity" />
            </div>

            <div className="admin-card p-6 border-zinc-200 dark:border-zinc-800 space-y-6">
               <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Earnings Breakdown
               </h3>
               
               <div className="space-y-4">
                  {[
                     { label: "Lead Subscriptions", value: "₹12.8L", percent: "70%", color: "bg-primary" },
                     { label: "Vendor Verification Fees", value: "₹4.2L", percent: "22.5%", color: "bg-emerald-500" },
                     { label: "Ad Placements", value: "₹1.4L", percent: "7.5%", color: "bg-blue-500" },
                  ].map((item, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</span>
                           <span className="text-xs font-black text-zinc-900 dark:text-white italic">{item.value}</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                           <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: item.percent }} />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Revenue;
