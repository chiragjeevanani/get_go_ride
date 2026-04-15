import { useState } from "react";
import { ShieldCheck, Lock, Fingerprint, Eye, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [biometrics, setBiometrics] = useState(true);
  const [tfa, setTfa] = useState(false);
  const [score, setScore] = useState(85);
  const [isBoosting, setIsBoosting] = useState(false);
  const [toast, setToast] = useState(null);

  const showFeedback = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const boostSecurity = () => {
    setIsBoosting(true);
    setTimeout(() => {
      setScore(100);
      setTfa(true);
      setIsBoosting(false);
      showFeedback("Security boosted to 100%");
    }, 1500);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex items-center gap-4 pt-6 pb-4 border-b-2 border-primary">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white shadow-sm border border-zinc-100"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-black tracking-tight">Account Security</h1>
          <p className="text-[11px] text-zinc-500 font-medium">Protect your personal information</p>
        </div>
      </header>

      <div className="space-y-2 pt-2">
        <Card 
          onClick={() => showFeedback("Password reset link sent to email")}
          className="border-none shadow-premium bg-white group cursor-pointer active:scale-98 transition-all"
        >
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-black uppercase tracking-tight">Change Password</span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Last changed 3mo ago</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-200" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium bg-white group transition-all">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-black uppercase tracking-tight">Biometric Login</span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">{biometrics ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
            <Switch checked={biometrics} onCheckedChange={(val) => {
               setBiometrics(val);
               showFeedback(val ? "Biometrics enabled" : "Biometrics disabled");
            }} />
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium bg-white group transition-all">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-black uppercase tracking-tight">Two-Factor Auth</span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">{tfa ? "Active" : "Highly Recommended"}</span>
              </div>
            </div>
            <Switch checked={tfa} onCheckedChange={(val) => {
               setTfa(val);
               if(val) {
                 setScore(100);
                 showFeedback("2FA active - Score increased!");
               } else {
                 setScore(85);
                 showFeedback("2FA deactivated");
               }
            }} />
          </CardContent>
        </Card>

        <Card 
          onClick={() => showFeedback("Viewing 2 active login sessions")}
          className="border-none shadow-premium bg-white group cursor-pointer active:scale-98 transition-all"
        >
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400">
                <Eye className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-black uppercase tracking-tight">Active Sessions</span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">2 devices logged in</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-200" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-5 border-2 border-dashed border-zinc-100 rounded-[2rem] text-center space-y-3 relative overflow-hidden">
         {score === 100 && (
            <div className="absolute inset-0 bg-primary/5 animate-in fade-in duration-500" />
         )}
         <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary relative z-10 transition-transform duration-500">
            {score === 100 ? <CheckCircle2 className="w-6 h-6 animate-bounce" /> : <ShieldCheck className="w-6 h-6" />}
         </div>
         <div className="space-y-1 relative z-10">
            <h4 className="text-[11px] font-black text-black uppercase tracking-wider">Security Score: {score}%</h4>
            <p className="text-[9px] text-zinc-400 font-medium leading-tight px-4 text-center">
               {score === 100 
                ? "Your account is fully protected with maximum security protocols." 
                : "Your account is well protected. Enable 2FA to reach 100% security."}
            </p>
         </div>
         {score < 100 && (
            <Button 
               onClick={boostSecurity} 
               disabled={isBoosting}
               className="h-9 px-6 rounded-xl bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 relative z-10"
            >
               {isBoosting ? "Protecting..." : "Boost Security"}
            </Button>
         )}
      </div>

      {/* Mock Toast */}
      {toast && (
        <div className="fixed bottom-20 left-4 right-4 bg-zinc-900 text-white p-3 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50 shadow-2xl">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
             <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{toast}</span>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
