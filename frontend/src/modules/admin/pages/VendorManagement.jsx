import React, { useState } from 'react';
import { 
  Truck, Phone, MapPin, 
  Star, ShieldCheck, ShieldAlert,
  MoreVertical, Eye, Ban, CheckCircle2,
  Package, MapPinned, CreditCard,
  BarChart3, Settings2, FileText,
  Image as ImageIcon, ExternalLink,
  ShieldQuestion, XCircle
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
import { mockVendors } from '../data/mockData';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const VendorManagement = () => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setIsDetailModalOpen(true);
    setActiveTab("overview");
  };

  const columns = [
    { 
      key: "name", 
      label: "Vendor", 
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] font-black text-primary border border-zinc-700 uppercase">
             {val.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-tight">{val}</span>
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
      label: "", 
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 dark:text-white">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl p-1 w-44">
            <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" onClick={() => handleViewVendor(row)}>
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Profile Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" onClick={() => { setSelectedVendor(row); setIsDetailModalOpen(true); setActiveTab("documents"); }}>
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-widest">Verify Documents</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors">
              <Ban className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Suspend Access</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Vendor Management" 
        subtitle="Approve and monitor service partners" 
        actions={
          <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl">
             Export Fleet List
          </Button>
        }
      />

      <DataTable 
        columns={columns} 
        data={mockVendors} 
        searchKey="name"
        searchPlaceholder="Find vendors by name, reg number or city..."
        onRowClick={handleViewVendor}
      />

      {/* Vendor Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Partner Profile"
        description="Comprehensive view of vendor history and fleet"
        size="lg"
      >
        {selectedVendor && (
          <div className="space-y-8 pb-10">
            {/* Vendor Hero */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-zinc-50 dark:bg-zinc-950/50 p-8 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden group">
               <div className="w-24 h-24 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-4xl font-black text-primary p-1 shadow-2xl relative z-10 shrink-0">
                  <div className="w-full h-full rounded-[1.25rem] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                    {selectedVendor.name.split(' ').map(n => n[0]).join('')}
                  </div>
               </div>

               <div className="flex-1 space-y-4 text-center md:text-left relative z-10 text-zinc-900 dark:text-white">
                  <div className="space-y-1">
                     <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">{selectedVendor.name}</h2>
                        {selectedVendor.isVerified && (
                           <div className="p-1 px-3 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3 text-primary" />
                              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Verified Partner</span>
                           </div>
                        )}
                     </div>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">Joined platform: {selectedVendor.joinDate}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                     <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black">{selectedVendor.phone}</span>
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <CreditCard className={cn("w-4 h-4", selectedVendor.subscriptionStatus === 'Active' ? "text-emerald-500" : "text-rose-500")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Plan: {selectedVendor.subscriptionStatus}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 relative z-10">
                  <Button className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-lg shadow-primary/20">
                     <CheckCircle2 className="w-4 h-4 mr-2" />
                     Approve Partner
                  </Button>
                  <Button variant="outline" className="border-rose-500/20 bg-rose-500/5 text-rose-500 font-black uppercase tracking-widest text-[10px] h-11 rounded-xl hover:bg-rose-500/10">
                     <ShieldAlert className="w-4 h-4 mr-2" />
                     Reject Application
                  </Button>
               </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
               <TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-2xl w-full max-w-sm">
                  <TabsTrigger value="overview" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-primary data-[state=active]:text-black">
                     Dashboard Overview
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-primary data-[state=active]:text-black">
                     Verification Docs
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="overview" className="space-y-6">
                  {/* Vendor Grid Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Fleet Info */}
                     <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20">
                        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                           <Truck className="w-4 h-4 text-primary" />
                           Fleet & Vehicle Info
                        </h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-900 font-bold">
                              <span className="text-[10px] text-zinc-500 uppercase">Reg Number</span>
                              <span className="text-xs text-zinc-900 dark:text-white uppercase tracking-widest">{selectedVendor.regNumber}</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-900 font-bold">
                              <span className="text-[10px] text-zinc-500 uppercase">Load Capacity</span>
                              <span className="text-xs text-zinc-900 dark:text-white uppercase">{selectedVendor.capacity}</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-900 font-bold">
                              <span className="text-[10px] text-zinc-500 uppercase">Vehicle Types</span>
                              <div className="flex gap-1">
                                 {selectedVendor.vehicleTypes.map(v => (
                                    <Badge key={v} className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase">{v}</Badge>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Performance Metrics */}
                     <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20">
                        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                           <BarChart3 className="w-4 h-4 text-primary" />
                           Business Performance
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 items-center">
                              <span className="text-[9px] font-black text-zinc-600 uppercase">Avg Rating</span>
                              <div className="flex items-center gap-1.5 text-primary">
                                 <Star className="w-4 h-4 fill-primary" />
                                 <span className="text-xl font-black italic">{selectedVendor.rating}</span>
                              </div>
                           </div>
                           <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 items-center">
                              <span className="text-[9px] font-black text-zinc-600 uppercase">Leads Won</span>
                              <span className="text-xl font-black text-zinc-900 dark:text-white italic">42</span>
                           </div>
                           <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 items-center">
                              <span className="text-[9px] font-black text-zinc-600 uppercase">Reliability</span>
                              <span className="text-xl font-black text-emerald-500 italic">98%</span>
                           </div>
                           <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 items-center">
                              <span className="text-[9px] font-black text-zinc-600 uppercase">Subscription</span>
                              <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase italic">Premium</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Operating Routes */}
                  <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20">
                     <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                        <MapPinned className="w-4 h-4 text-primary" />
                        Primary Routes & Service Areas
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {['Indore Local', 'Indore to Bhopal', 'Indore to Ujjain'].map((route) => (
                           <div key={route} className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{route}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </TabsContent>

               <TabsContent value="documents" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {[
                        { title: "Driver's License", status: "Verified", icon: FileText, date: "Exp: 2028-12-10" },
                        { title: "Vehicle Registration (RC)", status: "Pending", icon: ImageIcon, date: "Uploaded 2 days ago" },
                        { title: "Commercial Insurance", status: "Rejected", icon: ShieldAlert, date: "Expired" },
                        { title: "Identity Proof (Aadhar)", status: "Verified", icon: FileText, date: "Verified by KYC" }
                     ].map((doc, i) => (
                        <div key={i} className="admin-card p-6 border-zinc-200 dark:border-zinc-900 hover:border-primary/20 transition-all group">
                           <div className="flex items-start justify-between mb-4">
                              <div className="flex gap-4">
                                 <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                                    <doc.icon className="w-6 h-6 text-zinc-500 group-hover:text-primary transition-colors" />
                                 </div>
                                 <div className="space-y-1">
                                    <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">{doc.title}</h4>
                                    <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{doc.date}</p>
                                 </div>
                              </div>
                              <Badge className={cn(
                                 "text-[8px] font-black uppercase tracking-widest border-none px-2",
                                 doc.status === 'Verified' ? "bg-emerald-500/10 text-emerald-500" :
                                 doc.status === 'Pending' ? "bg-amber-500/10 text-amber-500" :
                                 "bg-rose-500/10 text-rose-500"
                              )}>
                                 {doc.status}
                              </Badge>
                           </div>

                           <div className="h-40 w-full rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 mb-4 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                 <Button variant="outline" className="h-9 border-white/20 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                    <ExternalLink className="w-3 h-3 mr-2" />
                                    View Full size
                                 </Button>
                              </div>
                              <span className="text-[9px] font-black text-zinc-700 uppercase italic">Document Preview Area</span>
                           </div>

                           <div className="flex gap-2">
                              {doc.status !== 'Verified' && (
                                 <Button className="flex-1 bg-emerald-500 text-zinc-900 dark:text-white font-black uppercase text-[9px] tracking-widest h-9 rounded-lg shadow-lg shadow-emerald-500/10">
                                    Approve
                                 </Button>
                              )}
                              {doc.status !== 'Rejected' && (
                                 <Button variant="outline" className="flex-1 border-rose-500/20 bg-rose-500/5 text-rose-500 font-black uppercase text-[9px] tracking-widest h-9 rounded-lg">
                                    Reject
                                 </Button>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                     <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                           <ShieldQuestion className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                           <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest">Verification Status</h4>
                           <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest italic">All documents must be verified for the "Verified Partner" badge.</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-primary italic">2 / 4</p>
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Docs Verified</p>
                     </div>
                  </div>
               </TabsContent>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorManagement;
