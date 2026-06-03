import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Building2, Save, CheckCircle2, Loader2, AlertCircle,
  Shield, Info, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { withdrawalApi } from "@/lib/api";
import { toast } from "sonner";

const BankDetailsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await withdrawalApi.getBankDetails();
        if (res.success && res.data?.accountNumber) {
          setForm({
            accountHolderName: res.data.accountHolderName || "",
            accountNumber: res.data.accountNumber || "",
            ifscCode: res.data.ifscCode || "",
            bankName: res.data.bankName || "",
            upiId: res.data.upiId || "",
          });
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch {
        setIsEditing(true);
      }
      finally { setLoading(false); }
    };
    fetchDetails();
  }, []);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.accountHolderName || !form.accountNumber || !form.ifscCode || !form.bankName) {
      toast.error("All fields except UPI ID are required");
      return;
    }

    setSaving(true);
    try {
      const res = await withdrawalApi.saveBankDetails({
        ...form,
        ifscCode: form.ifscCode.toUpperCase(),
      });
      if (res.success) {
        setSaved(true);
        toast.success("Bank details saved!", { icon: "🏦" });
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(res.message || "Failed to save bank details");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto">
      <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-sm font-bold text-zinc-900 tracking-widest uppercase italic">Bank Details</h1>
          <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Withdrawal Setup</p>
        </div>
      </header>

      <div className="p-4 space-y-5">
        {/* Info */}
        <div className="bg-zinc-100 border-l-4 border-primary p-4 flex gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0" />
          <p className="text-[10px] font-bold text-zinc-600 leading-relaxed uppercase tracking-tight">
            Your bank details are stored securely and used only for processing withdrawal payouts approved by admin.
          </p>
        </div>

        {/* Form */}
        <Card className="border-2 border-zinc-100 rounded-xl bg-white">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                placeholder="As per bank records"
                value={form.accountHolderName}
                onChange={handleChange("accountHolderName")}
                disabled={!isEditing}
                className="rounded-xl border-2 border-zinc-100 font-bold text-zinc-900 focus:border-primary disabled:bg-zinc-50 disabled:text-zinc-500 disabled:opacity-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Account Number *</Label>
              <Input
                id="accountNumber"
                placeholder="9-18 digit account number"
                value={form.accountNumber}
                onChange={handleChange("accountNumber")}
                type="tel"
                inputMode="numeric"
                disabled={!isEditing}
                className="rounded-xl border-2 border-zinc-100 font-bold text-zinc-900 focus:border-primary font-mono disabled:bg-zinc-50 disabled:text-zinc-500 disabled:opacity-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">IFSC Code *</Label>
              <Input
                id="ifscCode"
                placeholder="e.g. SBIN0001234"
                value={form.ifscCode}
                onChange={(e) => setForm(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                disabled={!isEditing}
                className="rounded-xl border-2 border-zinc-100 font-bold text-zinc-900 focus:border-primary font-mono uppercase disabled:bg-zinc-50 disabled:text-zinc-500 disabled:opacity-100"
                maxLength={11}
              />
              <p className="text-[9px] text-zinc-400 font-bold">Format: 4 letters + 0 + 6 digits/letters</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bank Name *</Label>
              <Input
                id="bankName"
                placeholder="e.g. State Bank of India"
                value={form.bankName}
                onChange={handleChange("bankName")}
                disabled={!isEditing}
                className="rounded-xl border-2 border-zinc-100 font-bold text-zinc-900 focus:border-primary disabled:bg-zinc-50 disabled:text-zinc-500 disabled:opacity-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">UPI ID <span className="text-zinc-300">(Optional)</span></Label>
              <Input
                id="upiId"
                placeholder="yourname@upi"
                value={form.upiId}
                onChange={handleChange("upiId")}
                disabled={!isEditing}
                className="rounded-xl border-2 border-zinc-100 font-bold text-zinc-900 focus:border-primary disabled:bg-zinc-50 disabled:text-zinc-500 disabled:opacity-100"
              />
            </div>
          </CardContent>
        </Card>

        {!isEditing ? (
          <Button
            className="w-full h-14 rounded-xl bg-zinc-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all"
            onClick={() => setIsEditing(true)}
          >
            <div className="flex items-center gap-2"><Edit2 className="w-5 h-5" /> Edit Bank Details</div>
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-xl border-2 border-zinc-200 text-zinc-600 font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              disabled={saving || saved}
              className="flex-[2] h-14 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50"
              onClick={handleSave}
            >
              {saving ? (
                <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Saving...</div>
              ) : saved ? (
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Saved!</div>
              ) : (
                <div className="flex items-center gap-2"><Save className="w-5 h-5" /> Save Details</div>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDetailsPage;
