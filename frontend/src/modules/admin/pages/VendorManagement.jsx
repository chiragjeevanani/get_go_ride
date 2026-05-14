import React, { useState, useEffect } from 'react';
import { 
  Truck, Phone, MapPin, 
  Star, ShieldCheck, ShieldAlert,
  MoreVertical, Eye, Ban, CheckCircle2,
  Package, MapPinned, CreditCard,
  BarChart3, Settings2, FileText,
  Image as ImageIcon, ExternalLink,
  ShieldQuestion, XCircle, Loader2
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const VendorManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllVendors({ limit: 100 });
      setDrivers((res.data || []).map(v => ({
        id: v._id,
        name: v.name || 'Unnamed',
        phone: v.phone,
        location: v.location || v.nativeCity || 'N/A',
        status: v.status,
        subscriptionStatus: v.subscriptionStatus || 'Inactive',
        isVerified: v.isVerified,
        hasVerifiedBadge: v.hasVerifiedBadge,
        regNumber: v.vehicleRegNumber || 'N/A',
        vehicleType: v.vehicleType || 'N/A',
        capacity: v.vehicleCapacity || 'N/A',
        vehicleTypes: v.serviceCategories || [],
        documents: v.documents || [],
        stats: {
          rating: v.rating || 0,
          completed: v.leadsWon || 0,
          revenue: '₹0'
        },
        joinDate: new Date(v.createdAt).toLocaleDateString()
      })));
    } catch (err) {
      showToast('Failed to load partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleViewDriver = async (driver) => {
    setSelectedDriver({ ...driver, loadingDetails: true });
    setIsDetailModalOpen(true);
    setActiveTab("overview");
    
    try {
      const res = await vendorApi.getById(driver.id);
      if (res.data) {
        setSelectedDriver(prev => ({
          ...prev,
          ...res.data,
          documents: res.data.documents || [],
          loadingDetails: false
        }));
      }
    } catch (err) {
      console.error("Failed to fetch vendor details:", err);
      setSelectedDriver(prev => ({ ...prev, loadingDetails: false }));
    }
  };

  const handleApproveDriver = async (driverId) => {
    try {
      await adminApi.verifyVendor(driverId, 'Verified');
      setDrivers(prev => prev.map(v => v.id === driverId ? { ...v, status: 'Verified', isVerified: true } : v));
      if (selectedDriver?.id === driverId) {
        setSelectedDriver(prev => ({ ...prev, status: 'Verified', isVerified: true }));
      }
      showToast(`Partner account approved successfully`, 'success');
    } catch (err) {
      showToast('Failed to approve driver', 'error');
    }
  };

  const handleRejectDriver = async (driverId) => {
    try {
      await adminApi.verifyVendor(driverId, 'Rejected');
      setDrivers(prev => prev.map(v => v.id === driverId ? { ...v, status: 'Rejected', isVerified: false } : v));
      if (selectedDriver?.id === driverId) {
        setSelectedDriver(prev => ({ ...prev, status: 'Rejected', isVerified: false }));
      }
      showToast(`Partner account rejected`, 'error');
    } catch (err) {
      showToast('Failed to reject driver', 'error');
    }
  };

  const handleDocAction = async (docId, action) => {
    const newStatus = action === 'approve' ? 'Verified' : 'Rejected';
    try {
      await adminApi.verifyDocument(selectedDriver.id, docId, newStatus);
      
      setDrivers(prev => prev.map(v => {
        if (v.id === selectedDriver.id) {
          const newDocs = v.documents.map(d => d._id === docId ? { ...d, status: newStatus } : d);
          return { ...v, documents: newDocs };
        }
        return v;
      }));
      
      setSelectedDriver(prev => {
        const newDocs = prev.documents.map(d => d._id === docId ? { ...d, status: newStatus } : d);
        return { ...prev, documents: newDocs };
      });

      showToast(`Document ${action === 'approve' ? 'approved' : 'rejected'} successfully`, action === 'approve' ? 'success' : 'error');
    } catch (err) {
      console.error("Failed to verify document:", err);
      showToast('Failed to update document status', 'error');
    }
  };

  const columns = [
    { 
      key: "name", 
      label: "Driver", 
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] font-black text-primary border border-zinc-700 uppercase">
             {val.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-tight">{val}</span>
              {row.hasVerifiedBadge && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" title="Verified Badge" />
              )}
              {row.status === 'Rejected' && (
                <Badge variant="outline" className="bg-rose-50 text-rose-500 border-rose-100 text-[7px] font-black uppercase px-1.5 h-4">Rejected</Badge>
              )}
              {row.status === 'Pending' && (
                <Badge variant="outline" className="bg-amber-50 text-amber-500 border-amber-100 text-[7px] font-black uppercase px-1.5 h-4">Pending</Badge>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{row.regNumber}</span>
          </div>
        </div>
      )
    },
    { 
      key: "vehicleTypes", 
      label: "Fleet", 
      render: (val) => (
        <div className="flex flex-wrap gap-1">
           {val.map((type, i) => (
             <span key={i} className="text-[9px] font-black text-zinc-500 uppercase px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                {type}
             </span>
           ))}
        </div>
      )
    },
    { 
      key: "location", 
      label: "Base City", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
           <MapPin className="w-3 h-3 text-zinc-500" />
           <span className="text-xs font-black text-zinc-400 uppercase tracking-tight">{val}</span>
        </div>
      )
    },
    { 
      key: "subscriptionStatus", 
      label: "Subscription", 
      sortable: true,
      render: (val) => (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full w-fit text-[9px] font-black uppercase tracking-widest",
          val === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
           {val}
        </div>
      )
    },
    { 
      key: "rating", 
      label: "Rating", 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1">
           <Star className="w-3 h-3 text-primary fill-primary" />
           <span className="text-xs font-black text-zinc-900 dark:text-white">{val}</span>
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
              <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" onClick={() => handleViewDriver(row)}>
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Profile Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" onClick={() => { setSelectedDriver(row); setIsDetailModalOpen(true); setActiveTab("documents"); }}>
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Verify Documents</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors">
                <Ban className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Suspend Access</span>
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
        title="Driver Management" 
        subtitle="Approve and monitor service partners" 
        actions={
          <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl">
             Export Fleet List
          </Button>
        }
      />

      <DataTable 
        columns={columns} 
        data={drivers} 
        searchKey="name"
        searchPlaceholder="Filter partners by name..."
        onRowClick={handleViewDriver}
      />

      {/* Driver Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Partner Profile"
        description="Comprehensive view of driver history and fleet"
        size="md"
      >
        {selectedDriver && (
          <div className="space-y-4 pb-4">
            {/* Driver Hero */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100 relative overflow-hidden group">
               <div className="w-14 h-14 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-lg font-black text-primary shadow-md relative z-10 shrink-0">
                  <div className="w-full h-full rounded-xl bg-zinc-50 flex items-center justify-center">
                    {selectedDriver.name.split(' ').map(n => n[0]).join('')}
                  </div>
               </div>

               <div className="flex-1 space-y-2 text-center md:text-left relative z-10 text-zinc-900">
                  <div className="space-y-0.5">
                     <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                        <h2 className="text-lg font-black uppercase italic tracking-tighter">{selectedDriver.name}</h2>
                        {selectedDriver.isVerified && (
                           <div className="p-0.5 px-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5 text-primary" />
                              <span className="text-[7px] font-black text-primary uppercase tracking-widest">Verified Partner</span>
                           </div>
                        )}
                     </div>
                     <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Joined: {selectedDriver.joinDate}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                     <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-zinc-100">
                        <Phone className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-black">{selectedDriver.phone}</span>
                     </div>
                     <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-zinc-100">
                        <CreditCard className={cn("w-3 h-3", selectedDriver.subscriptionStatus === 'Active' ? "text-emerald-500" : "text-rose-500")} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Plan: {selectedDriver.subscriptionStatus}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-1.5 w-full md:w-auto shrink-0 relative z-10">
                  <Button 
                    className="bg-primary text-black font-black uppercase tracking-widest text-[8px] h-8 px-4 rounded-lg shadow-sm shadow-primary/20"
                    onClick={() => handleApproveDriver(selectedDriver.id)}
                  >
                     <CheckCircle2 className="w-3 h-3 mr-1" />
                     Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-rose-100 bg-rose-50 text-rose-500 font-black uppercase tracking-widest text-[8px] h-8 px-4 rounded-lg hover:bg-rose-100"
                    onClick={() => handleRejectDriver(selectedDriver.id)}
                  >
                     <ShieldAlert className="w-3 h-3 mr-1" />
                     Reject
                  </Button>
               </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
               <TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl w-full max-w-xs">
                  <TabsTrigger value="overview" className="rounded-lg font-black text-[9px] uppercase tracking-widest py-2 data-[state=active]:bg-primary data-[state=active]:text-black">
                     Dashboard Overview
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="rounded-lg font-black text-[9px] uppercase tracking-widest py-2 data-[state=active]:bg-primary data-[state=active]:text-black">
                     Verification Docs
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="overview" className="space-y-3">
                  {/* Driver Grid Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {/* Fleet Info */}
                     <div className="admin-card p-3 bg-zinc-50">
                        <h3 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                           <Truck className="w-3 h-3 text-primary" />
                           Fleet & Vehicle Info
                        </h3>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center py-1.5 border-b border-zinc-200 dark:border-zinc-900 font-bold">
                              <span className="text-[9px] text-zinc-500 uppercase">Vehicle Model</span>
                              <span className="text-[10px] text-zinc-900 dark:text-white uppercase tracking-widest">{selectedDriver.vehicleType}</span>
                           </div>
                           <div className="flex justify-between items-center py-1.5 border-b border-zinc-200 dark:border-zinc-900 font-bold">
                              <span className="text-[9px] text-zinc-500 uppercase">Reg Number</span>
                              <span className="text-[10px] text-zinc-900 dark:text-white uppercase tracking-widest">{selectedDriver.regNumber}</span>
                           </div>
                           <div className="flex justify-between items-center py-1.5 border-b border-zinc-200 dark:border-zinc-900 font-bold">
                              <span className="text-[9px] text-zinc-500 uppercase">Load Capacity</span>
                              <span className="text-[10px] text-zinc-900 dark:text-white uppercase">{selectedDriver.capacity}</span>
                           </div>
                           <div className="flex justify-between items-center py-1.5 border-b border-zinc-200 dark:border-zinc-900 font-bold">
                              <span className="text-[9px] text-zinc-500 uppercase">Vehicle Types</span>
                              <div className="flex gap-1">
                                 {selectedDriver.vehicleTypes.map(v => (
                                    <Badge key={v} className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[7px] font-black uppercase px-1.5">{v}</Badge>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Performance Metrics */}
                     <div className="admin-card p-3 bg-zinc-50">
                        <h3 className="text-[9px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                           <BarChart3 className="w-3 h-3 text-primary" />
                           Performance
                        </h3>
                        <div className="grid grid-cols-2 gap-2.5">
                           <div className="p-2 rounded-lg bg-white border border-zinc-100 flex flex-col items-center">
                              <span className="text-[7px] font-black text-zinc-400 uppercase">Avg Rating</span>
                              <div className="flex items-center gap-1 text-primary">
                                 <Star className="w-2.5 h-2.5 fill-primary" />
                                 <span className="text-sm font-black italic">{selectedDriver.rating}</span>
                              </div>
                           </div>
                           <div className="p-2 rounded-lg bg-white border border-zinc-100 flex flex-col items-center">
                              <span className="text-[7px] font-black text-zinc-400 uppercase">Leads Won</span>
                              <span className="text-sm font-black text-zinc-900 italic">42</span>
                           </div>
                           <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
                              <span className="text-[8px] font-black text-zinc-600 uppercase">Reliability</span>
                              <span className="text-base font-black text-emerald-500 italic">98%</span>
                           </div>
                           <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">
                              <span className="text-[8px] font-black text-zinc-600 uppercase">Subscription</span>
                              <span className="text-[9px] font-black text-zinc-900 dark:text-white uppercase italic">Premium</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Operating Routes */}
                  <div className="admin-card p-4 bg-zinc-50 dark:bg-zinc-950/20">
                     <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-3">
                        <MapPinned className="w-3 h-3 text-primary" />
                        Primary Routes & Service Areas
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {['Indore Local', 'Indore to Bhopal', 'Indore to Ujjain'].map((route) => (
                           <div key={route} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg flex items-center justify-center">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{route}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </TabsContent>
                <TabsContent value="documents" className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedDriver.loadingDetails ? (
                         [1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 w-full bg-zinc-100 animate-pulse rounded-xl" />
                         ))
                      ) : selectedDriver.documents && selectedDriver.documents.length > 0 ? (
                        selectedDriver.documents.map((doc) => (
                         <div key={doc.id || doc._id} className="admin-card p-4 border-zinc-200 hover:border-layers transition-all group bg-white">
                            <div className="flex items-start justify-between mb-3">
                               <div className="flex gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                     <FileText className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                                  </div>
                                  <div className="space-y-0.5">
                                     <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{doc.title || 'Document'}</h4>
                                     <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">{doc.date || 'No Date'}</p>
                                  </div>
                               </div>
                               <Badge className={cn(
                                  "text-[7px] font-black uppercase tracking-widest border-none px-2 py-0.5 h-5",
                                  doc.status === 'Verified' ? "bg-emerald-500/10 text-emerald-500" :
                                  doc.status === 'Pending' ? "bg-amber-500/10 text-amber-500" :
                                  "bg-rose-500/10 text-rose-500"
                               )}>
                                  {doc.status}
                               </Badge>
                            </div>

                            <div className="h-28 w-full rounded-xl bg-zinc-50 border border-zinc-100 mb-3 flex items-center justify-center relative overflow-hidden">
                               {(doc.fileUrl || doc.url) ? (
                                 <img src={doc.fileUrl || doc.url} alt={doc.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                               ) : (
                                 <span className="text-[7px] font-black text-zinc-400 uppercase italic">No Preview Available</span>
                               )}
                               <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <Button 
                                    variant="outline" 
                                    className="h-7 border-white/20 bg-white/10 text-white text-[7px] font-black uppercase tracking-widest rounded-lg"
                                    onClick={() => setPreviewDoc(doc)}
                                  >
                                     <ExternalLink className="w-2.5 h-2.5 mr-1.5" />
                                     Review Large
                                  </Button>
                               </div>
                            </div>

                            <div className="flex gap-2">
                               {doc.status !== 'Verified' && (
                                  <Button 
                                    className="flex-1 bg-emerald-500 text-white font-black uppercase text-[7px] tracking-widest h-7 rounded-lg shadow-md shadow-emerald-500/10"
                                    onClick={() => handleDocAction(doc.id || doc._id, 'approve')}
                                  >
                                     Approve
                                  </Button>
                               )}
                               {doc.status !== 'Rejected' && (
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 border-rose-100 bg-rose-50 text-rose-500 font-black uppercase text-[7px] tracking-widest h-7 rounded-lg"
                                    onClick={() => handleDocAction(doc.id || doc._id, 'reject')}
                                  >
                                     Reject
                                  </Button>
                               )}
                            </div>
                         </div>
                        ))
                      ) : (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                           <FileText className="w-8 h-8 text-zinc-300 mb-2" />
                           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No verification documents uploaded yet</p>
                        </div>
                      )}
                   </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                     <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                           <ShieldQuestion className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                           <h4 className="text-[9px] font-black text-zinc-900 dark:text-white uppercase tracking-widest">Verification Status</h4>
                           <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest italic">All documents must be verified for the "Verified Partner" badge.</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-primary italic">
                          {selectedDriver.documents?.filter(d => d.status === 'Verified').length || 0} / {selectedDriver.documents?.length || 0}
                        </p>
                        <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Docs Verified</p>
                     </div>
                  </div>
               </TabsContent>t>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title}
        description="High-resolution document verification view"
        size="lg"
        compact={true}
      >
        {previewDoc && (
          <div className="space-y-3">
            <div className="h-[320px] w-full rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(252,211,77,0.05)_0%,transparent_100%)]" />
               {(previewDoc.fileUrl || previewDoc.url) ? (
                 <img 
                   src={previewDoc.fileUrl || previewDoc.url} 
                   alt={previewDoc.title} 
                   className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105" 
                 />
               ) : (
                 <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center shadow-lg">
                       <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-zinc-900 uppercase italic tracking-tighter">No Preview Available</p>
                       <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">ID: {previewDoc.id || 'N/A'}</p>
                    </div>
                 </div>
               )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
               <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 flex flex-col justify-center">
                  <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Metadata</span>
                  <p className="text-[9px] font-black text-zinc-900 uppercase">Uploaded: {previewDoc.date}</p>
               </div>
               <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 flex flex-col justify-center">
                  <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Status</span>
                  <div className="flex items-center">
                    <Badge className={cn(
                      "text-[8px] border-none font-black uppercase px-2 h-4",
                      previewDoc.status === 'Verified' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {previewDoc.status}
                    </Badge>
                  </div>
               </div>
            </div>

            <div className="flex gap-2 pt-1">
               {previewDoc.status !== 'Verified' && (
                  <Button 
                    className="flex-1 bg-emerald-500 text-white font-black h-9 rounded-lg uppercase tracking-widest text-[9px]"
                    onClick={() => { handleDocAction(previewDoc._id || previewDoc.id, 'approve'); setPreviewDoc(null); }}
                  >
                    Approve
                  </Button>
               )}
               <Button 
                 variant="outline" 
                 className="flex-1 border-rose-100 bg-rose-50 text-rose-500 font-black h-9 rounded-lg uppercase tracking-widest text-[9px]"
                 onClick={() => { handleDocAction(previewDoc._id || previewDoc.id, 'reject'); setPreviewDoc(null); }}
               >
                 Reject
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

export default VendorManagement;
