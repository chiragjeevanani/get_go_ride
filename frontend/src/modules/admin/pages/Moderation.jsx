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

const Moderation = () => {
  const [activeFilter, setActiveFilter] = useState("all");

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
      label: "", 
      render: (_, row) => (
        <div className="flex justify-end gap-2">
           {row.status === 'Pending' && (
             <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all">
                <CheckCircle2 className="w-4 h-4" />
             </Button>
           )}
           <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-white transition-all">
              <MoreVertical className="w-4 h-4" />
           </Button>
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
                        activeFilter === filter.id ? "bg-primary text-black" : "bg-zinc-800 text-zinc-500"
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
              data={mockReviews} 
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
               <Button className="bg-rose-500 text-zinc-900 dark:text-white font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-rose-500/20">
                  Investigate
               </Button>
               <Button variant="ghost" className="text-zinc-600 hover:text-zinc-900 dark:text-white font-black uppercase text-[10px] tracking-widest h-10 px-4 rounded-xl">
                  Dismiss
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Moderation;
