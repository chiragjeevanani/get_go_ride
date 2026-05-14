import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, MapPin, Calendar, 
  MessageSquare, User, CheckCircle2,
  Clock, ArrowRight, Filter,
  MoreVertical, Eye, Trash2,
  Package, Info, Briefcase, Loader2
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
import { adminApi } from '@/lib/api';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isFullChatOpen, setIsFullChatOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [bids, setBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [messages, setMessages] = useState([]);
  const [fetchingBids, setFetchingBids] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllRequirements({ limit: 100 });
      setLeads((res.data || []).map(req => ({
        id: req._id,
        serviceType: req.serviceType,
        userName: req.user?.name || req.user?.phone || 'Guest Customer',
        location: `${req.pickup?.address} to ${req.drops?.[0]?.address || 'Local'}`,
        date: new Date(req.createdAt).toLocaleDateString(),
        status: req.status === 'accepted' ? 'Finalized' : req.status === 'completed' ? 'Completed' : (req.status === 'bidding' ? 'Responded' : 'Pending'),
        rawStatus: req.status,
        description: req.items || req.notes || 'No description provided.',
        responses: req.bids?.length || 0,
        vehicleType: req.vehicleType,
        weight: req.weight
      })));
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleViewChats = async (lead) => {
    setSelectedLead(lead);
    setIsChatModalOpen(true);
    setBids([]);
    try {
      setFetchingBids(true);
      const res = await adminApi.getDealBids(lead.id);
      setBids(res.data.allBids || []);
    } catch (err) {
      console.error('Failed to fetch bids:', err);
    } finally {
      setFetchingBids(false);
    }
  };

  const handleOpenFullChat = async (bid) => {
    setSelectedBid(bid);
    setIsFullChatOpen(true);
    setMessages([]);
    try {
      setFetchingMessages(true);
      const res = await adminApi.getChatMessages(bid._id || bid.id);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setFetchingMessages(false);
    }
  };

  const handleDeleteLead = (lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
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
              <DropdownMenuItem 
                className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" 
                onClick={() => handleViewLead(row)}
              >
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Lead Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
                onClick={() => handleViewChats(row)}
              >
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">View Bids</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
                onClick={() => handleDeleteLead(row)}
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Delete Lead</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Lead Management" 
        subtitle="Monitor full lead lifecycle and platform demand" 
      />

      <DataTable 
        columns={columns} 
        data={leads} 
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
          <div className="space-y-6">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex flex-col gap-0.5">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Category</span>
                  <span className="text-base font-black text-zinc-900 italic tracking-tighter uppercase">{selectedLead.serviceType}</span>
               </div>
               <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex flex-col gap-0.5">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Posted On</span>
                  <span className="text-base font-black text-zinc-900 italic tracking-tighter uppercase">{selectedLead.date}</span>
               </div>
               <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex flex-col gap-0.5">
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Responses</span>
                  <span className="text-base font-black text-primary italic tracking-tighter uppercase">{selectedLead.responses} Vendors</span>
               </div>
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left: Lead Details */}
               <div className="lg:col-span-2 space-y-8">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-primary" />
                        Description
                     </h4>
                     <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-500 font-bold leading-relaxed uppercase tracking-tight italic">
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
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 relative overflow-hidden group">
                     <div className="relative z-10 space-y-3">
                        <div className="space-y-0.5">
                           <h4 className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Status</h4>
                           <p className="text-lg font-black text-zinc-900 uppercase italic tracking-tighter flex items-center gap-2">
                              {selectedLead.status}
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                           </p>
                        </div>
                        <Button className="w-full bg-primary text-black font-black uppercase text-[9px] tracking-widest h-9 rounded-lg shadow-md shadow-primary/20">
                           Force Close
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

      {/* Chat History Modal */}
      <Modal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        title="Vendor Bids & Response Hub"
        description="Detailed breakdown of all quotes and live negotiation status"
        size="sm"
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{selectedLead.serviceType}</h4>
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{selectedLead.location}</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-none text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                {selectedLead.responses} Responses
              </Badge>
            </div>

            <div className="space-y-4 min-h-[200px] flex flex-col justify-center">
              {fetchingBids ? (
                <div className="flex flex-col items-center gap-2 animate-pulse">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Loading Communications...</p>
                </div>
              ) : bids.length > 0 ? (
                <div className="space-y-3">
                  {bids.map((bid, i) => (
                    <div 
                      key={i} 
                      className="flex gap-3 group cursor-pointer hover:bg-zinc-50 p-2 rounded-xl transition-colors border border-transparent hover:border-zinc-100"
                      onClick={() => handleOpenFullChat(bid)}
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                          <User className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tight line-clamp-1">{bid.vendor?.businessName || bid.vendor?.name}</span>
                            <span className="text-sm font-black text-primary italic tracking-tighter">₹{bid.amount}</span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                             <div className="flex-1">
                                <p className="text-[9px] text-zinc-500 leading-tight font-medium line-clamp-1">
                                  {bid.lastMessage?.text || "No messages yet"}
                                </p>
                             </div>
                             <div className={cn(
                               "px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest",
                               bid.status === 'accepted' ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                             )}>
                                {bid.status}
                             </div>
                          </div>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-full text-[7px] font-black uppercase tracking-tighter bg-zinc-50 hover:bg-zinc-900 hover:text-white rounded-md mt-1"
                            onClick={(e) => {
                               e.stopPropagation();
                               handleOpenFullChat(bid);
                            }}
                          >
                             Inspect Conversation
                          </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center space-y-1.5">
                   <MessageSquare className="w-6 h-6 text-zinc-200 mx-auto" />
                   <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">No active chats for this lead</p>
                </div>
              )}
            </div>

               <Button 
                variant="ghost"
                className="w-full text-zinc-400 font-black uppercase text-[8px] tracking-widest h-9 rounded-lg hover:bg-zinc-100 transition-colors"
                onClick={() => setIsChatModalOpen(false)}
              >
                Close Panel
              </Button>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Lead"
        description="This action cannot be undone. Lead data will be permanently removed."
        size="sm"
      >
        {selectedLead && (
          <div className="space-y-6 pt-2">
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                 <Trash2 className="w-5 h-5 text-rose-500" />
              </div>
              <div className="space-y-0.5">
                 <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight">Confirm Deletion</h4>
                 <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Lead ID: {selectedLead.id}</p>
              </div>
            </div>

            <div className="space-y-2">
               <Button 
                variant="destructive" 
                className="w-full font-black uppercase text-[9px] tracking-widest h-11 rounded-xl"
                onClick={() => {
                  alert('Lead Deleted: ' + selectedLead.id);
                  setIsDeleteModalOpen(false);
                }}
               >
                 Permanently Delete Lead
               </Button>
               <Button 
                variant="ghost" 
                className="w-full font-black uppercase text-[9px] tracking-widest h-11 rounded-xl text-zinc-500 hover:bg-zinc-100"
                onClick={() => setIsDeleteModalOpen(false)}
               >
                 Cancel
               </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Full Chat Thread Modal */}
      <Modal
        isOpen={isFullChatOpen}
        onClose={() => setIsFullChatOpen(false)}
        title="Negotiation Thread"
        description="Review all messages exchanged between parties"
        size="lg"
      >
        {selectedBid && (
          <div className="flex flex-col h-[60vh]">
            {/* Thread Header */}
            <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 rounded-t-2xl">
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                     <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{selectedLead?.serviceType}</h4>
                     <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest italic">{selectedLead?.userName || 'Guest'} ↔ {selectedBid.vendor?.businessName || selectedBid.vendor?.name}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-emerald-500 uppercase italic leading-none">Status: {selectedBid.status}</p>
                  <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest">Bid ID: {selectedBid._id}</p>
               </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 admin-scrollbar">
               {fetchingMessages ? (
                 <div className="h-full flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Decrypting Thread...</p>
                 </div>
               ) : messages.length > 0 ? (
                 messages.map((msg, i) => (
                   <div key={i} className={cn(
                     "flex flex-col gap-1 max-w-[85%]",
                     msg.senderRole === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                   )}>
                      <div className="flex items-center gap-2">
                         <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">
                           {msg.senderRole === 'user' ? selectedLead?.userName : (selectedBid.vendor?.businessName || selectedBid.vendor?.name)}
                         </span>
                         <span className="text-[7px] text-zinc-300 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={cn(
                        "p-2 px-3 rounded-2xl text-[10px] font-medium leading-relaxed uppercase tracking-tight relative overflow-hidden",
                        msg.text.includes('DEAL ACCEPTED') 
                          ? "bg-emerald-500 text-white border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20" 
                          : msg.type === 'offer'
                            ? "bg-primary text-zinc-900 border-2 border-primary/20 shadow-md"
                            : msg.senderRole === 'user' 
                              ? "bg-zinc-900 text-white rounded-tr-none shadow-lg shadow-zinc-900/10" 
                              : "bg-zinc-50 text-zinc-600 border border-zinc-100 rounded-tl-none"
                      )}>
                         {msg.type === 'offer' && (
                            <div className="flex items-center gap-1 mb-1 border-b border-black/10 pb-1">
                               <CheckCircle2 className="w-3 h-3" />
                               <span className="text-[7px] font-black uppercase tracking-tighter">Price Proposal</span>
                            </div>
                         )}
                         {msg.text.includes('DEAL ACCEPTED') && (
                            <div className="flex items-center gap-1 mb-1 border-b border-white/20 pb-1">
                               <Package className="w-3 h-3" />
                               <span className="text-[7px] font-black uppercase tracking-tighter">Finalized Contract</span>
                            </div>
                         )}
                         "{msg.text}"
                         
                         {(msg.type === 'offer' || msg.text.includes('DEAL ACCEPTED')) && (
                            <div className="absolute -right-2 -bottom-2 opacity-10">
                               <Package className="w-8 h-8 rotate-12" />
                            </div>
                         )}
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="w-8 h-8 text-zinc-200" />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">
                      No message history found for this negotiation.<br/>
                      Starting bid was ₹{selectedBid.amount}.
                    </p>
                 </div>
               )}
            </div>

            {/* Moderation Footer */}
            <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl">
               <div className="flex items-center gap-3">
                  <div className="flex-1 p-2 bg-white border border-zinc-200 rounded-xl">
                     <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Moderator Action Note</p>
                     <p className="text-[9px] text-zinc-500 italic font-medium">Thread active. Monitoring for compliance.</p>
                  </div>
                  <Button className="bg-rose-500 text-white font-black uppercase text-[8px] tracking-widest h-9 px-5 rounded-lg hover:bg-rose-600 shadow-lg shadow-rose-500/10">
                     Flag Thread
                  </Button>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeadManagement;
