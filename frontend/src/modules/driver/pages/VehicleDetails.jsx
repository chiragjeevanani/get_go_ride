import React from "react";
import { 
  MessageSquare, ChevronLeft, Car, ShieldCheck, FileText, 
  MapPin, Package, CheckCircle2, AlertCircle,
  Truck, HelpCircle, Edit3, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import licenseImg from "@/assets/driving_license.png";

const VehicleDetails = () => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);

  const [vehicleInfo, setVehicleInfo] = React.useState({
    model: "Tata Ace Gold",
    type: "Commercial (700kg)",
    regNumber: "MP-09-GH-4521",
    capacity: "750 kg",
    status: "Verified",
    lastService: "Jan 12, 2026"
  });

  const documents = [
    { name: "Driving License", status: "Verified", expiry: "2032", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "RC (Registration)", status: "Verified", expiry: "2029", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Vehicle Permit", status: "Expiring Soon", expiry: "May 2026", icon: FileText, color: "text-amber-500", bg: "bg-amber-50" },
    { name: "Insurance Policy", status: "Verified", expiry: "Dec 2026", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24 pt-4 px-1"
    >
      {/* Header */}
      <header className="flex items-center gap-4 -mx-5 px-5 py-3 border-b-2 border-yellow-400 sticky top-0 bg-white/90 backdrop-blur-md z-30 mb-5">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none">Vehicle Details</h1>
          <p className="text-[10px] font-semibold text-zinc-500 tracking-tight mt-1">Manage your fleet and documents</p>
        </div>
      </header>

      {/* Main Vehicle Card */}
      <section className="px-1">
         <Card className="bg-zinc-900 border-none rounded-2xl overflow-hidden text-white relative z-10 shadow-lg group">
            <CardContent className="p-4 space-y-4">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                     <Badge className="bg-emerald-500 text-white font-bold text-[9px] tracking-tight h-5 px-1.5 border-none">Verified Vehicle</Badge>
                     <h2 className="text-xl font-bold tracking-tight">{vehicleInfo.model}</h2>
                     <p className="text-[10px] font-bold text-zinc-400 tracking-tight">Commercial (700kg)</p>
                  </div>
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/5 shadow-inner">
                     <Truck className="w-4.5 h-4.5 text-primary" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[8px] font-bold text-zinc-500 tracking-tight uppercase">Reg. Number</span>
                     <p className="text-[11px] font-bold text-white tracking-wide leading-none mt-1">{vehicleInfo.regNumber}</p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[8px] font-bold text-zinc-500 tracking-tight uppercase">Payload Cap.</span>
                     <p className="text-[11px] font-bold text-white tracking-wide leading-none mt-1">{vehicleInfo.capacity}</p>
                  </div>
               </div>

               <Button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full h-9 bg-white text-zinc-900 font-bold text-[11px] rounded-lg hover:bg-zinc-100 shadow-md gap-2"
               >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Vehicle Info
               </Button>
            </CardContent>
            {/* Background design element */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none"></div>
         </Card>
      </section>

      {/* Verification Status List */}
      <section className="space-y-4 px-1">
         <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold tracking-tight text-zinc-500 uppercase flex items-center gap-2">
               <ShieldCheck className="w-3.5 h-3.5" /> Documents Verification
            </h3>
            <Badge variant="outline" className="text-[10px] font-bold tracking-tight h-5 px-2 border-zinc-100 text-emerald-600 bg-emerald-50/50">Verified</Badge>
         </div>

         <div className="space-y-3">
            {documents.map((doc, idx) => (
               <Card key={idx} className="border border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white hover:border-primary/20 transition-all group">
                  <CardContent className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div 
                           onClick={() => setSelectedDoc(doc)}
                           className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer hover:ring-2 hover:ring-primary/20", doc.bg)}
                        >
                           <doc.icon className={cn("w-5 h-5", doc.color)} />
                        </div>
                        <div>
                           <h4 className="text-xs font-bold text-zinc-900 tracking-tight">{doc.name}</h4>
                           <p className="text-[10px] font-semibold text-zinc-400 tracking-tight">Expires: {doc.expiry}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-bold tracking-tight uppercase", doc.color)}>{doc.status}</span>
                        {doc.status === "Verified" ? (
                           <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                           <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                        )}
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
      </section>

      {/* Support & Help */}
      <section className="px-1">
         <Card 
            onClick={() => setIsSupportModalOpen(true)}
            className="border border-dashed border-zinc-200 bg-zinc-50/50 rounded-2xl p-4 flex items-center gap-4 group cursor-pointer hover:bg-white hover:border-primary/20 transition-all shadow-sm"
         >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-zinc-100 text-zinc-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
               <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
               <h4 className="text-xs font-bold text-zinc-900 tracking-tight">Need to update documents?</h4>
               <p className="text-[10px] font-semibold text-zinc-500 tracking-tight">Contact support for manual re-verification</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
         </Card>
      </section>

      {/* Edit Vehicle Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-none p-6 bg-white shadow-2xl">
          <div className="space-y-4">
             <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900">Edit Vehicle Info</h2>
                <p className="text-[11px] font-semibold text-zinc-500">Update your vehicle specifications below.</p>
             </div>
             
             <div className="grid gap-4 py-2">
               <div className="grid gap-1.5">
                 <Label htmlFor="model" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Vehicle Model</Label>
                 <Input
                   id="model"
                   value={vehicleInfo.model}
                   onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                   className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-sm shadow-sm focus:bg-white transition-all"
                 />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                     <Label htmlFor="reg" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Registration</Label>
                     <Input
                        id="reg"
                        value={vehicleInfo.regNumber}
                        onChange={(e) => setVehicleInfo({...vehicleInfo, regNumber: e.target.value})}
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-xs shadow-sm focus:bg-white transition-all"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label htmlFor="cap" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Capacity</Label>
                     <Input
                        id="cap"
                        value={vehicleInfo.capacity}
                        onChange={(e) => setVehicleInfo({...vehicleInfo, capacity: e.target.value})}
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-xs shadow-sm focus:bg-white transition-all"
                     />
                  </div>
               </div>
             </div>

             <div className="flex gap-2 pt-2">
               <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="flex-1 h-11 rounded-xl font-bold text-zinc-400 hover:bg-zinc-50 transition-colors">Cancel</Button>
               <Button onClick={() => setIsEditModalOpen(false)} className="flex-1 h-11 bg-primary text-zinc-900 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90">Save Changes</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[2rem] bg-white shadow-2xl">
           <div className="relative aspect-[4/3] bg-zinc-50 flex items-center justify-center p-4 overflow-hidden border-b border-zinc-100">
              {selectedDoc?.name === "Driving License" ? (
                 <motion.img 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={licenseImg} 
                    alt="Driving License" 
                    className="w-full h-full object-contain rounded-xl shadow-lg border border-zinc-200"
                 />
              ) : (
                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-20 flex flex-col items-center gap-4 text-center"
                 >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10">
                       {selectedDoc && <selectedDoc.icon className="w-8 h-8 text-primary" />}
                    </div>
                    <div className="space-y-0.5">
                       <h3 className="text-zinc-900 font-bold text-lg tracking-tight">{selectedDoc?.name}</h3>
                       <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{selectedDoc?.status}</p>
                    </div>
                 </motion.div>
              )}
           </div>
           <div className="p-6 bg-white space-y-5">
              <div className="space-y-2">
                 <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Verified Information</Label>
                 <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                       <span className="text-[9px] text-zinc-400 font-bold uppercase">Issued at</span>
                       <p className="text-zinc-900 text-xs font-bold">Indore RTO</p>
                    </div>
                    <div className="space-y-0.5">
                       <span className="text-[9px] text-zinc-400 font-bold uppercase">Valid Until</span>
                       <p className="text-zinc-900 text-xs font-bold">{selectedDoc?.expiry}</p>
                    </div>
                 </div>
              </div>
              <Button onClick={() => setSelectedDoc(null)} className="w-full bg-zinc-900 text-white font-bold h-12 rounded-2xl shadow-xl shadow-zinc-900/10 hover:bg-zinc-800 transition-all">
                 Close Preview
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={isSupportModalOpen} onOpenChange={setIsSupportModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-none p-6 text-center bg-white shadow-2xl">
           <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                 <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">Contact Support</h2>
              <p className="text-sm font-semibold text-zinc-500 leading-snug px-6 mb-8">
                 Our verification team will assist you in updating your documents manually.
              </p>
              
              <div className="w-full flex flex-col gap-3">
                 <Button className="h-12 bg-zinc-900 text-white font-bold rounded-xl gap-3 shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 transition-all">
                    <MessageSquare className="w-4.5 h-4.5" /> Chat with Executive
                 </Button>
                 <Button variant="ghost" onClick={() => setIsSupportModalOpen(false)} className="h-11 font-bold text-zinc-400 rounded-xl hover:bg-zinc-50">
                    Close
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      <div className="px-1 pt-2">
         <p className="text-[9px] text-zinc-400 font-bold text-center tracking-tight leading-relaxed px-6 italic">
            * Ensure all documents are current. Expired documents may result in account suspension according to SafeSetto safety protocols.
         </p>
      </div>
    </motion.div>
  );
};

export default VehicleDetails;
