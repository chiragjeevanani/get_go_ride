import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, ChevronLeft, Car, ShieldCheck, FileText, 
  MapPin, Package, CheckCircle2, AlertCircle, ExternalLink,
  Truck, HelpCircle, Edit3, ArrowRight, Loader2, Trash2
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
import { useDriverState } from "../hooks/useDriverState";
import { vendorApi } from "@/lib/api";
import { toast } from "sonner";

const VehicleDetails = () => {
  const navigate = useNavigate();
  const { driver, refreshProfile } = useDriverState();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Form Inputs
  const [modelInput, setModelInput] = useState("");
  const [regInput, setRegInput] = useState("");
  const [capacityInput, setCapacityInput] = useState("");
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Document Uploads
  const [uploadingDoc, setUploadingDoc] = useState(null); // stores document title being uploaded
  const [uploadingState, setUploadingState] = useState(false);
  const docFileInputRef = useRef(null);

  // Fleet Gallery uploads (Database-backed)
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const galleryFileInputRef = useRef(null);

  useEffect(() => {
    if (driver) {
      setModelInput(driver.vehicleType || "");
      setRegInput(driver.vehicleRegNumber || "");
      setCapacityInput(driver.vehicleCapacity || "");
    }
  }, [driver]);

  const handleSaveVehicle = async () => {
    if (!modelInput || !regInput || !capacityInput) {
      toast.error("All vehicle details are required for platform verification!");
      return;
    }
    try {
      setSavingVehicle(true);
      await vendorApi.updateProfile({
        vehicleType: modelInput,
        vehicleRegNumber: regInput,
        vehicleCapacity: capacityInput
      });
      await refreshProfile();
      toast.success("Vehicle details updated successfully!");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update vehicle specifications:", err);
      toast.error("Failed to update vehicle specifications. Please try again.");
    } finally {
      setSavingVehicle(false);
    }
  };

  const triggerDocUpload = (docName) => {
    setUploadingDoc(docName);
    setTimeout(() => {
      if (docFileInputRef.current) {
        docFileInputRef.current.click();
      }
    }, 50);
  };

  const handleDocFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && uploadingDoc) {
      try {
        setUploadingState(true);
        const formData = new FormData();
        formData.append("document", file);
        formData.append("title", uploadingDoc);

        await vendorApi.uploadDocument(formData);
        await refreshProfile();
        toast.success(`${uploadingDoc} uploaded successfully!`);
      } catch (err) {
        console.error("Document upload failed:", err);
        toast.error("Failed to upload document. Please try again.");
      } finally {
        setUploadingState(false);
        setUploadingDoc(null);
        if (event.target) event.target.value = ""; // Reset file input
      }
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append("image", file);

        await vendorApi.uploadVehicleImage(formData);
        await refreshProfile();
        toast.success("Photo added to fleet gallery portfolio!");
      } catch (err) {
        console.error("Failed to upload fleet photo:", err);
        toast.error("Failed to upload fleet photo. Please try again.");
      } finally {
        setUploadingPhoto(false);
        if (event.target) event.target.value = ""; // Reset file input
      }
    }
  };

  const handleDeletePhoto = async (photoUrl) => {
    try {
      setDeletingPhoto(photoUrl);
      await vendorApi.deleteVehicleImage(photoUrl);
      await refreshProfile();
      toast.success("Vehicle photo removed from fleet portfolio.");
    } catch (err) {
      console.error("Failed to remove vehicle photo:", err);
      toast.error("Failed to remove photo. Please try again.");
    } finally {
      setDeletingPhoto(null);
    }
  };

  const resolveDocUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const cleanPath = url.replace(/^\//, "");
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
    return `${backendUrl}/${cleanPath}`;
  };

  // Required Verification Documents Mapping
  const requiredDocTypes = [
    { name: "Driving License", icon: FileText },
    { name: "Vehicle RC", icon: ShieldCheck },
    { name: "Aadhar Card", icon: FileText }
  ];

  const processedDocs = requiredDocTypes.map(type => {
    const matchedDoc = driver.documents?.find(d => d.title?.toLowerCase() === type.name.toLowerCase());
    if (matchedDoc) {
      return {
        name: type.name,
        status: matchedDoc.status || "Pending",
        expiry: "Dec 2029", // Estimated/RTO standard validation
        icon: type.icon,
        fileUrl: matchedDoc.fileUrl,
        isUploaded: true,
        bg: matchedDoc.status === "Verified" ? "bg-emerald-50" : matchedDoc.status === "Rejected" ? "bg-red-50" : "bg-amber-50",
        color: matchedDoc.status === "Verified" ? "text-emerald-500" : matchedDoc.status === "Rejected" ? "text-red-500" : "text-amber-500"
      };
    } else {
      return {
        name: type.name,
        status: "Missing",
        expiry: "Not Available",
        icon: type.icon,
        fileUrl: null,
        isUploaded: false,
        bg: "bg-red-50",
        color: "text-red-500"
      };
    }
  });

  const getStatusBadge = () => {
    const s = driver.status || "Pending";
    if (s === "Verified") {
      return { text: "Verified Profile", color: "bg-emerald-500 text-white" };
    } else if (s === "Rejected") {
      return { text: "Rejected Profile", color: "bg-red-500 text-white animate-pulse" };
    } else if (s === "Suspended") {
      return { text: "Account Suspended", color: "bg-red-600 text-white" };
    }
    return { text: "Under Verification", color: "bg-amber-500 text-white animate-pulse" };
  };

  const statusBadge = getStatusBadge();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24 pt-4 px-1"
    >
      {/* Hidden Doc File Input */}
      <input 
        type="file" 
        ref={docFileInputRef}
        onChange={handleDocFileChange}
        className="hidden" 
        accept="image/*,application/pdf"
      />

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
                  <div className="space-y-1.5">
                     <Badge className={cn("font-bold text-[9px] tracking-tight h-5 px-1.5 border-none", statusBadge.color)}>
                       {statusBadge.text}
                     </Badge>
                     <h2 className="text-xl font-bold tracking-tight">
                       {driver.vehicleType || "Not Specified Vehicle"}
                     </h2>
                     <p className="text-[10px] font-bold text-zinc-400 tracking-tight">
                       Operating payload capability
                     </p>
                  </div>
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/5 shadow-inner">
                     <Truck className="w-4.5 h-4.5 text-primary" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[8px] font-bold text-zinc-500 tracking-tight uppercase">Reg. Number</span>
                     <p className="text-[11px] font-bold text-white tracking-wide leading-none mt-1">
                       {driver.vehicleRegNumber || "Not Configured"}
                     </p>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[8px] font-bold text-zinc-500 tracking-tight uppercase">Payload Cap.</span>
                     <p className="text-[11px] font-bold text-white tracking-wide leading-none mt-1">
                       {driver.vehicleCapacity || "Not Configured"}
                     </p>
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

      {/* Vehicle Photos Gallery */}
      <section className="space-y-4 px-1">
         <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold tracking-tight text-zinc-500 uppercase flex items-center gap-2">
               <Car className="w-3.5 h-3.5" /> Fleet Portfolio
            </h3>
            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black tracking-widest uppercase">Verified Gallery</Badge>
         </div>

         <div className="grid grid-cols-2 gap-3">
            <input 
              type="file" 
              ref={galleryFileInputRef}
              onChange={handlePhotoUpload}
              className="hidden" 
              accept="image/*"
            />
            
            {(driver.vehicleImages || []).map((photo, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-zinc-50 border-2 border-zinc-100 overflow-hidden group relative shadow-sm">
                 <img 
                    src={resolveDocUrl(photo)} 
                    alt="Vehicle" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 />
                 <button
                    onClick={() => handleDeletePhoto(photo)}
                    disabled={deletingPhoto === photo}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md disabled:bg-zinc-400"
                 >
                    {deletingPhoto === photo ? (
                       <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                       <Trash2 className="w-3.5 h-3.5" />
                    )}
                 </button>
              </div>
            ))}

            <button 
               onClick={() => !uploadingPhoto && galleryFileInputRef.current.click()}
               disabled={uploadingPhoto}
               className="aspect-[4/3] rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 bg-zinc-50/30 hover:bg-zinc-50 hover:border-primary/40 transition-all group disabled:opacity-50"
            >
               {uploadingPhoto ? (
                  <>
                     <Loader2 className="w-5 h-5 text-primary animate-spin" />
                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">Uploading...</span>
                  </>
               ) : (
                  <>
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm group-hover:text-primary transition-colors">
                        <Edit3 className="w-4 h-4" />
                     </div>
                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Add Photo</span>
                  </>
               )}
            </button>
         </div>
      </section>

      {/* Verification Status List */}
      <section className="space-y-4 px-1">
         <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold tracking-tight text-zinc-500 uppercase flex items-center gap-2">
               <ShieldCheck className="w-3.5 h-3.5" /> Documents Verification
            </h3>
            <Badge variant="outline" className={cn(
              "text-[10px] font-bold tracking-tight h-5 px-2 border-zinc-100",
              driver.isVerified ? "text-emerald-600 bg-emerald-50/50" : "text-amber-600 bg-amber-50/50"
            )}>
              {driver.isVerified ? "Verified Account" : "Pending Verification"}
            </Badge>
         </div>

         <div className="space-y-3">
            {processedDocs.map((doc, idx) => (
               <Card key={idx} className="border border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white hover:border-primary/20 transition-all group">
                  <CardContent className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div 
                           onClick={() => doc.isUploaded && setSelectedDoc(doc)}
                           className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center transition-colors", 
                             doc.bg,
                             doc.isUploaded && "cursor-pointer hover:ring-2 hover:ring-primary/20"
                           )}
                        >
                           <doc.icon className={cn("w-5 h-5", doc.color)} />
                        </div>
                        <div>
                           <h4 className="text-xs font-bold text-zinc-900 tracking-tight">{doc.name}</h4>
                           <p className="text-[10px] font-semibold text-zinc-400 tracking-tight">
                             {doc.isUploaded ? `Expires: ${doc.expiry}` : "Action Required"}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        {uploadingState && uploadingDoc === doc.name ? (
                           <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-zinc-400 animate-pulse uppercase">Uploading...</span>
                              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                           </div>
                        ) : doc.isUploaded ? (
                           <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                              <span className={cn("text-[9px] font-bold tracking-tight uppercase", doc.color)}>{doc.status}</span><Edit3 onClick={(e) => { e.stopPropagation(); triggerDocUpload(doc.name); }} className="w-3.5 h-3.5 ml-2 text-zinc-400 cursor-pointer" />
                              {doc.status === "Verified" ? (
                                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : doc.status === "Rejected" ? (
                                 <AlertCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                 <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                              )}
                           </div>
                        ) : (
                           <Button 
                              onClick={() => triggerDocUpload(doc.name)}
                              size="sm" 
                              variant="outline" 
                              className="h-8 rounded-xl font-bold text-[10px] uppercase border-zinc-200 hover:bg-zinc-900 hover:text-white"
                           >
                              Upload
                           </Button>
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
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-sm shadow-sm focus:bg-white transition-all"
                    placeholder="E.g. Tata Ace Gold"
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                     <Label htmlFor="reg" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Registration</Label>
                     <Input
                        id="reg"
                        value={regInput}
                        onChange={(e) => setRegInput(e.target.value)}
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-xs shadow-sm focus:bg-white transition-all"
                        placeholder="E.g. MP-09-GH-4521"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label htmlFor="cap" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Capacity</Label>
                     <Input
                        id="cap"
                        value={capacityInput}
                        onChange={(e) => setCapacityInput(e.target.value)}
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-100 font-bold text-xs shadow-sm focus:bg-white transition-all"
                        placeholder="E.g. 750 kg"
                     />
                  </div>
               </div>
             </div>

             <div className="flex gap-2 pt-2">
               <Button 
                  variant="ghost" 
                  onClick={() => setIsEditModalOpen(false)} 
                  disabled={savingVehicle}
                  className="flex-1 h-11 rounded-xl font-bold text-zinc-400 hover:bg-zinc-50 transition-colors"
               >
                 Cancel
               </Button>
               <Button 
                  onClick={handleSaveVehicle} 
                  disabled={savingVehicle}
                  className="flex-1 h-11 bg-primary text-zinc-900 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 flex items-center justify-center gap-1.5"
               >
                  {savingVehicle ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
               </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-[2rem] bg-white shadow-2xl">
           <div className="relative aspect-[4/3] bg-zinc-50 flex items-center justify-center p-4 overflow-hidden border-b border-zinc-100">
              {resolveDocUrl(selectedDoc?.fileUrl) ? (
                  <div className="relative group/view w-full h-full">
                    <motion.img 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={resolveDocUrl(selectedDoc.fileUrl)} 
                        alt={selectedDoc.name} 
                        className="w-full h-full object-contain rounded-xl shadow-lg border border-zinc-200"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/view:opacity-100 transition-opacity bg-black/5 rounded-xl pointer-events-none">
                       <Button 
                          onClick={() => window.open(resolveDocUrl(selectedDoc.fileUrl), '_blank')}
                          className="pointer-events-auto bg-zinc-900/80 backdrop-blur-md text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] uppercase tracking-widest border border-white/10"
                       >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Full Preview
                       </Button>
                    </div>
                  </div>
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
                 Close
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
