import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, 
  Calendar, ShieldCheck, ShieldAlert,
  MoreVertical, Eye, Ban, UserCheck, Loader2, CheckCircle2
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';
import { adminApi } from '@/lib/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllUsers({ limit: 100 });
      setUsers((res.data || []).map(u => ({
        id: u._id,
        name: u.name || 'Unknown',
        phone: u.phone,
        location: u.location || 'N/A',
        status: u.status,
        joinDate: new Date(u.createdAt).toLocaleDateString(),
        totalRequests: 0 // Mocked until we aggregate
      })));
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u.id === userId);
    const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
    
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`User account ${newStatus === 'Active' ? 'activated' : 'suspended'}`, newStatus === 'Active' ? 'success' : 'error');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleMessageUser = (user) => {
    setIsMessageSent(true);
    showToast(`Message successfully sent to ${user.name}`, 'success');
    setTimeout(() => setIsMessageSent(false), 3000);
  };

  const handleViewUser = async (user) => {
    // Open immediately with local data to provide instantaneous user feedback
    setSelectedUser({
      ...user,
      recentActivity: [],
      successfulHires: 0,
      revenue: 0,
      loadingDetails: true
    });
    setIsDetailModalOpen(true);

    try {
      const res = await adminApi.getUserById(user.id);
      if (res.success && res.data) {
        setSelectedUser({
          id: res.data._id,
          name: res.data.name || 'Unknown',
          phone: res.data.phone,
          location: res.data.location || 'N/A',
          status: res.data.status,
          joinDate: new Date(res.data.createdAt).toLocaleDateString(),
          totalRequests: res.data.totalRequests || 0,
          successfulHires: res.data.successfulHires || 0,
          revenue: res.data.revenue || 0,
          recentActivity: res.data.recentActivity || [],
          loadingDetails: false
        });
      }
    } catch (err) {
      showToast('Failed to load customer profile details', 'error');
      setSelectedUser(prev => prev ? { ...prev, loadingDetails: false } : null);
    }
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
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            {/* User Hero */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-50 border border-zinc-100 p-4 rounded-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
               
               <div className="w-14 h-14 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-lg font-black text-primary shadow-md relative z-10 shrink-0">
                  <div className="w-full h-full rounded-xl bg-zinc-50 flex items-center justify-center">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
               </div>

               <div className="flex-1 space-y-2 text-center md:text-left relative z-10">
                  <div className="space-y-0.5">
                     <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                        <h2 className="text-lg font-black text-zinc-900 uppercase italic tracking-tighter">{selectedUser.name}</h2>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                           {selectedUser.status}
                        </Badge>
                     </div>
                     <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Joined: {selectedUser.joinDate}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                     <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-zinc-100">
                        <Phone className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-black text-zinc-900">{selectedUser.phone}</span>
                     </div>
                     <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-zinc-100">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-black text-zinc-900 uppercase tracking-tight">{selectedUser.location}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-1.5 w-full md:w-auto shrink-0 relative z-10">
                  <Button 
                    className={cn(
                      "bg-primary text-black font-black uppercase tracking-widest text-[8px] h-8 px-4 rounded-lg shadow-sm transition-all",
                      isMessageSent ? "bg-emerald-500 text-white shadow-emerald-500/10" : "shadow-primary/10"
                    )}
                    onClick={() => handleMessageUser(selectedUser)}
                  >
                     {isMessageSent ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
                     {isMessageSent ? 'Message Sent' : 'Message'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "font-black uppercase tracking-widest text-[8px] h-8 px-4 rounded-lg transition-colors",
                      selectedUser.status === 'Active' 
                        ? "border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100" 
                        : "border-emerald-100 bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                    )}
                    onClick={() => handleToggleStatus(selectedUser.id)}
                  >
                     <Ban className="w-3 h-3 mr-1" />
                     {selectedUser.status === 'Active' ? 'Suspend' : 'Activate'}
                  </Button>
               </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "Lifetime Bookings", value: selectedUser.totalRequests || 0, color: "text-primary" },
                { label: "Successful Hires", value: selectedUser.successfulHires || 0, color: "text-emerald-500" },
                { label: "Revenue / Spent", value: `₹${(selectedUser.revenue || 0).toLocaleString('en-IN')}`, color: "text-zinc-900 dark:text-white" }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl flex flex-col items-center md:items-start group hover:border-zinc-200 dark:hover:border-zinc-700 transition-all shadow-sm">
                  <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                  {selectedUser.loadingDetails ? (
                    <div className="w-10 h-4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded mt-1" />
                  ) : (
                    <span className={cn("text-lg font-black italic tracking-tighter", stat.color)}>{stat.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="space-y-2.5">
               <h3 className="text-[9px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-primary" />
                  Recent Activity
               </h3>
               
               {selectedUser.loadingDetails ? (
                 <div className="space-y-2">
                   {[1, 2].map((i) => (
                     <div key={i} className="h-12 w-full bg-zinc-100 dark:bg-zinc-900/50 animate-pulse rounded-lg border border-zinc-200/50 dark:border-zinc-800/50" />
                   ))}
                 </div>
               ) : selectedUser.recentActivity && selectedUser.recentActivity.length > 0 ? (
                 <div className="space-y-1.5">
                    {selectedUser.recentActivity.map((item, i) => (
                      <div key={item.id || i} className="flex flex-col md:flex-row md:items-center justify-between p-2 px-3 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 rounded-lg hover:border-primary/20 transition-all group/item shadow-sm">
                         <div className="space-y-0.5">
                            <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                              {item.serviceType === 'goods' ? 'Goods Transport' : item.serviceType === 'house' ? 'House Shifting' : item.serviceType === 'emergency' ? 'Emergency Towing' : 'Construction Hauling'} ({item.pickup.split(',')[0]})
                            </h4>
                            <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest italic">
                              {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {item.amount > 0 ? `₹${item.amount.toLocaleString('en-IN')} Lead Price` : 'No accepted bid'} • <span className={cn("font-black uppercase", item.status === 'completed' ? "text-emerald-500" : item.status === 'accepted' ? "text-primary" : "text-zinc-500")}>{item.status}</span>
                            </p>
                         </div>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="text-primary font-black uppercase text-[7px] tracking-widest mt-1 md:mt-0 h-5 px-2 hover:bg-primary/5 rounded-md"
                           onClick={() => alert(`Pickup: ${item.pickup}\nDropoff: ${item.drops}\nDate: ${new Date(item.date).toLocaleDateString()}\nStatus: ${item.status}`)}
                         >
                            View Details
                         </Button>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                   <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">No recent requirements or bookings found</p>
                 </div>
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

export default UserManagement;
