import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Phone, Mail, ArrowRight, ShieldCheck, 
  Car, Users, Clock, Star, MapPin, Truck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import loginAnimation from "@/assets/Lottie/LoginPage.json";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const OnboardingSlides = [
    { title: "Find the Perfect Ride", desc: "Connect with verified vehicle owners for any transportation need.", icon: <Truck className="w-16 h-16 text-primary" /> },
    { title: "Lead Marketplace", desc: "Post your requirement, compare multiple vendor quotes, and finalize.", icon: <ShieldCheck className="w-16 h-16 text-black" /> },
    { title: "Safe & Secure", desc: "Transparent tracking and secure communication built-in.", icon: <Star className="w-16 h-16 text-primary" /> },
  ];

  const handleNext = () => setStep(s => s + 1);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) document.getElementById(`otp-${index + 1}`).focus();
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const res = await authApi.sendOtp(phoneNumber, 'user');
      toast.success(res.message);
      
      // Auto-fill OTP in development/mock mode for easier testing
      if (res.data._devOtp) {
        setOtp(res.data._devOtp.split(""));
        toast.info(`Dev Mode: OTP is ${res.data._devOtp}`);
      }
      
      setStep(3);
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const otpString = otp.join("");
      const res = await authApi.verifyOtp(phoneNumber, otpString, 'user');
      
      // Clear other module tokens to prevent cross-contamination
      localStorage.removeItem('gtgl_driver_token');
      localStorage.removeItem('gtgl_driver_refresh_token');
      localStorage.removeItem('gtgl_driver');
      localStorage.removeItem('gtgl_admin_token');
      localStorage.removeItem('gtgl_admin_refresh_token');

      localStorage.setItem('gtgl_token', res.data.accessToken);
      localStorage.setItem('gtgl_refresh_token', res.data.refreshToken);
      localStorage.setItem('gtgl_user', JSON.stringify(res.data.user));
      
      toast.success("Login successful!");
      navigate("/user/dashboard");
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1: // Onboarding
        return (
          <div className="flex flex-col items-center justify-center gap-6 h-[80vh] py-8 px-6">
            <div className="space-y-4 w-full">
               <div className="flex flex-col items-center gap-2">
                  <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                     <Lottie 
                        animationData={loginAnimation} 
                        loop={true} 
                        className="w-full h-full"
                     />
                  </div>
                  <div className="text-center space-y-1">
                     <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">GetGo<span className="text-primary">Load</span></h1>
                     <p className="text-[10px] text-zinc-500 font-bold tracking-tight leading-relaxed">Vehicle Booking App</p>
                  </div>
               </div>
               <div className="space-y-3">
                  {OnboardingSlides.slice(0, 1).map((slide, idx) => (
                    <div key={idx} className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-1">
                       <h3 className="font-bold text-black text-base leading-tight">{slide.title}</h3>
                       <p className="text-xs text-zinc-500 leading-relaxed font-medium">{slide.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
            <Button 
               className="w-full h-12 rounded-xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/20"
               onClick={handleNext}
            >
               Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        );
      case 2: // Phone Login
        return (
          <div className="flex flex-col py-8 px-4 space-y-8">
            <div className="space-y-4">
               <Button variant="ghost" size="icon" className="rounded-full bg-zinc-100" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-6 h-6 text-zinc-600" />
               </Button>
                <div className="space-y-1 pt-4">
                   <h1 className="text-2xl font-medium text-primary tracking-tight">Enter Phone Number</h1>
                   <p className="text-sm text-zinc-500 font-medium">We'll send an OTP to verify your account</p>
                </div>
            </div>

            <div className="space-y-6">
               <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-zinc-200 pr-3">
                     <span className="text-sm font-bold text-zinc-600">+91</span>
                  </div>
                  <Input 
                    type="tel"
                    placeholder="Mobile Number"
                    maxLength={10}
                    className="pl-16 h-14 text-lg font-bold tracking-widest bg-white border-2 border-zinc-50 rounded-lg focus:border-primary shadow-sm"
                    value={phoneNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 10) {
                        val = val.slice(0, 10);
                      }
                      setPhoneNumber(val);
                    }}
                  />
               </div>
               
               <div className="text-[10px] text-zinc-400 text-center px-8 leading-relaxed font-medium">
                  By clicking Continue, you agree to our{" "}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-primary font-bold hover:underline">Terms of Service</button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white w-[90vw] rounded-2xl p-6 border-zinc-100 shadow-xl">
                      <DialogHeader>
                        <DialogTitle>Terms of Service</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm text-zinc-600 space-y-4 max-h-[60vh] overflow-y-auto">
                         <p>Welcome to GetGoLoad. By continuing to use our services, you agree to comply with all applicable policies and terms.</p>
                         <p><span className="text-primary font-bold">1. User Responsibilities:</span> You must provide accurate information during registration and booking.</p>
                         <p><span className="text-primary font-bold">2. Service Usage:</span> You agree not to misuse the platform or engage in any unlawful activities.</p>
                         <p><span className="text-primary font-bold">3. Payments:</span> All transactions are processed securely and subject to our payment terms.</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {" "}and{" "}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-primary font-bold hover:underline">Privacy Policy</button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white w-[90vw] rounded-2xl p-6 border-zinc-100 shadow-xl">
                      <DialogHeader>
                        <DialogTitle>Privacy Policy</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm text-zinc-600 space-y-4 max-h-[60vh] overflow-y-auto">
                         <p>Your privacy is critically important to us. This policy outlines how we handle your personal data.</p>
                         <p><span className="text-primary font-bold">1. Data Collection:</span> We collect necessary information such as phone numbers, location, and device details to provide our services effectively.</p>
                         <p><span className="text-primary font-bold">2. Data Usage:</span> Your data is used exclusively to facilitate vehicle bookings, driver communication, and service improvements.</p>
                         <p><span className="text-primary font-bold">3. Security:</span> We implement standard security measures to protect your personal information against unauthorized access.</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  .
               </div>
            </div>

            <div className="pt-6">
                <Button 
                  disabled={phoneNumber.length !== 10 || loading}
                  className="w-full h-12 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                  onClick={handleSendOtp}
                >
                   {loading ? "Sending..." : "Send Otp"}
                </Button>
            </div>
          </div>
        );
      case 3: // OTP Verification
        return (
          <div className="flex flex-col py-8 px-4 space-y-8">
            <div className="space-y-4">
               <Button variant="ghost" size="icon" className="rounded-full bg-zinc-100" onClick={() => setStep(2)}>
                  <ChevronLeft className="w-6 h-6 text-zinc-600" />
               </Button>
                <div className="space-y-1 pt-4">
                   <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Verify Account</h1>
                   <p className="text-sm text-zinc-500 font-medium">Enter 4-digit code sent to +91 {phoneNumber}</p>
                </div>
            </div>

            <div className="space-y-8">
               <div className="flex justify-between gap-4">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-full h-16 bg-white border-2 border-zinc-50 rounded-2xl text-center text-2xl font-bold text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all"
                    />
                  ))}
               </div>
                               <p className="text-center">
                   <span className="text-sm text-zinc-500 font-bold">Didn't receive code?</span> <br/>
                   <Button variant="link" className="p-0 h-fit text-primary font-bold text-[10px] tracking-tight" onClick={handleSendOtp}>Resend Otp</Button>
                </p>
            </div>

            <div className="pt-6">
                <Button 
                  disabled={otp.some(d => !d) || loading}
                  className="w-full h-12 rounded-xl bg-primary text-white text-base font-bold shadow-lg shadow-primary/20"
                  onClick={handleVerifyOtp}
                >
                   {loading ? "Verifying..." : "Verify Now"}
                </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative overflow-hidden bg-gradient-to-br from-white to-zinc-50">
      <AnimatePresence mode="wait">
        <motion.div
           key={step}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
         >
           {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;

