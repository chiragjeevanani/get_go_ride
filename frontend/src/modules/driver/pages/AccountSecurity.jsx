import React from "react";
import { 
  Shield, Fingerprint, Smartphone, Key, 
  ChevronLeft, CheckCircle2, AlertTriangle, 
  History, LogOut, ChevronRight, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";

const AccountSecurity = () => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [pinStep, setPinStep] = React.useState('current'); // 'current' | 'new' | 'success'
  const [pinValues, setPinValues] = React.useState(['', '', '', '']);
  const [securityStatus, setSecurityStatus] = React.useState({
    twoFactor: true,
    biometric: false,
    sessionPersistence: true
  });

  const [sessions, setSessions] = React.useState([
    { id: 1, device: "Vivo V27", location: "Indore, India", time: "Active Now", current: true },
    { id: 2, device: "Chrome Browser Desktop", location: "Bhopal, India", time: "2 days ago", current: false },
  ]);

  const toggle = (key) => setSecurityStatus(prev => ({ ...prev, [key]: !prev[key] }));

  const handleLogoutAll = () => {
    if (confirm("Logout from all other devices?")) {
      setSessions(prev => prev.filter(s => s.current));
    }
  };

  const handleLogoutSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d+$/.test(value)) return;

    const newPin = [...pinValues];
    newPin[index] = value;
    setPinValues(newPin);

    // Auto-focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinValues[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePinNext = () => {
    if (pinValues.some(v => v === '')) return;

    if (pinStep === 'current') {
       setPinValues(['', '', '', '']);
       setPinStep('new');
    } else {
       setIsProcessing(true);
       setTimeout(() => {
          setIsProcessing(false);
          setPinStep('success');
          setTimeout(() => {
             setIsPinModalOpen(false);
             setPinStep('current');
             setPinValues(['', '', '', '']);
          }, 1500);
       }, 1500);
    }
  };

  const verificationSteps = [
    { label: "Driving License", status: "Verified", date: "May 2024", id: "DL-9082" },
    { label: "Phone Number", status: "Verified", date: "Apr 2024", id: "+91 98*** **231" },
    { label: "Vehicle RC", status: "Verified", date: "May 2024", id: "MP-09-RT-2911" },
    { label: "Background Check", status: "Verified", date: "Jun 2024", id: "REF-0982-1" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 pb-24 pt-2 px-1"
    >
      {/* Sharp Header */}
      <header className="flex items-center gap-4 -mx-5 px-5 py-3 border-b-2 border-yellow-400 sticky top-0 bg-white/95 backdrop-blur-md z-30 mb-2">
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-none bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-base font-black text-zinc-900 tracking-tighter uppercase leading-none">Account Security</h1>
          <p className="text-[10px] font-bold text-zinc-500 tracking-tight mt-1">Manage your verification & safety</p>
        </div>
      </header>

      {/* Security Health Check */}
      <Card className="rounded-none border-none bg-zinc-900 text-white overflow-hidden relative shadow-2xl">
         <CardContent className="p-5 space-y-4 relative z-10">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <Shield className="w-4 h-4 text-emerald-500" />
                     <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500">Shield Active</h3>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter leading-snug max-w-[180px]">Your account is fully verified and protected by Two-Factor Authentication.</p>
               </div>
               <div className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-md border border-white/5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
               </div>
            </div>
         </CardContent>
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] pointer-events-none"></div>
      </Card>

      {/* Verification Documents Grid */}
      <section className="space-y-2">
         <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase px-1">Identity Trust</h3>
         <div className="grid grid-cols-2 gap-2">
            {verificationSteps.map((step, i) => (
               <Card key={i} className="rounded-none border-zinc-100 shadow-none bg-white p-3 space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">{step.label}</span>
                     <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <div className="space-y-0.5">
                     <h4 className="text-[10px] font-black text-zinc-900 tracking-tight uppercase leading-none">{step.id}</h4>
                     <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">SINCE {step.date}</p>
                  </div>
               </Card>
            ))}
         </div>
      </section>

      {/* Security Switches */}
      <section className="space-y-2">
         <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase px-1">Advanced Saftey</h3>
         <div className="space-y-0 border-y border-zinc-100 bg-white">
            {[
               { id: 'twoFactor', label: 'Two-Factor (SMS)', desc: 'Secure logins with mobile OTP', icon: Smartphone },
               { id: 'biometric', label: 'Face / Fingerprint', desc: 'Instant access via biometrics', icon: Fingerprint },
            ].map((item, idx) => (
               <div key={item.id} className={cn(
                  "flex items-center justify-between p-4",
                  idx !== 1 && "border-b border-zinc-50"
               )}>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-none border border-zinc-100 flex items-center justify-center bg-zinc-50">
                        <item.icon className="w-3.5 h-3.5 text-zinc-900" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-800 uppercase tracking-tight">{item.label}</span>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">{item.desc}</span>
                     </div>
                  </div>
                  <Switch 
                     checked={securityStatus[item.id]} 
                     onCheckedChange={() => toggle(item.id)}
                     className="data-[state=checked]:bg-zinc-900 rounded-none h-5 w-9 [&>span]:w-3.5 [&>span]:h-3.5" 
                  />
               </div>
            ))}
         </div>
      </section>

      {/* Password Management */}
      <section className="space-y-2">
         <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase px-1">Manage Credentials</h3>
         <div className="space-y-2 px-1">
            <Button 
               onClick={() => setIsPinModalOpen(true)}
               variant="outline" 
               className="w-full h-11 rounded-none border-zinc-900 text-zinc-900 font-black uppercase text-[10px] tracking-widest justify-between px-4 group shadow-[3px_3px_0px_0px_#facc15] active:shadow-none hover:bg-zinc-50"
            >
               <div className="flex items-center gap-3">
                  <Key className="w-3.5 h-3.5" />
                  <span>Update Profile PIN</span>
               </div>
               <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" onClick={() => alert("Recovery request submitted. Details sent to registered email.")} className="w-full h-11 rounded-none border-zinc-200 text-zinc-500 font-bold uppercase text-[9px] tracking-widest justify-between px-4">
               <div className="flex items-center gap-3">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Request Login Recovery</span>
               </div>
               <ChevronRight className="w-3.5 h-3.5" />
            </Button>
         </div>
      </section>

      {/* Active Sessions */}
      <section className="space-y-2">
         <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Login History</h3>
            <Button onClick={handleLogoutAll} variant="link" className="h-auto p-0 text-[8px] font-black uppercase tracking-tighter text-zinc-900 underline">Logout All</Button>
         </div>
         <div className="space-y-0.5 border border-zinc-100 bg-white">
            {sessions.map((session) => (
               <div key={session.id} className="p-3.5 flex items-center justify-between group hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-7 h-7 rounded-none bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                        <History className="w-3.5 h-3.5 text-zinc-400" />
                     </div>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-zinc-800 uppercase leading-none tracking-tight">{session.device}</span>
                           {session.current && <Badge className="h-3.5 px-1 rounded-none bg-emerald-500 text-white font-black text-[6px] border-none uppercase tracking-tighter shrink-0">Current</Badge>}
                        </div>
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">{session.location} • {session.time}</p>
                     </div>
                  </div>
                  {!session.current && (
                     <Button onClick={() => handleLogoutSession(session.id)} variant="ghost" size="icon" className="w-7 h-7 rounded-none text-zinc-300 hover:text-red-500 hover:bg-red-50">
                        <LogOut className="w-3 h-3" />
                     </Button>
                  )}
               </div>
            ))}
         </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-6 px-1">
         <Button 
            onClick={() => setIsDeleteModalOpen(true)}
            variant="ghost" 
            className="w-full h-11 border-2 border-red-50 text-red-500 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95"
         >
            <AlertTriangle className="w-4 h-4" />
            DEACTIVATE FLEET ACCOUNT
         </Button>
         <p className="text-[8px] font-black text-zinc-300 text-center uppercase tracking-widest mt-3 px-4">This action will permanently disable your driver profile and fleet access.</p>
      </section>

      {/* PIN Update Modal */}
      <Dialog open={isPinModalOpen} onOpenChange={(val) => {
         setIsPinModalOpen(val);
         if (!val) setPinStep('current');
      }}>
        <DialogContent className="sm:max-w-md rounded-none border-none p-0 bg-white shadow-2xl overflow-hidden">
           <AnimatePresence mode="wait">
              {pinStep === 'current' && (
                 <motion.div 
                    key="current"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-8 space-y-6"
                 >
                    <div className="text-center space-y-2">
                       <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Enter Current PIN</h2>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verify your identity to proceed</p>
                    </div>
                    <div className="flex justify-center gap-3">
                       {pinValues.map((val, i) => (
                          <input
                             key={i}
                             id={`pin-${i}`}
                             type="password"
                             maxLength={1}
                             value={val}
                             onChange={(e) => handlePinChange(i, e.target.value)}
                             onKeyDown={(e) => handleKeyDown(i, e)}
                             className="w-12 h-14 border-2 border-zinc-900 text-center font-black text-xl focus:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary rounded-none"
                             autoComplete="off"
                          />
                       ))}
                    </div>
                    <Button 
                       onClick={handlePinNext} 
                       disabled={pinValues.some(v => v === '')}
                       className="w-full h-12 bg-zinc-900 text-white font-black uppercase tracking-widest text-[11px] rounded-none disabled:opacity-30"
                    >
                       Verify PIN
                    </Button>
                 </motion.div>
              )}

              {pinStep === 'new' && (
                 <motion.div 
                    key="new"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-8 space-y-6"
                 >
                    <div className="text-center space-y-2">
                       <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Set New PIN</h2>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Choose a secure 4-digit code</p>
                    </div>
                    <div className="flex justify-center gap-3">
                       {pinValues.map((val, i) => (
                          <input
                             key={i}
                             id={`pin-${i}`}
                             type="text"
                             maxLength={1}
                             value={val}
                             onChange={(e) => handlePinChange(i, e.target.value)}
                             onKeyDown={(e) => handleKeyDown(i, e)}
                             className="w-12 h-14 border-2 border-zinc-200 text-center font-black text-xl focus:border-zinc-900 focus:outline-none rounded-none"
                             autoComplete="off"
                          />
                       ))}
                    </div>
                    <Button 
                       onClick={handlePinNext} 
                       disabled={isProcessing || pinValues.some(v => v === '')}
                       className="w-full h-12 bg-zinc-900 text-white font-black uppercase tracking-widest text-[11px] rounded-none disabled:opacity-30"
                    >
                       {isProcessing ? "Updating..." : "Confirm & Save"}
                    </Button>
                 </motion.div>
              )}

              {pinStep === 'success' && (
                 <motion.div 
                    key="success"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-12 text-center space-y-6"
                 >
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-none flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                       <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-xl font-black text-zinc-900 uppercase leading-none">PIN Updated!</h2>
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Your security is now reinforced.</p>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Deactivate Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-none border-none p-0 bg-white shadow-2xl overflow-hidden">
           <div className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-none flex items-center justify-center mx-auto border border-red-100 mb-2">
                 <AlertTriangle className="w-8 h-8 scale-110" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-xl font-black text-zinc-900 uppercase leading-none tracking-tight">Are you sure?</h2>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">Deactivating your account will stop all active lead leads and delete your verification history.</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                 <Button onClick={() => {
                   setIsProcessing(true);
                   setTimeout(() => {
                      setIsProcessing(false);
                      setIsDeleteModalOpen(false);
                      navigate("/driver/auth");
                   }, 2000);
                 }} disabled={isProcessing} className="w-full h-12 bg-red-600 text-white font-black uppercase tracking-widest text-[11px] rounded-none shadow-xl shadow-red-600/10">
                    {isProcessing ? "Deactivating..." : "Yes, Deactivate Account"}
                 </Button>
                 <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="w-full h-11 font-black text-zinc-400 uppercase tracking-widest text-[10px] rounded-none hover:bg-zinc-50">Cancel Action</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AccountSecurity;
