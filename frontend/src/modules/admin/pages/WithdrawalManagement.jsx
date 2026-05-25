import { useState, useEffect } from "react";
import {
  Wallet, Clock, CheckCircle2, XCircle, Banknote, RefreshCw,
  Search, ChevronDown, Building2, Phone, User, BadgeCheck,
  AlertCircle, Loader2, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { withdrawalApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { withdrawal, action }
  const [actionNote, setActionNote] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [viewBankDetails, setViewBankDetails] = useState(null);

  const fetchWithdrawals = async (status = statusFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (status && status !== "all") params.status = status;
      const res = await withdrawalApi.getAllWithdrawals(params);
      if (res.success) {
        setWithdrawals(res.data.withdrawals || []);
        setPendingCount(res.data.pendingCount || 0);
      }
    } catch (err) {
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, [statusFilter]);

  const handleAction = async () => {
    if (!actionModal) return;
    const { withdrawal, action } = actionModal;

    if (action === 'paid' && !transactionRef.trim()) {
      toast.error("Transaction reference (UTR) is required to mark as paid");
      return;
    }

    setActionLoading(true);
    try {
      const res = await withdrawalApi.processWithdrawal(withdrawal._id, {
        action,
        adminNote: actionNote,
        transactionRef: transactionRef.trim(),
      });
      if (res.success) {
        toast.success(`Withdrawal ${action} successfully`, { icon: action === 'paid' ? "💸" : action === 'approved' ? "✅" : "❌" });
        setActionModal(null);
        setActionNote("");
        setTransactionRef("");
        fetchWithdrawals();
      } else {
        toast.error(res.message || "Action failed");
      }
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const actionLabels = {
    approve: "Approve Request",
    paid: "Mark as Paid",
    reject: "Reject Request",
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Withdrawal Requests</h1>
          <p className="text-sm text-zinc-500 font-medium mt-0.5">Manage driver payout requests</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-black text-xs px-3 py-1.5">
              {pendingCount} Pending
            </Badge>
          )}
          <Button variant="outline" size="icon" onClick={() => fetchWithdrawals()} className="h-9 w-9">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", status: "pending", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved", status: "approved", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Paid", status: "paid", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Rejected", status: "rejected", color: "text-red-600", bg: "bg-red-50" },
        ].map(stat => (
          <Card
            key={stat.status}
            className={cn("cursor-pointer border-2 transition-all", statusFilter === stat.status ? "border-primary" : "border-zinc-100")}
            onClick={() => setStatusFilter(stat.status)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                {stat.status === 'pending' && <Clock className={cn("w-5 h-5", stat.color)} />}
                {stat.status === 'approved' && <CheckCircle2 className={cn("w-5 h-5", stat.color)} />}
                {stat.status === 'paid' && <Banknote className={cn("w-5 h-5", stat.color)} />}
                {stat.status === 'rejected' && <XCircle className={cn("w-5 h-5", stat.color)} />}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">{stat.label}</p>
                <p className={cn("text-xl font-black", stat.color)}>
                  {statusFilter === stat.status ? withdrawals.length : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Filter className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40 h-9 pl-9 pr-3 rounded-md border border-zinc-200 bg-white text-sm font-bold text-zinc-700 outline-none focus:border-primary shadow-sm appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-20">
          <Wallet className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <p className="text-zinc-400 font-bold">No {statusFilter !== 'all' ? statusFilter : ''} withdrawal requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map(w => {
            const sc = STATUS_CONFIG[w.status] || STATUS_CONFIG.pending;
            const Icon = sc.icon;
            const vendor = w.vendor;

            return (
              <Card key={w._id} className="border border-zinc-100 hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Driver info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-zinc-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-zinc-900">{vendor?.name || "Driver"}</p>
                          <Badge className={cn("text-[9px] font-black border", sc.color)}>
                            <Icon className="w-3 h-3 mr-0.5" /> {sc.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-400 font-bold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {vendor?.phone || "—"}
                        </p>
                        {/* Bank details */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <div 
                            className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 hover:border-primary/45 hover:bg-primary/5 px-2.5 py-1 rounded-lg cursor-pointer transition-all group/bank shadow-sm"
                            onClick={() => setViewBankDetails(w.bankSnapshot)}
                            title="Click to view full unmasked credentials"
                          >
                            <Building2 className="w-3 h-3 text-zinc-400 group-hover/bank:text-primary" />
                            <span className="text-[10px] font-bold text-zinc-500 group-hover/bank:text-zinc-950">
                              {w.bankSnapshot?.bankName || "—"} ••••{w.bankSnapshot?.accountNumber?.slice(-4) || "—"} (Click to View Payout Info)
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono bg-zinc-50 border border-zinc-100 px-2 py-1 rounded-lg">{w.bankSnapshot?.ifscCode}</span>
                        </div>
                        {w.bankSnapshot?.upiId && (
                          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">UPI: {w.bankSnapshot.upiId}</p>
                        )}
                        {w.transactionRef && (
                          <p className="text-[10px] text-emerald-600 font-mono font-bold mt-1">UTR: {w.transactionRef}</p>
                        )}
                        {w.adminNote && (
                          <p className="text-[10px] text-red-400 font-bold mt-0.5">{w.adminNote}</p>
                        )}
                        <p className="text-[9px] text-zinc-300 font-bold mt-1">
                          {new Date(w.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Amount + Actions */}
                    <div className="text-right shrink-0 space-y-2">
                      <p className="text-2xl font-black text-zinc-900">₹{(w.amount || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">{w.bankSnapshot?.accountHolderName}</p>

                      {/* Action buttons */}
                      {w.status === 'pending' && (
                        <div className="flex flex-col gap-1.5 pt-1">
                          <Button
                            size="sm"
                            className="h-8 bg-blue-500 text-white font-black text-xs hover:bg-blue-600"
                            onClick={() => setActionModal({ withdrawal: w, action: 'approve' })}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-emerald-300 text-emerald-700 font-black text-xs hover:bg-emerald-50"
                            onClick={() => setActionModal({ withdrawal: w, action: 'paid' })}
                          >
                            <Banknote className="w-3.5 h-3.5 mr-1" /> Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-200 text-red-600 font-black text-xs hover:bg-red-50"
                            onClick={() => setActionModal({ withdrawal: w, action: 'reject' })}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      )}

                      {w.status === 'approved' && (
                        <Button
                          size="sm"
                          className="h-8 bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600"
                          onClick={() => setActionModal({ withdrawal: w, action: 'paid' })}
                        >
                          <Banknote className="w-3.5 h-3.5 mr-1" /> Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Action Modal */}
      <Dialog open={!!actionModal} onOpenChange={(open) => { if (!open) { setActionModal(null); setActionNote(""); setTransactionRef(""); } }}>
        <DialogContent className="max-w-md bg-white border border-zinc-200 text-zinc-900 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">
              {actionModal && actionLabels[actionModal.action]}
            </DialogTitle>
            <DialogDescription className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
              {actionModal?.withdrawal && (
                <span>
                  ₹{(actionModal.withdrawal.amount || 0).toLocaleString('en-IN')} for {actionModal.withdrawal.vendor?.name || "Driver"}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {actionModal?.action === 'paid' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-0.5">Transaction Reference (UTR) *</Label>
                <Input
                  placeholder="Enter bank UTR / reference number"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  className="h-11 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 font-mono text-xs focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 shadow-sm"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-0.5">
                Admin Note {actionModal?.action === 'reject' ? '*' : '(Optional)'}
              </Label>
              <textarea
                placeholder={actionModal?.action === 'reject' ? "Reason for rejection..." : "Optional note for the driver..."}
                value={actionNote}
                onChange={e => setActionNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary shadow-sm resize-none"
              />
            </div>

            {actionModal?.action === 'reject' && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-700 font-bold leading-relaxed">
                  Rejecting will refund ₹{(actionModal?.withdrawal?.amount || 0).toLocaleString('en-IN')} back to the driver's active wallet.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => { setActionModal(null); setActionNote(""); setTransactionRef(""); }}
              className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200 bg-white hover:bg-zinc-50"
            >
              Cancel
            </Button>
            <Button
              disabled={actionLoading}
              className={cn(
                "flex-1 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all",
                actionModal?.action === 'reject' ? "bg-red-500 hover:bg-red-600 text-white shadow-red-200" :
                actionModal?.action === 'paid' ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200" :
                "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200"
              )}
              onClick={handleAction}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {actionModal && actionLabels[actionModal.action]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bank Details Modal */}
      <Dialog open={!!viewBankDetails} onOpenChange={(open) => { if (!open) setViewBankDetails(null); }}>
        <DialogContent className="max-w-md bg-white border border-zinc-200 text-zinc-900 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-zinc-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Bank Account Info
            </DialogTitle>
            <DialogDescription className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Full transfer credentials for the driver partner
            </DialogDescription>
          </DialogHeader>

          {viewBankDetails && (
            <div className="space-y-4 py-2">
              {[
                { label: "Account Holder Name", value: viewBankDetails.accountHolderName },
                { label: "Account Number", value: viewBankDetails.accountNumber, isMono: true },
                { label: "IFSC Code", value: viewBankDetails.ifscCode, isMono: true },
                { label: "Bank Name", value: viewBankDetails.bankName },
                { label: "UPI ID", value: viewBankDetails.upiId },
              ].map((field, idx) => (
                field.value ? (
                  <div key={idx} className="flex justify-between items-center bg-zinc-50 border border-zinc-100 p-3 rounded-xl hover:border-zinc-200 transition-colors">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{field.label}</span>
                      <p className={cn("text-xs font-bold text-zinc-900", field.isMono && "font-mono font-black")}>
                        {field.value}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[10px] font-black uppercase tracking-wider hover:bg-zinc-200 text-zinc-600 px-3 rounded-lg border border-zinc-200 bg-white"
                      onClick={() => {
                        navigator.clipboard.writeText(field.value);
                        toast.success(`${field.label} copied!`, { icon: "📋" });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                ) : null
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              className="w-full h-12 bg-zinc-900 text-primary hover:bg-zinc-800 font-black text-xs uppercase tracking-widest rounded-xl"
              onClick={() => setViewBankDetails(null)}
            >
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalManagement;
