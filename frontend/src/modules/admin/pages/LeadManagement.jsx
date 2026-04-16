import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, MapPin, Calendar, 
  MessageSquare, User, CheckCircle2,
  Clock, ArrowRight, Filter,
  MoreVertical, Eye, Trash2,
  Package, Info, Briefcase
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockLeads } from '../data/mockData';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LeadManagement = () => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const columns = [
    { 
      key: "serviceType", 
      label: "Service Category", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
             <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <span className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-tight">{val}</span>
        </div>
      )
    },
    { 
      key: "userName", 
      label: "Posted By", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
           <User className="w-3 h-3 text-zinc-500" />
           <span className="text-xs font-black text-zinc-400 uppercase tracking-tighter">{val}</span>
        </div>
      )
    },
    { 
      key: "location", 
      label: "Route/City", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
           <MapPin className="w-3 h-3 text-zinc-500" />
           <span className="text-xs font-black text-zinc-400 uppercase tracking-tight">{val}</span>
        </div>
      )
    },
    { 
      key: "date", 
      label: "Posted Date", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
           <Calendar className="w-3 h-3 text-zinc-500" />
           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{val}</span>
        </div>
      )
    },
    { 
      key: "status", 
      label: "Lead Status", 
      sortable: true,
      render: (val) => (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full w-fit text-[9px] font-black uppercase tracking-widest",
          val === 'Finalized' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : 
          val === 'Responded' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
          "bg-amber-500/10 text-amber-500 border border-amber-500/20"
        )}>
           <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", 
             val === 'Finalized' ? "bg-emerald-500" : 
             val === 'Responded' ? "bg-blue-500" :
             "bg-amber-500"
           )} />
           {val}
        </div>
      )
    },
    { 
      key: "actions", 
      label: "", 
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 dark:text-white">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl p-1 w-44">
            <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" onClick={() => handleViewLead(row)}>
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Lead Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">View Chats</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Delete Lead</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Lead Management" 
        subtitle="Monitor full lead lifecycle and platform demand" 
      />

      <DataTable 
        columns={columns} 
        data={mockLeads} 
        searchKey="serviceType"
        searchPlaceholder="Find leads by service category..."
        onRowClick={handleViewLead}
      />

      {/* Lead Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Lead Insight"
        description="Comprehensive requirement details and activity"
        size="lg"
      >
        {selectedLead && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 flex flex-col gap-1 ring-1 ring-zinc-800/50 ring-inset">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Category</span>
                  <span className="text-lg font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase">{selectedLead.serviceType}</span>
               </div>
               <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 flex flex-col gap-1 ring-1 ring-zinc-800/50 ring-inset">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Posted On</span>
                  <span className="text-lg font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase">{selectedLead.date}</span>
               </div>
               <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 flex flex-col gap-1 ring-1 ring-zinc-800/50 ring-inset">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Responses</span>
                  <span className="text-lg font-black text-primary italic tracking-tighter uppercase">{selectedLead.responses} Vendors</span>
               </div>
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left: Lead Details */}
               <div className="lg:col-span-2 space-y-8">
                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Requirement Description
                     </h4>
                     <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-400 font-bold leading-relaxed uppercase tracking-tight italic">
                        "{selectedLead.description}"
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Lead Lifecycle Timeline
                     </h4>
                     <div className="space-y-6 relative ml-4 pl-8 border-l-2 border-zinc-200 dark:border-zinc-900">
                        {[
                          { title: "Lead Created", time: "Feb 10, 11:30 AM", status: "completed" },
                          { title: "First Response", time: "Feb 10, 11:45 AM", status: "completed" },
                          { title: selectedLead.status, time: "Feb 12, 02:15 PM", status: "current" }
                        ].map((event, i) => (
                           <div key={i} className="relative group">
                              <div className={cn(
                                "absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-zinc-950 shadow-sm transition-all",
                                event.status === 'completed' ? "bg-emerald-500" : "bg-primary animate-pulse"
                              )} />
                              <div className="space-y-1">
                                 <h5 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{event.title}</h5>
                                 <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{event.time}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Right: Summary & Stats */}
               <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border-2 border-primary/20 relative overflow-hidden group">
                     <div className="relative z-10 space-y-4">
                        <div className="space-y-1">
                           <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Platform Status</h4>
                           <p className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-2">
                              {selectedLead.status}
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                           </p>
                        </div>
                        <Button className="w-full bg-primary text-black font-black uppercase text-[10px] tracking-widest h-10 rounded-xl shadow-lg shadow-primary/20">
                           Force Close Lead
                        </Button>
                     </div>
                     <Layers className="absolute -right-4 -bottom-4 w-24 h-24 text-primary opacity-5 rotate-[-15deg] group-hover:opacity-10 transition-opacity" />
                  </div>

                  <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
                     <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Route Details</h4>
                     <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 mt-1">
                           <div className="w-2 h-2 rounded-full bg-zinc-700" />
                           <div className="w-0.5 h-8 bg-zinc-800" />
                           <MapPin className="w-3 h-3 text-primary" />
                        </div>
                        <div className="space-y-4 flex-1">
                           <div className="space-y-0.5">
                              <span className="text-[8px] font-black text-zinc-600 uppercase">From</span>
                              <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">{selectedLead.location.split(' to ')[0]}</p>
                           </div>
                           <div className="space-y-0.5">
                              <span className="text-[8px] font-black text-zinc-600 uppercase">To</span>
                              <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">{selectedLead.location.split(' to ')[1] || 'Local Area'}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeadManagement;
