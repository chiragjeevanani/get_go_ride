import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Star, 
  Trash2, CheckCircle2, Flag,
  MessageSquare, User, Truck,
  MoreVertical, Filter, AlertTriangle
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockReviews } from '../data/mockData';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';

const Moderation = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [reviews, setReviews] = useState(mockReviews);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleApproveReview = (id) => {
    const review = reviews.find(r => r.id === id);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    showToast(`Review by ${review?.user} approved`, 'success');
  };

  const handleDismissFlag = () => {
    showToast("Flagged content dismissed", "success");
  };

  const handleInvestigate = () => {
    showToast("Investigation protocol initiated", "info");
  };

  const handleViewProfile = (userName) => {
    setSelectedUser({
      name: userName,
      email: `${userName.toLowerCase().replace(' ', '.')}@example.com`,
      joined: "Jan 2024",
      status: "Active",
      totalReviews: 8,
      rating: 4.5,
      completedTrips: 24
    });
    setIsUserModalOpen(true);
  };

  const handleManageAccount = () => {
    showToast(`Navigating to account management for ${selectedUser?.name}`, "info");
    setIsUserModalOpen(false);
  };

  const filteredReviews = reviews.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return r.status === 'Pending';
    if (activeFilter === 'flagged') return r.status === 'Flagged';
    return true;
  });

  const reviewColumns = [
    { 
      key: "user", 
      label: "Reviewer", 
      render: (val) => (
        <div className="flex items-center gap-2">
           <User className="w-3.5 h-3.5 text-zinc-500" />
           <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">{val}</span>
        </div>
      )
    },
    { 
      key: "vendor", 
      label: "Reviewed Vendor", 
      render: (val) => (
        <div className="flex items-center gap-2">
           <Truck className="w-3.5 h-3.5 text-zinc-500" />
           <span className="text-xs font-black text-zinc-400 uppercase tracking-tight">{val}</span>
        </div>
      )
    },
    { 
      key: "rating", 
      label: "Rating", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1">
           {[...Array(5)].map((_, i) => (
             <Star key={i} className={cn("w-3 h-3", i < val ? "fill-primary text-primary" : "text-zinc-800")} />
           ))}
        </div>
      )
    },
    { 
      key: "comment", 
      label: "Comment", 
      render: (val) => (
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight line-clamp-1 max-w-[200px] italic">
          "{val}"
        </p>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (val) => (
        <div className={cn(
          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
          val === 'Approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
          val === 'Pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          "bg-rose-500/10 text-rose-500 border-rose-500/20"
        )}>
           {val}
        </div>
      )
    },
    { 
      key: "actions", 
      label: "ACTIONS", 
      align: "right",
      render: (_, row) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {row.status === 'Pending' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleApproveReview(row.id)}
                className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all shadow-sm"
              >
                 <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-white transition-all shadow-sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 rounded-xl p-1 shadow-2xl">
                <DropdownMenuItem 
                  onClick={() => showToast("Flagged as spam", "error")}
                  className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Flag as Spam
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleViewProfile(row.user)}
                  className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:text-white"
                >
                  <User className="w-3.5 h-3.5" />
                  View User Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setReviews(prev => prev.filter(r => r.id !== row.id));
                    showToast("Review deleted permanently", "error");
                  }}
                  className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Review Moderation" 
        subtitle="Approve reviews and manage flagged marketplace content" 
        actions={
          <div className="flex items-center gap-2">
             <Button variant="outline" className="border-rose-500/20 bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Flagged Content (2)
             </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Sidebar stats/filters */}
         <div className="space-y-6">
            <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900 space-y-6">
               <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Filter Reviews
               </h3>
               
               <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Reviews', count: 42, color: 'primary' },
                    { id: 'pending', label: 'Pending Approval', count: 12, color: 'amber-500' },
                    { id: 'flagged', label: 'Flagged / Spam', count: 3, color: 'rose-500' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest",
                        activeFilter === filter.id 
                          ? "bg-primary/10 border-primary/20 text-primary" 
                          : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-900 dark:text-white"
                      )}
                    >
                      {filter.label}
                      <Badge className={cn(
                        "text-[9px] border-none",
                        activeFilter === filter.id ? "bg-primary text-black" : "bg-zinc-800 text-white"
                      )}>{filter.count}</Badge>
                    </button>
                  ))}
               </div>
            </div>

            <div className="admin-card p-6 bg-rose-500/5 border-rose-500/20 relative overflow-hidden group">
               <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 text-rose-500">
                     <ShieldAlert className="w-5 h-5" />
                     <h3 className="text-xs font-black uppercase tracking-widest">Auto Moderation</h3>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed tracking-tight">
                     AI moderation is currently flagging 15% of reviews for profanity or low quality.
                  </p>
                  <Button variant="link" className="p-0 h-fit text-rose-500 font-black text-[9px] uppercase tracking-widest">Adjust Rules</Button>
               </div>
            </div>
         </div>

         {/* Main Table Area */}
         <div className="lg:col-span-3">
            <DataTable 
              columns={reviewColumns} 
              data={filteredReviews} 
              searchKey="user"
              searchPlaceholder="Find reviews by user name..."
            />
         </div>
      </div>

      {/* Flagged Section Placeholder */}
      <div className="mt-8 space-y-4">
         <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-500" />
            Urgent: High Severity Flags
         </h4>
         
         <div className="admin-card p-6 border-rose-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-rose-500/30 transition-all bg-rose-500/[0.02]">
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
               </div>
               <div className="space-y-1">
                  <h5 className="text-sm font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Suspicious Lead Finalization</h5>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Vendor 'Ravi Transport' flagged for off-platform payment solicitation.</p>
                  <div className="flex items-center gap-4 mt-3">
                     <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase">HIGH SEVERITY</span>
                     <span className="text-[9px] font-black text-zinc-600 uppercase">30 MINUTES AGO</span>
                  </div>
               </div>
            </div>
            <div className="flex gap-2 shrink-0">
               <Button 
                onClick={handleInvestigate}
                className="bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors"
               >
                  Investigate
               </Button>
               <Button 
                variant="ghost" 
                onClick={handleDismissFlag}
                className="text-zinc-600 hover:text-zinc-900 dark:text-white font-black uppercase text-[10px] tracking-widest h-10 px-4 rounded-xl"
               >
                  Dismiss
               </Button>
            </div>
         </div>
      </div>

      {/* User Profile Quick View Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="User Profile Detail"
        description="Reviewer identity and platform activity history"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-5 py-2">
             {/* Profile Header - Compact */}
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl italic">
                   {selectedUser.name.charAt(0)}
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{selectedUser.name}</h3>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[7px] font-black uppercase px-1.5 py-0">Active</Badge>
                   </div>
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">{selectedUser.email}</p>
                   <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Joined: {selectedUser.joined}</p>
                </div>
             </div>

             {/* Platform Stats - Compact */}
             <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Reviews", val: selectedUser.totalReviews, icon: MessageSquare },
                  { label: "Avg Rating", val: selectedUser.rating, icon: Star },
                  { label: "Trips", val: selectedUser.completedTrips, icon: Truck }
                ].map((stat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 space-y-1 text-center group hover:border-primary/30 transition-all">
                     <stat.icon className="w-3.5 h-3.5 text-primary mx-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                     <div className="space-y-0">
                        <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                        <h4 className="text-sm font-black text-zinc-900 dark:text-white italic">{stat.val}</h4>
                     </div>
                  </div>
                ))}
             </div>

             {/* Recent Activity Mini-Feed - Compact */}
             <div className="space-y-3">
                <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Recent Activity</h4>
                <div className="space-y-2">
                   {[
                     { action: "Posted Review", target: "Vijay Logistics", time: "2h ago" },
                     { action: "Requested Ride", target: "House Shifting", time: "1d ago" },
                     { action: "Updated Profile", target: "Contact Detail", time: "3d ago" }
                   ].map((act, i) => (
                     <div key={i} className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                        <div className="flex flex-col gap-0">
                           <span className="text-[9px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">{act.action}</span>
                           <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Target: {act.target}</span>
                        </div>
                        <span className="text-[7px] font-black text-zinc-400 uppercase italic">{act.time}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="pt-2 flex gap-2">
                <Button 
                  onClick={handleManageAccount}
                  className="flex-1 bg-primary text-black font-black uppercase text-[10px] tracking-widest h-10 rounded-xl shadow-lg shadow-primary/20"
                >
                   Manage User Account
                </Button>
                <Button variant="ghost" onClick={() => setIsUserModalOpen(false)} className="px-5 text-zinc-500 font-black uppercase text-[10px] tracking-widest h-10">
                   Close View
                </Button>
             </div>
          </div>
        )}
      </Modal>

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: '', type: 'success' })} 
      />
    </div>
  );
};

export default Moderation;
