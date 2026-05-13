import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Flag,
  MessageSquare, User, Box, AlertTriangle,
  MoreVertical, CheckCircle2, XCircle, Loader2
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import { adminApi } from '@/lib/api';

const Moderation = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedReq, setSelectedReq] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllRequirements({ limit: 100 });
      setRequirements((res.data || []).map(req => ({
        id: req._id,
        user: req.user?.name || 'Unknown',
        type: req.serviceType,
        status: req.status,
        date: new Date(req.createdAt).toLocaleDateString(),
        description: req.notes || req.items || 'No description'
      })));
    } catch (err) {
      showToast('Failed to load requirements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminApi.updateRequirementStatus(id, newStatus);
      setRequirements(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      if (selectedReq?.id === id) {
        setSelectedReq(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`Requirement marked as ${newStatus}`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const filteredReqs = requirements.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'cancelled') return r.status === 'cancelled';
    if (activeFilter === 'active') return ['pending', 'bidding'].includes(r.status);
    return true;
  });

  const columns = [
    { 
      key: "user", 
      label: "User", 
      render: (val) => (
        <div className="flex items-center gap-2">
           <User className="w-3.5 h-3.5 text-zinc-500" />
           <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">{val}</span>
        </div>
      )
    },
    { 
      key: "type", 
      label: "Service Type", 
      render: (val) => (
        <div className="flex items-center gap-2">
           <Box className="w-3.5 h-3.5 text-zinc-500" />
           <span className="text-xs font-black text-zinc-400 uppercase tracking-tight">{val}</span>
        </div>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (val) => (
        <Badge variant="outline" className={cn(
          "font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-full border",
          val === 'cancelled' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
          ['pending', 'bidding'].includes(val) ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        )}>
           {val}
        </Badge>
      )
    },
    { 
      key: "date", 
      label: "Date Posted", 
      render: (val) => (
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{val}</span>
      )
    },
    { 
      key: "actions", 
      label: "ACTIONS", 
      align: "right",
      render: (_, row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 dark:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl p-1 w-44">
              <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" onClick={() => { setSelectedReq(row); setIsDetailModalOpen(true); }}>
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
              </DropdownMenuItem>
              {row.status !== 'cancelled' && (
                <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors text-rose-500" onClick={() => handleUpdateStatus(row.id, 'cancelled')}>
                  <XCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cancel Requirement</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Requirement Oversight" 
        subtitle="Monitor and moderate platform requirements" 
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2 w-full sm:w-auto">
          {['all', 'active', 'cancelled'].map(filter => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "font-black uppercase tracking-widest text-[9px] h-9 rounded-xl flex-1 sm:flex-none transition-all",
                activeFilter === filter ? "bg-primary text-black" : "bg-white text-zinc-500 hover:text-zinc-900 border-zinc-200"
              )}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2">
        <DataTable 
          columns={columns} 
          data={filteredReqs} 
          searchKey="user"
          searchPlaceholder="Search requirements by user..."
          onRowClick={(row) => { setSelectedReq(row); setIsDetailModalOpen(true); }}
        />
      </div>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Requirement Details"
        description="Full text and status of the requirement"
        size="md"
      >
        {selectedReq && (
          <div className="space-y-6">
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <User className="w-4 h-4 text-zinc-400" />
                     <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">{selectedReq.user}</span>
                  </div>
                  <Badge variant="outline" className="bg-white border-zinc-200 text-zinc-500 font-black uppercase text-[8px] tracking-widest px-2 py-0.5">
                     {selectedReq.date}
                  </Badge>
               </div>
               
               <div className="p-4 bg-white border border-zinc-100 rounded-xl">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <MessageSquare className="w-3.5 h-3.5 text-primary" />
                     Description
                  </h4>
                  <p className="text-xs text-zinc-700 font-bold leading-relaxed italic uppercase tracking-tight">"{selectedReq.description}"</p>
               </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
               {selectedReq.status !== 'cancelled' && (
                 <Button 
                   variant="destructive" 
                   className="font-black uppercase tracking-widest text-[9px] h-10 rounded-xl"
                   onClick={() => handleUpdateStatus(selectedReq.id, 'cancelled')}
                 >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Requirement
                 </Button>
               )}
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
