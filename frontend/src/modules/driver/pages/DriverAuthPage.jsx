import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Phone, MapPin, ArrowRight, ShieldCheck, 
  Truck, Check, User, Briefcase, MapPinned, Info, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DriverAuthPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Splash/Onboarding, 2: Phone, 3: OTP, 4-7: Wizard
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [formData, setFormData] = useState({
    name: "",
    vehicleType: "",
    capacity: "",
    regNumber: "",
    categories: [],
    areas: ""
  });

  const onboardingSlides = [
    { 
      title: "Earn More. Drive Smart.", 
      desc: "Connect with verified leads for goods, house shifting, and more.", 
      icon: <Truck className="w-20 h-20 text-primary" /> 
    }
  ];

  const vehicleTypes = ["Mini Truck (Tata Ace)", "Pick-up (Bolero)", "Intermediate Truck (6-14ft)", "Heavy Truck", "Rickshaw"];
  const serviceCategories = ["Goods Transport", "House Shifting", "Passenger", "Emergency"];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) document.getElementById(`otp-${index + 1}`).focus();
  };

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const renderContent = () => {
    switch (step) {
      case 1: // Splash
        return (
          <div className="flex flex-col items-center justify-between h-[85vh] py-12 px-6">
            <div className="space-y-12 w-full">
               <div className="flex flex-col items-center gap-6">
                  <div className="w-40 h-40 bg-primary/10 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden shadow-inner rotate-3">
                     <motion.div
                       animate={{ x: [-30, 30, -30], rotate: [-2, 2, -2] }}
                       transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                     >
                        <Truck className="w-20 h-20 text-primary" strokeWidth={1.5} />
                     </motion.div>
                  </div>
                  <div className="text-center space-y-2">
                     <h1 className="text-4xl font-black text-black tracking-tighter uppercase italic">Safar<span className="text-primary">Setto</span></h1>
                     <Badge className="bg-black text-white text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full border-none">DRIVER PORTAL</Badge>
                  </div>
               </div>
               <div className="space-y-4">
                  {onboardingSlides.map((slide, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] border-2 border-primary/20 shadow-premium space-y-3 relative overflow-hidden group">
                       <h3 className="font-black text-black text-2xl leading-tight relative z-10">{slide.title}</h3>
                       <p className="text-sm text-zinc-400 leading-relaxed font-bold uppercase tracking-tight relative z-10">{slide.desc}</p>
                       <Zap className="absolute -right-6 -bottom-6 w-32 h-32 text-primary/5 group-hover:text-primary/10 transition-colors" />
                    </div>
                  ))}
               </div>
            </div>
            <Button 
               className="w-full h-16 rounded-[2rem] bg-primary text-black text-xl font-black shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all"
               onClick={handleNext}
            >
               Get Started <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>
        );

      case 2: // Phone
        return (
          <div className="flex flex-col h-[85vh] py-12 px-6 space-y-10">
            <div className="space-y-4">
               <Button variant="ghost" size="icon" className="rounded-full bg-zinc-50 border border-zinc-100" onClick={handleBack}>
                  <ChevronLeft className="w-6 h-6 text-zinc-600" />
               </Button>
               <div className="space-y-1 pt-4">
                  <h1 className="text-3xl font-black text-black tracking-tight leading-tight">Enter Phone <br/>Number</h1>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Verification for vehicle owners</p>
               </div>
            </div>

            <div className="space-y-6">
               <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-zinc-100 pr-4">
                     <span className="text-sm font-black text-zinc-400">+91</span>
                  </div>
                  <Input 
                    type="tel"
                    placeholder="Mobile Number"
                    className="pl-24 h-16 text-xl font-black tracking-[0.1em] bg-white border-2 border-zinc-100 rounded-[1.5rem] focus:border-primary shadow-sm transition-all text-black"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
               </div>
               
               <div className="flex gap-3 px-2">
                 <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                 <p className="text-[10px] text-zinc-400 font-bold leading-relaxed uppercase tracking-tight italic">
                   Your profile stays hidden <span className="text-black">until approval</span>. We value your privacy and data security.
                 </p>
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-end">
               <Button 
                 disabled={phoneNumber.length !== 10}
                 className="w-full h-16 rounded-[2rem] bg-primary text-black text-xl font-black shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all"
                 onClick={handleNext}
               >
                  Send OTP
               </Button>
            </div>
          </div>
        );

      case 3: // OTP
        return (
          <div className="flex flex-col h-[85vh] py-12 px-6 space-y-10">
            <div className="space-y-4">
               <Button variant="ghost" size="icon" className="rounded-full bg-zinc-50 border border-zinc-100" onClick={handleBack}>
                  <ChevronLeft className="w-6 h-6 text-zinc-600" />
               </Button>
               <div className="space-y-1 pt-4">
                  <h1 className="text-3xl font-black text-black tracking-tight leading-tight">Verify <br/>Account</h1>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Code sent to +91 {phoneNumber}</p>
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
                      className="w-full h-16 bg-white border-2 border-zinc-100 rounded-[1.25rem] text-center text-3xl font-black text-primary focus:border-primary focus:ring-8 focus:ring-primary/5 shadow-sm transition-all"
                    />
                  ))}
               </div>
               
               <p className="text-center">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Didn't receive code?</span> <br/>
                  <Button variant="link" className="p-0 h-fit text-primary font-black uppercase text-[10px] tracking-[0.2em] mt-2">Resend OTP in 56s</Button>
               </p>
            </div>

            <div className="flex-1 flex flex-col justify-end">
               <Button 
                 disabled={otp.some(d => !d)}
                 className="w-full h-16 rounded-[2rem] bg-primary text-black text-xl font-black shadow-2xl shadow-primary/30 transition-all"
                 onClick={handleNext}
               >
                  Verify Now
               </Button>
            </div>
          </div>
        );

      case 4: // Wizard Step 1: Personal Details
        return (
          <div className="flex flex-col h-[85vh] py-8 px-6 space-y-10">
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-6">
                 <Progress value={25} className="h-2 flex-1 mr-4 bg-zinc-100" />
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">Step 1/4</span>
               </div>
               <div className="space-y-1">
                  <h1 className="text-2xl font-black text-black tracking-tight uppercase">Personal Details</h1>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em]">Let's start with your profile</p>
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-3xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-1 group cursor-pointer hover:border-primary transition-colors">
                     <User className="w-8 h-8 text-zinc-300 group-hover:text-primary transition-colors" />
                     <span className="text-[8px] font-black text-zinc-400 uppercase">Add Photo</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                    <Input 
                      placeholder="John Doe" 
                      className="h-14 rounded-2xl bg-white border-2 border-zinc-100 font-bold text-black focus:border-primary shadow-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Native City</label>
                    <Input 
                      placeholder="Indore" 
                      className="h-14 rounded-2xl bg-white border-2 border-zinc-100 font-bold text-black focus:border-primary shadow-sm"
                    />
                  </div>
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-end">
               <Button 
                 disabled={!formData.name}
                 className="w-full h-16 rounded-[2rem] bg-primary text-black text-xl font-black shadow-2xl shadow-primary/30 transition-all"
                 onClick={handleNext}
               >
                  Continue
               </Button>
            </div>
          </div>
        );

      case 5: // Wizard Step 2: Vehicle Details
        return (
          <div className="flex flex-col h-[85vh] py-8 px-6 space-y-10">
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-6">
                 <Progress value={50} className="h-2 flex-1 mr-4 bg-zinc-100" />
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">Step 2/4</span>
               </div>
               <div className="space-y-1">
                  <h1 className="text-2xl font-black text-black tracking-tight uppercase">Vehicle Details</h1>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em]">What are you driving?</p>
               </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-1">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Vehicle Type</label>
                    <div className="grid grid-cols-1 gap-2">
                      {vehicleTypes.map((type) => (
                        <div 
                          key={type}
                          onClick={() => setFormData({...formData, vehicleType: type})}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex justify-between items-center cursor-pointer",
                            formData.vehicleType === type ? "border-primary bg-primary/5" : "border-zinc-100 bg-white"
                          )}
                        >
                          <span className="text-xs font-black text-black uppercase">{type}</span>
                          {formData.vehicleType === type && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" strokeWidth={4} /></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Reg. Number</label>
                      <Input placeholder="MP-09-XX-XXXX" className="h-14 rounded-2xl bg-white border-2 border-zinc-100 font-black uppercase text-black" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Capacity</label>
                      <Input placeholder="e.g. 500kg" className="h-14 rounded-2xl bg-white border-2 border-zinc-100 font-black uppercase text-black" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="pt-6">
               <Button 
                 disabled={!formData.vehicleType}
                 className="w-full h-16 rounded-[2rem] bg-primary text-black text-xl font-black shadow-2xl shadow-primary/30 transition-all"
                 onClick={handleNext}
               >
                  Next Step
               </Button>
            </div>
          </div>
        );

      case 6: // Wizard Step 3: Categories
        return (
          <div className="flex flex-col h-[85vh] py-8 px-6 space-y-10">
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-6">
                 <Progress value={75} className="h-2 flex-1 mr-4 bg-zinc-100" />
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">Step 3/4</span>
               </div>
               <div className="space-y-1">
                  <h1 className="text-2xl font-black text-black tracking-tight uppercase">Service Categories</h1>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em]">Select what you offer</p>
               </div>
            </div>

            <div className="space-y-4 flex-1">
               <div className="grid grid-cols-1 gap-3">
                  {serviceCategories.map((cat) => (
                    <div 
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        "p-5 rounded-[1.5rem] border-2 transition-all flex items-center gap-4 cursor-pointer relative overflow-hidden",
                        formData.categories.includes(cat) ? "border-primary bg-primary/5" : "border-zinc-100 bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        formData.categories.includes(cat) ? "bg-primary text-black" : "bg-zinc-50 text-zinc-300"
                      )}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-black uppercase tracking-tight">{cat}</span>
                      {formData.categories.includes(cat) && <Check className="absolute right-6 w-5 h-5 text-primary stroke-[4]" />}
                    </div>
                  ))}
               </div>
               <div className="p-4 bg-zinc-50 rounded-2xl flex gap-3 border border-zinc-100">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed italic">You can change these categories anytime from your profile settings.</p>
               </div>
            </div>

            <div className="pt-6">
               <Button 
                 disabled={formData.categories.length === 0}
                 className="w-full h-16 rounded-[2rem] bg-primary text-black text-xl font-black shadow-2xl shadow-primary/30 transition-all"
                 onClick={handleNext}
               >
                  Almost Done
               </Button>
            </div>
          </div>
        );

      case 7: // Wizard Step 4: Operating Areas
        return (
          <div className="flex flex-col h-[85vh] py-8 px-6 space-y-10">
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-6">
                 <Progress value={100} className="h-2 flex-1 mr-4 bg-zinc-100" />
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">Final Step</span>
               </div>
               <div className="space-y-1">
                  <h1 className="text-2xl font-black text-black tracking-tight uppercase">Operating Areas</h1>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em]">Where do you operates?</p>
               </div>
            </div>

            <div className="space-y-6 flex-1">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Secondary routes / Cities</label>
                    <div className="relative">
                       <MapPinned className="absolute left-4 top-4 w-5 h-5 text-zinc-300" />
                       <textarea 
                          placeholder="e.g. Indore to Bhopal, Indore Local, Dewas..."
                          className="w-full h-32 pl-12 pr-4 pt-4 rounded-2xl bg-white border-2 border-zinc-100 font-bold text-sm text-black focus:border-primary shadow-sm outline-none resize-none"
                          value={formData.areas}
                          onChange={(e) => setFormData({...formData, areas: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-5 rounded-2xl flex gap-4 border border-emerald-100">
                     <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-xs font-black text-emerald-700 uppercase leading-tight">Verification in Progress</p>
                        <p className="text-[9px] font-bold text-emerald-600/80 uppercase leading-relaxed tracking-tight">Our team will verify your vehicle details within 24 hours.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-6">
               <Button 
                 disabled={!formData.areas}
                 className="w-full h-16 rounded-[2rem] bg-primary text-black text-xl font-black shadow-2xl shadow-primary/30 transition-all"
                 onClick={() => navigate("/driver/subscribe")}
               >
                  Complete Onboarding
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

export default DriverAuthPage;
