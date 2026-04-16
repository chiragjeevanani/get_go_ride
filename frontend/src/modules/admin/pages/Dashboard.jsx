import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Truck, Layers, 
  CreditCard, IndianRupee, 
  TrendingUp, ArrowRight,
  Plus, Calendar, Download, Zap,
  Search, ChevronRight
} from "lucide-react";
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { Button } from "@/components/ui/button";
import { 
  mockUsers, 
  mockVendors, 
  mockLeads, 
  mockRevenueData, 
  mockLeadsTrend 
} from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: "Total Users", value: mockUsers.length + 1200, icon: Users, trend: "+12%", trendDirection: "up" },
    { title: "Active Vendors", value: mockVendors.length + 450, icon: Truck, trend: "+5%", trendDirection: "up" },
    { title: "Total Leads", value: mockLeads.length + 2800, icon: Layers, trend: "+18%", trendDirection: "up" },
    { title: "Active Subscriptions", value: "342", icon: CreditCard, trend: "+2%", trendDirection: "up" },
    { title: "Total Revenue", value: "₹4.2L", icon: IndianRupee, trend: "+15%", trendDirection: "up", color: "primary" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase tracking-widest">Platform Overview</h1>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Real-time health and operational metrics</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest h-11 px-6 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Calendar className="w-4 h-4 mr-2" />
              Feb 2024
           </Button>
           <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg hover:opacity-90 transition-opacity">
              <Download className="w-4 h-4 mr-2" />
              Export Report
           </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartCard 
            title="Lead Generation Trends" 
            subtitle="Daily platform activity (Last 7 Days)"
            action={<Button variant="ghost" onClick={() => navigate('/admin/leads')} className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-[10px] uppercase tracking-widest transition-colors">View Details</Button>}
          >
            <LineChart data={mockLeadsTrend} dataKey="leads" />
          </ChartCard>
        </div>
        
        <div className="space-y-8">
           <ChartCard 
              title="Quick Insights" 
              subtitle="Vendor approval health"
           >
              <div className="space-y-6 pt-4">
                 <div className="admin-card p-6 border-zinc-200 dark:border-zinc-800/50 space-y-4">
                    <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="w-4 h-4 text-zinc-900 dark:text-white" />
                       Action Required
                    </h4>
                    <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
                       Vendor approval queue is increasing. Recommended to process verification requests for 50+ partners.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/admin/moderation')} className="w-full border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-widest h-10 rounded-xl transition-colors">
                       Go to Moderation
                    </Button>
                 </div>

                 <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
                    <TrendingUp className="w-8 h-8 text-zinc-900 dark:text-white mx-auto" />
                    <div className="space-y-1">
                       <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase italic">Indore Surge</h4>
                       <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Leads are up 18% in your base region</p>
                    </div>
                 </div>
              </div>
         </ChartCard>
        </div>
      </div>

      {/* Secondary Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <ChartCard 
          title="Revenue Trajectory" 
          subtitle="Subscription growth performance (FY 2024)"
          action={<Button variant="ghost" onClick={() => navigate('/admin/revenue')} className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-[10px] uppercase tracking-widest transition-colors">Finance Hub</Button>}
        >
          <BarChart data={mockRevenueData} dataKey="revenue" />
        </ChartCard>

        <div className="admin-card p-8 space-y-6 flex flex-col justify-center bg-zinc-50 dark:bg-[#09090b]/20 border-zinc-200 dark:border-zinc-800/50">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tighter">Recent Leads</h3>
                 <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Latest platform demands</p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/admin/leads')} className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-[10px] uppercase tracking-widest transition-colors">See All</Button>
           </div>
           
           <div className="space-y-3">
              {mockLeads.slice(0, 3).map((lead, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 group hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-zinc-900 dark:text-white" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{lead.serviceType}</span>
                          <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{lead.location}</span>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
