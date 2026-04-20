import React from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, 
  CreditCard, PieChart, BarChart3,
  Calendar, ArrowUpRight, ArrowDownRight,
  Download, Filter, Target, Zap,
  Map, Activity, Flag, MousePointerClick
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { BarChart } from '../components/charts/BarChart';
import { LineChart } from '../components/charts/LineChart';
import { DonutChart } from '../components/charts/DonutChart';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockRevenueData, mockLeadsTrend } from '../data/mockData';
import { cn } from "@/lib/utils";

const Revenue = () => {
  const revenueStats = [
    { title: "Total Earnings", value: "₹24.8L", icon: IndianRupee, trend: "+18.2%", trendDirection: "up", color: "primary" },
    { title: "Platform Commission", value: "₹6.4L", icon: Zap, trend: "+32.5%", trendDirection: "up" },
    { title: "Active Subscriptions", value: "342", icon: CreditCard, trend: "+4.2%", trendDirection: "up" },
    { title: "Monthly Growth", value: "24.5%", icon: TrendingUp, trend: "+2.1%", trendDirection: "up" },
  ];

  const categoryPerformance = [
    { name: 'House Shifting', value: 42, count: 154, color: '#facc15' },
    { name: 'Goods Transport', value: 38, count: 120, color: '#10b981' },
    { name: 'Emergency', value: 12, count: 68, color: '#f43f5e' },
    { name: 'Passenger', value: 8, count: 45, color: '#3b82f6' },
  ];

  const regionalData = [
    { city: "Indore", leads: 1240, revenue: "₹8.2L", growth: "+12%" },
    { city: "Bhopal", leads: 850, revenue: "₹5.4L", growth: "+8%" },
    { city: "Ujjain", leads: 420, revenue: "₹2.8L", growth: "+15%" },
    { city: "Dewas", leads: 180, revenue: "₹0.9L", growth: "+5%" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader 
        title="Revenue & Analytics" 
        subtitle="Full spectrum analysis of platform monetization and regional impact" 
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

      {/* Main Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <ChartCard 
              title="Revenue Streams" 
              subtitle="Comparison between Subscriptions and Lead Commissions"
            >
               <BarChart data={mockRevenueData} dataKey="revenue" />
            </ChartCard>
         </div>

         <ChartCard 
            title="Service Performance" 
            subtitle="Revenue contribution by category"
         >
            <DonutChart data={categoryPerformance} dataKey="value" nameKey="name" />
         </ChartCard>
      </div>

      {/* Deep Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Regional Performance */}
         <div className="lg:col-span-8 admin-card p-6 border-zinc-200 dark:border-zinc-900 overflow-hidden relative group">
            <div className="flex items-center justify-between mb-8">
               <div className="space-y-1">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                     <Map className="w-4 h-4 text-primary" />
                     City-wise Impact
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Regional lead volume and revenue contribution</p>
               </div>
               <Button variant="ghost" className="text-[10px] font-black uppercase text-primary">View Heatmap</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {regionalData.map((data, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 space-y-4 group/item hover:border-primary/30 transition-all">
                     <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase italic">{data.city}</span>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">{data.growth}</Badge>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-zinc-500 uppercase">Revenue contribution</span>
                        <h4 className="text-lg font-black text-zinc-900 dark:text-white tracking-tighter">{data.revenue}</h4>
                     </div>
                     <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: i === 0 ? "85%" : i === 1 ? "60%" : "30%" }} />
                     </div>
                  </div>
               ))}
            </div>
            
            <Flag className="absolute -right-4 -top-4 w-32 h-32 text-primary opacity-[0.02] rotate-[15deg] group-hover:opacity-[0.05] transition-opacity" />
         </div>

         {/* Conversion Funnel */}
         <div className="lg:col-span-4 admin-card p-6 border-zinc-200 dark:border-zinc-900 flex flex-col justify-between">
            <div className="space-y-1 mb-8">
               <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-primary" />
                  Conversion Funnel
               </h3>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Lead matching to deal finalization</p>
            </div>

            <div className="space-y-6 relative">
               {[
                  { label: "Leads Created", val: "100%", count: "1,240", sub: "Incoming requirements" },
                  { label: "Bids Received", val: "68%", count: "843", sub: "Vendor responses" },
                  { label: "Deals Finalized", val: "24%", count: "298", sub: "Successful conversions" }
               ].map((step, i) => (
                  <div key={i} className="relative z-10 space-y-2">
                     <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                           <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">{step.label}</span>
                           <p className="text-[8px] font-bold text-zinc-600 uppercase">{step.sub}</p>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-black text-primary italic">{step.val}</span>
                           <p className="text-[8px] font-bold text-zinc-500 uppercase">{step.count}</p>
                        </div>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-950/50 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-900">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: step.val }} />
                     </div>
                  </div>
               ))}
               
               {/* Vertical line connecting steps */}
               <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-zinc-800 z-0 opacity-20" />
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-900 text-center">
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Average Finalization Time: 4.8 Hours</span>
            </div>
         </div>
      </div>

      {/* Subscription Growth vs Commisison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-12">
            <ChartCard 
               title="Financial Performance Trajectory" 
               subtitle="Monthly revenue trend covering both subscription plans and transaction commissions"
            >
               <LineChart data={mockRevenueData} dataKey="revenue" />
            </ChartCard>
         </div>
      </div>
    </div>
  );
};

export default Revenue;
