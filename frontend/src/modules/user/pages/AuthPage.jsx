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
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

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

  const renderContent = () => {
    switch (step) {
      case 1: // Onboarding
        return (
          <div className="flex flex-col items-center justify-between h-[80vh] py-12 px-6">
            <div className="space-y-12">
               <div className="flex flex-col items-center gap-6">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden">
                     <motion.div
                       animate={{ x: [-20, 20, -20] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     >
                        <Truck className="w-16 h-16 text-primary" />
                     </motion.div>
                  </div>
                  <div className="text-center space-y-2">
                     <h1 className="text-3xl font-black text-black tracking-tighter">Getgo<span className="text-primary">ride</span></h1>
                     <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">Vehicle Booking App</p>
                  </div>
               </div>
               <div className="space-y-4">
                  {OnboardingSlides.slice(0, 1).map((slide, idx) => (
                    <div key={idx} className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-2">
                       <h3 className="font-bold text-black text-lg leading-tight">{slide.title}</h3>
                       <p className="text-sm text-zinc-500 leading-relaxed font-medium">{slide.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
            <Button 
               className="w-full h-16 rounded-3xl bg-primary text-white text-lg font-black shadow-2xl shadow-primary/30"
               onClick={handleNext}
            >
               Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        );
      case 2: // Phone Login
        return (
          <div className="flex flex-col h-[80vh] py-12 px-4 space-y-10">
            <div className="space-y-4">
               <Button variant="ghost" size="icon" className="rounded-full bg-zinc-100" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-6 h-6 text-zinc-600" />
               </Button>
               <div className="space-y-1 pt-4">
                  <h1 className="text-2xl font-black text-black tracking-tight">Enter Phone <br/>Number</h1>
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
                    className="pl-20 h-16 text-lg font-bold tracking-widest bg-white border-2 border-zinc-50 rounded-2xl focus:border-primary shadow-sm"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
               </div>
               
               <p className="text-[10px] text-zinc-400 text-center px-8 leading-relaxed font-medium">
                  By clicking Continue, you agree to our <span className="text-primary font-bold">Terms of Service</span> and <span className="text-primary font-bold">Privacy Policy</span>.
               </p>
            </div>

            <div className="flex-1 flex flex-col justify-end">
               <Button 
                 disabled={phoneNumber.length !== 10}
                 className="w-full h-16 rounded-3xl bg-primary text-white text-lg font-black shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
                 onClick={handleNext}
               >
                  Send OTP
               </Button>
            </div>
          </div>
        );
      case 3: // OTP Verification
        return (
          <div className="flex flex-col h-[80vh] py-12 px-4 space-y-10">
            <div className="space-y-4">
               <Button variant="ghost" size="icon" className="rounded-full bg-zinc-100" onClick={() => setStep(2)}>
                  <ChevronLeft className="w-6 h-6 text-zinc-600" />
               </Button>
               <div className="space-y-1 pt-4">
                  <h1 className="text-2xl font-black text-black tracking-tight">Verify <br/>Account</h1>
                  <p className="text-sm text-zinc-500 font-medium">Enter 4-digit code sent to +91 {phoneNumber}</p>
               </div>
            </div>

            <div className="space-y-8">
               <div className="flex justify-between gap-4">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx}
                      id={`otp-${idx}`}
                      type="number"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-full h-16 bg-white border-2 border-zinc-50 rounded-2xl text-center text-2xl font-black text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm transition-all"
                    />
                  ))}
               </div>
               
               <p className="text-center">
                  <span className="text-sm text-zinc-400 font-bold">Didn't receive code?</span> <br/>
                  <Button variant="link" className="p-0 h-fit text-primary font-black uppercase text-[10px] tracking-widest">Resend OTP in 56s</Button>
               </p>
            </div>

            <div className="flex-1 flex flex-col justify-end">
               <Button 
                 disabled={otp.some(d => !d)}
                 className="w-full h-16 rounded-3xl bg-primary text-white text-lg font-black shadow-2xl shadow-primary/30"
                 onClick={() => navigate("/user/dashboard")}
               >
                  Verify Now
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
