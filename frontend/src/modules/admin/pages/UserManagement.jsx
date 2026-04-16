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

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
      label: "", 
      render: (_, row) => (
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
            <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors">
              <Ban className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Block Account</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        data={mockUsers} 
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
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* User Hero */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-zinc-50 dark:bg-zinc-950/50 p-8 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
               
               <div className="w-24 h-24 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-4xl font-black text-primary p-1 shadow-2xl relative z-10 shrink-0">
                  <div className="w-full h-full rounded-[1.25rem] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
               </div>

               <div className="flex-1 space-y-4 text-center md:text-left relative z-10">
                  <div className="space-y-1">
                     <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{selectedUser.name}</h2>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                           {selectedUser.status}
                        </Badge>
                     </div>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">Registered on: {selectedUser.joinDate}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                     <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-zinc-900 dark:text-white">{selectedUser.phone}</span>
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">{selectedUser.location}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 relative z-10">
                  <Button className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-lg shadow-primary/20">
                     <UserCheck className="w-4 h-4 mr-2" />
                     Message User
                  </Button>
                  <Button variant="outline" className="border-rose-500/20 bg-rose-500/5 text-rose-500 font-black uppercase tracking-widest text-[10px] h-11 rounded-xl hover:bg-rose-500/10">
                     <Ban className="w-4 h-4 mr-2" />
                     Suspend Access
                  </Button>
               </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Lifetime Bookings", value: selectedUser.totalRequests, color: "text-primary" },
                { label: "Successful Hires", value: Math.floor(selectedUser.totalRequests * 0.8), color: "text-emerald-500" },
                { label: "Revenue Contribution", value: "₹12.4K", color: "text-zinc-900 dark:text-white" }
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-900 p-6 rounded-2xl flex flex-col gap-1 items-center md:items-start group hover:border-zinc-200 dark:border-zinc-800 transition-all">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                  <span className={cn("text-2xl font-black italic tracking-tighter", stat.color)}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Tabs placeholder for Detail View */}
            <div className="space-y-4">
               <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Recent Requirement History
               </h3>
               
               <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all">
                       <div className="space-y-1">
                          <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">House Shifting (Indore Local)</h4>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Completed on March 24, 2024 • ₹2,500 Lead Fee Paid</p>
                       </div>
                       <Button variant="ghost" size="sm" className="text-primary font-black uppercase text-[10px] tracking-widest mt-4 md:mt-0">
                          View Details
                       </Button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
