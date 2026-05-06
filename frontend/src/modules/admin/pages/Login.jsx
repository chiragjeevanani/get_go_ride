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
      
      localStorage.setItem("gtgl_token", res.data.accessToken);
      localStorage.setItem("gtgl_refresh_token", res.data.refreshToken);
      localStorage.setItem("gtgl_user", JSON.stringify(res.data.admin || res.data.user || {}));

      toast.success("Welcome back, Super Admin!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Absolute Decorative Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      {/* Cybernetic Tech Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.05]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center text-primary shadow-xl shadow-primary/5">
             <Shield className="w-7 h-7" strokeWidth={2} />
          </div>
          <div className="space-y-1">
             <h1 className="text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">GetGoLoad Admin</h1>
             <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-[0.3em]">Enterprise Management Portal</p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-900 rounded-3xl p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Administrative Email</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                   <input 
                     type="email"
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="admin@gmail.com"
                     className="w-full h-12 bg-[#0c0c0e] border border-zinc-900 rounded-xl pl-11 pr-4 text-xs font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 transition-all"
                   />
                </div>
             </div>

             <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Access Password</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                   <input 
                     type="password"
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••"
                     className="w-full h-12 bg-[#0c0c0e] border border-zinc-900 rounded-xl pl-11 pr-4 text-xs font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 transition-all"
                   />
                </div>
             </div>

             <Button 
               disabled={loading}
               type="submit"
               className="w-full h-12 bg-primary hover:bg-primary/90 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl mt-2 transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2"
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
          <div className="mt-6 border-t border-zinc-900/50 pt-4 text-center">
             <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider leading-relaxed">
                Authorized administrative users only. All connection attempts, access requests, and credential audits are encrypted and strictly monitored.
             </p>
          </div>
        </div>

        {/* Footer Brand Info */}
        <p className="text-center text-[9px] text-zinc-700 font-extrabold uppercase tracking-widest mt-8">
           Powered by Safarsetto Engine • Version 1.0.4
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
