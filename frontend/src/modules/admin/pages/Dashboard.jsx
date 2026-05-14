import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Truck, Layers, 
  CreditCard, IndianRupee, 
  TrendingUp, ArrowRight,
  Plus, Calendar, Download, Zap,
  Search, ChevronRight, Loader2
} from "lucide-react";
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { Button } from "@/components/ui/button";
import { mockRevenueData, mockLeadsTrend } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lead Generation Trend States
  const [range, setRange] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leadsTrend, setLeadsTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);

  // Initialize custom dates with last 7 days defaults
  useEffect(() => {
    if (!startDate || !endDate) {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 6);
      
      const format = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      setStartDate(format(past));
      setEndDate(format(today));
    }
  }, [range]);

  // Fetch trend statistics
  useEffect(() => {
    const fetchTrendData = async () => {
      if (range === 'custom' && (!startDate || !endDate)) {
        return;
      }
      try {
        setTrendLoading(true);
        const params = { range };
        if (range === 'custom') {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        const res = await adminApi.getLeadsTrend(params);
        setLeadsTrend(res.data || []);
      } catch (err) {
        console.error("Failed to fetch leads trend data:", err);
      } finally {
        setTrendLoading(false);
      }
    };

    fetchTrendData();
  }, [range, startDate, endDate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getAllRequirements({ limit: 3 })
        ]);
        setStats(statsRes.data);
        setRecentLeads(leadsRes.data || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const currentMonthYear = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, trend: "+12%", trendDirection: "up" },
    { title: "Active Vendors", value: stats?.totalVendors || 0, icon: Truck, trend: "+5%", trendDirection: "up" },
    { title: "Total Leads", value: stats?.totalRequirements || 0, icon: Layers, trend: "+18%", trendDirection: "up" },
    { title: "Active Subscriptions", value: stats?.activeSubscriptions || 0, icon: CreditCard, trend: "+2%", trendDirection: "up" },
    { title: "Total Revenue", value: stats?.totalRevenue || "₹0", icon: IndianRupee, trend: stats?.monthlyGrowth || "+0%", trendDirection: "up", color: "primary" },
  ];

  const dateInputRef = React.useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    // Format for display
    const dateObj = new Date(newDate);
    const displayDate = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    toast.success(`Dashboard view filtered for ${displayDate}`);
    // Here you would normally fetch data for this specific date
    handleRefresh(); 
  };

  const handleExport = () => {
    if (!stats) {
      toast.error("No data available to export");
      return;
    }
    
    // Create CSV content
    const headers = ["Metric", "Value", "Trend"];
    const rows = [
      ["Total Users", stats.totalUsers || 0, "+12%"],
      ["Active Vendors", stats.totalVendors || 0, "+5%"],
      ["Total Leads", stats.totalRequirements || 0, "+18%"],
      ["Active Subscriptions", stats.activeSubscriptions || 0, "+2%"],
      ["Total Revenue", stats.totalRevenue || "₹0", stats.monthlyGrowth || "+0%"],
      ["Timestamp", new Date().toLocaleString(), "N/A"]
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `GetGoLoad_Platform_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Platform report exported successfully!");
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const [statsRes, leadsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllRequirements({ limit: 3 })
      ]);
      setStats(statsRes.data);
      setRecentLeads(leadsRes.data || []);
    } catch (err) {
      console.error("Failed to refresh dashboard:", err);
      toast.error("Failed to refresh dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase tracking-widest">Platform Overview</h1>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Real-time health and operational metrics</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <input 
               type="date"
               ref={dateInputRef}
               onChange={handleDateChange}
               value={selectedDate}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               style={{ colorScheme: 'light' }}
             />
             <Button 
               variant="outline" 
               className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest h-11 px-6 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
             >
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(selectedDate).toLocaleString('en-US', { month: 'short', year: 'numeric' })}
             </Button>
           </div>
           <Button 
             onClick={handleExport}
             className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
           >
              <Download className="w-4 h-4 mr-2" />
              Export Report
           </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartCard 
            title="Lead Generation Trends" 
            subtitle={`Daily platform activity (${range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Custom Range'})`}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  {['7days', '30days', 'custom'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        range === r
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {r === '7days' ? '7 Days' : r === '30days' ? '30 Days' : 'Custom'}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => navigate('/admin/leads')} className="text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-[10px] uppercase tracking-widest transition-colors h-9 px-3 rounded-lg">
                  View Details
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              {range === 'custom' && (
                <div className="flex items-center gap-3 py-2 px-1 border-b border-dashed border-zinc-200 dark:border-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Start Date</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-semibold text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all uppercase"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">End Date</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-semibold text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all uppercase"
                    />
                  </div>
                </div>
              )}

              <div className="h-[280px] w-full">
                {trendLoading ? (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-50/10 dark:bg-zinc-950/5 rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-900 dark:text-white" />
                  </div>
                ) : leadsTrend.length > 0 ? (
                  <LineChart data={leadsTrend} dataKey="leads" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center gap-2 bg-zinc-50/10 dark:bg-zinc-950/5 rounded-xl">
                    <Layers className="w-8 h-8 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No booking requests found</p>
                    {range === 'custom' && (!startDate || !endDate) && (
                      <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-tight">Please select start and end dates</p>
                    )}
                  </div>
                )}
              </div>
            </div>
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
                       {stats?.pendingVendors > 0 
                         ? `Vendor approval queue is increasing. Recommended to process verification requests for ${stats?.pendingVendors} partners.`
                         : `Vendor approval queue is empty. No action required.`}
                    </p>
                    <Button variant="outline" onClick={() => navigate('/admin/vendors?status=Pending')} className="w-full border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-widest h-10 rounded-xl transition-colors">
                       Review Partners
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
              {recentLeads.length > 0 ? recentLeads.map((lead, i) => (
                 <div key={i} onClick={() => navigate('/admin/leads')} className="flex items-center justify-between p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 group hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-zinc-900 dark:text-white" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{lead.serviceType} - {lead.vehicleType}</span>
                          <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest truncate max-w-[200px]">{lead.pickup?.address}</span>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                 </div>
              )) : (
                 <div className="text-center py-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">No recent leads found.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
