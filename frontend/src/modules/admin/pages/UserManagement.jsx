import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, 
  Calendar, ShieldCheck, ShieldAlert,
  MoreVertical, Eye, Ban, UserCheck
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
import { mockUsers } from '../data/mockData';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleToggleStatus = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Active' ? 'Blocked' : 'Active';
        return { ...u, status: newStatus };
      }
      return u;
    }));
    
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => {
        const newStatus = prev.status === 'Active' ? 'Blocked' : 'Active';
        showToast(`User account ${newStatus === 'Active' ? 'activated' : 'suspended'}`, newStatus === 'Active' ? 'success' : 'error');
        return {
          ...prev,
          status: newStatus
        };
      });
    } else {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
      showToast(`User account ${newStatus === 'Active' ? 'activated' : 'suspended'}`, newStatus === 'Active' ? 'success' : 'error');
    }
  };

  const handleMessageUser = (user) => {
    setIsMessageSent(true);
    showToast(`Message successfully sent to ${user.name}`, 'success');
    setTimeout(() => setIsMessageSent(false), 3000);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const columns = [
    { 
      key: "name", 
      label: "User Profile", 
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-xs font-black text-primary border border-zinc-700 uppercase">
             {val.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-tight">{val}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">ID: {row.id}</span>
          </div>
        </div>
      )
    },
    { 
      key: "phone", 
      label: "Contact", 
      render: (val) => (
        <div className="flex items-center gap-2">
           <Phone className="w-3 h-3 text-zinc-500" />
           <span className="text-xs font-black text-zinc-400">{val}</span>
        </div>
      )
    },
    { 
      key: "location", 
      label: "Location", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
           <MapPin className="w-3 h-3 text-zinc-500" />
           <span className="text-xs font-black text-zinc-400 uppercase tracking-tight">{val}</span>
        </div>
      )
    },
    { 
      key: "totalRequests", 
      label: "Requests", 
      sortable: true,
      render: (val) => (
        <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-[10px] font-black text-primary px-3 rounded-full">
           {val}
        </Badge>
      )
    },
    { 
      key: "status", 
      label: "Account Status", 
      sortable: true,
      render: (val) => (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full w-fit text-[9px] font-black uppercase tracking-widest",
          val === 'Active' ? "bg-emerald-500/10 text-emerald-500 shadow-sm shadow-emerald-500/10" : "bg-rose-500/10 text-rose-500 shadow-sm shadow-rose-500/10"
        )}>
           <div className={cn("w-1.5 h-1.5 rounded-full ring-4 ring-opacity-20", val === 'Active' ? "bg-emerald-500 ring-emerald-500" : "bg-rose-500 ring-rose-500")} />
           {val}
        </div>
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
              <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" onClick={() => handleViewUser(row)}>
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" onClick={() => handleToggleStatus(row.id)}>
                <Ban className={cn("w-4 h-4", row.status === 'Active' ? "text-rose-500" : "text-emerald-500")} />
                <span className="text-[10px] font-black uppercase tracking-widest">{row.status === 'Active' ? 'Block Account' : 'Activate Account'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="User Management" 
        subtitle="Manage and monitor platform customers" 
      />

      <DataTable 
        columns={columns} 
        data={users} 
        searchKey="name"
        searchPlaceholder="Find users by name or id..."
        onRowClick={handleViewUser}
      />

      {/* User Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Customer Profile"
        description="Detailed view of user activity and status"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* User Hero */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-zinc-50 border border-zinc-100 p-6 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
               
               <div className="w-20 h-20 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-2xl font-black text-primary shadow-lg relative z-10 shrink-0">
                  <div className="w-full h-full rounded-2xl bg-zinc-50 flex items-center justify-center">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
               </div>

               <div className="flex-1 space-y-3 text-center md:text-left relative z-10">
                  <div className="space-y-1">
                     <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                        <h2 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter">{selectedUser.name}</h2>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                           {selectedUser.status}
                        </Badge>
                     </div>
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Joined: {selectedUser.joinDate}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-zinc-100">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black text-zinc-900">{selectedUser.phone}</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-zinc-100">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tight">{selectedUser.location}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 relative z-10">
                  <Button 
                    className={cn(
                      "bg-primary text-black font-black uppercase tracking-widest text-[9px] h-9 rounded-lg shadow-md transition-all",
                      isMessageSent ? "bg-emerald-500 text-white shadow-emerald-500/20" : "shadow-primary/20"
                    )}
                    onClick={() => handleMessageUser(selectedUser)}
                  >
                     {isMessageSent ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <UserCheck className="w-3.5 h-3.5 mr-1" />}
                     {isMessageSent ? 'Message Sent' : 'Message'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "font-black uppercase tracking-widest text-[9px] h-9 rounded-lg transition-colors",
                      selectedUser.status === 'Active' 
                        ? "border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100" 
                        : "border-emerald-100 bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                    )}
                    onClick={() => handleToggleStatus(selectedUser.id)}
                  >
                     <Ban className="w-3.5 h-3.5 mr-1" />
                     {selectedUser.status === 'Active' ? 'Suspend' : 'Activate'}
                  </Button>
               </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Lifetime Bookings", value: selectedUser.totalRequests, color: "text-primary" },
                { label: "Successful Hires", value: Math.floor(selectedUser.totalRequests * 0.8), color: "text-emerald-500" },
                { label: "Revenue", value: "₹12.4K", color: "text-zinc-900" }
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-zinc-100 p-4 rounded-xl flex flex-col gap-0.5 items-center md:items-start group hover:border-zinc-200 transition-all shadow-sm">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                  <span className={cn("text-xl font-black italic tracking-tighter", stat.color)}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Tabs placeholder for Detail View */}
            <div className="space-y-3">
               <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Recent Activity
               </h3>
               
               <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-2.5 px-4 bg-white border border-zinc-100 rounded-lg hover:border-primary/20 transition-all group/item shadow-sm">
                       <div className="space-y-0">
                          <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">House Shifting (Indore Local)</h4>
                          <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest italic">March 24, 2024 • ₹2,500 Lead Fee</p>
                       </div>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="text-primary font-black uppercase text-[8px] tracking-widest mt-2 md:mt-0 h-6 px-3 hover:bg-primary/5 rounded-md"
                         onClick={() => alert('Opening requirement snapshot for: House Shifting (Indore Local)')}
                       >
                          View Details
                       </Button>
                    </div>
                  ))}
               </div>
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

export default UserManagement;
