import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.adminLogin(email.trim(), password);
      
      // Partitioned admin storage to avoid state collisions
      localStorage.setItem("gtgl_admin_token", res.data.accessToken);
      localStorage.setItem("gtgl_admin_refresh_token", res.data.refreshToken);
      localStorage.setItem("gtgl_admin_user", JSON.stringify(res.data.admin || res.data.user || {}));

      // Fallback shared storage for standard API readers
      localStorage.setItem("gtgl_token", res.data.accessToken);
      localStorage.setItem("gtgl_refresh_token", res.data.refreshToken);
      localStorage.setItem("gtgl_user", JSON.stringify(res.data.admin || res.data.user || {}));

      // Initialize push notifications for Admin (request permission & save token)
      import("../../../services/pushNotificationService").then(({ initializePushNotifications }) => {
        initializePushNotifications().catch(err => console.warn("[FCM] Admin login token init failed:", err));
      });

      toast.success("Welcome back, Super Admin!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            src="/getgoride_logo_no_bg.png" 
            alt="GetGoLoad Logo" 
            className="w-20 h-auto mx-auto"
          />
          <div className="space-y-0.5">
             <h1 className="text-xl font-black tracking-tighter uppercase italic text-zinc-900">GetGoLoad Admin</h1>
             <p className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-[0.4em]">Enterprise Management Portal</p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative">
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-1">Administrative Email</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                   <input 
                     type="email"
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="admin@gmail.com"
                     className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 text-xs font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary transition-all"
                   />
                </div>
             </div>

             <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-1">Access Password</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                   <input 
                     type="password"
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 text-xs font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary transition-all"
                   />
                </div>
             </div>

             <Button 
               disabled={loading}
               type="submit"
               className="w-full h-12 bg-primary hover:bg-primary/90 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl mt-2 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
             >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Authorize Access
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </>
                )}
             </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 border-t border-zinc-100 pt-4 text-center">
             <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
                Authorized administrative users only. All connection attempts, access requests, and credential audits are encrypted and strictly monitored.
             </p>
          </div>
        </div>

        {/* Footer Brand Info */}
        <p className="text-center text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest mt-8">
           Powered by Safarsetto Engine • Version 1.0.4
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
