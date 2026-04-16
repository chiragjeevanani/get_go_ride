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
import Lottie from "lottie-react";
import loginAnimation from "@/assets/Lottie/LoginPage.json";
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
    areas: "",
    profileImage: null
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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
          <div className="flex flex-col items-center justify-between h-[80vh] py-8 px-6">
            <div className="space-y-8 w-full">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                     <Lottie 
                        animationData={loginAnimation} 
                        loop={true} 
                        className="w-full h-full"
                     />
                  </div>
                  <div className="text-center space-y-1">
                     <h1 className="text-3xl font-bold text-zinc-900 tracking-tight italic">GetGo<span className="text-primary">Load</span></h1>
                     <Badge className="bg-zinc-900 text-white text-[10px] font-bold tracking-tight px-3 py-1 rounded-lg border-none">Driver Portal</Badge>
                  </div>
               </div>
               <div className="space-y-3">
                  {onboardingSlides.map((slide, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[1.5rem] border-2 border-primary/20 shadow-premium space-y-2 relative overflow-hidden group">
                       <h3 className="font-bold text-zinc-900 text-base leading-tight relative z-10">{slide.title}</h3>
                       <p className="text-[10px] text-zinc-500 leading-relaxed font-bold tracking-tight relative z-10">{slide.desc}</p>
                       <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/5 group-hover:text-primary/10 transition-colors" />
                    </div>
                  ))}
               </div>
            </div>
            <Button 
               className="w-full h-12 rounded-xl bg-primary text-black text-sm font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
               onClick={handleNext}
            >
               Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        );

      case 2: // Phone
        return (
          <div className="flex flex-col py-8 px-5 space-y-8">
            <div className="space-y-4">
               <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100" onClick={handleBack}>
                  <ChevronLeft className="w-5 h-5 text-zinc-600" />
               </Button>
               <div className="space-y-0.5 pt-2">
                  <h1 className="text-2xl font-bold text-zinc-900 tracking-tight leading-tight">Enter Phone Number</h1>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">Verification for vehicle owners</p>
               </div>
            </div>

            <div className="space-y-5">
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-zinc-100 pr-3">
                     <span className="text-xs font-black text-zinc-400">+91</span>
                  </div>
                  <Input 
                    type="tel"
                    placeholder="Mobile Number"
                    className="pl-16 h-14 text-lg font-bold tracking-widest bg-white border-2 border-zinc-100 rounded-xl focus:border-primary shadow-sm transition-all text-black"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 10) setPhoneNumber(val);
                    }}
                  />
               </div>
               
               <div className="flex gap-2.5 px-1">
                 <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                 <p className="text-[9px] text-zinc-500 font-bold leading-relaxed tracking-tight italic">
                   Your profile stays hidden <span className="text-zinc-900 font-bold">until approval</span>. We value your privacy and data security.
                 </p>
               </div>
            </div>

            <div className="pt-4">
               <Button 
                 disabled={phoneNumber.length !== 10}
                 className="w-full h-12 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
                 onClick={handleNext}
               >
                  Send Otp
               </Button>
            </div>
          </div>
        );

      case 3: // OTP
        return (
          <div className="flex flex-col py-8 px-5 space-y-8">
            <div className="space-y-4">
               <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100" onClick={handleBack}>
                  <ChevronLeft className="w-5 h-5 text-zinc-600" />
               </Button>
               <div className="space-y-0.5 pt-2">
                  <h1 className="text-2xl font-bold text-zinc-900 tracking-tight leading-tight">Verify Account</h1>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">Code sent to +91 {phoneNumber}</p>
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between gap-3">
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
                      className="w-full h-14 bg-white border-2 border-zinc-100 rounded-xl text-center text-2xl font-bold text-primary focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all"
                    />
                  ))}
               </div>
               
               <p className="text-center">
                  <span className="text-[10px] text-zinc-500 font-bold tracking-tight">Didn't receive code?</span> <br/>
                  <Button variant="link" className="p-0 h-fit text-primary font-bold text-[9px] tracking-tight mt-1">Resend OTP in 56s</Button>
               </p>
            </div>

            <div className="pt-4">
               <Button 
                 disabled={otp.some(d => !d)}
                 className="w-full h-12 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                 onClick={handleNext}
               >
                  Verify Now
               </Button>
            </div>
          </div>
        );

      case 4: // Wizard Step 1: Personal Details
        return (
          <div className="flex flex-col py-6 px-5 space-y-6">
            <div className="space-y-3">
               <div className="flex justify-between items-center mb-2">
                 <Progress value={25} className="h-1.5 flex-1 mr-3 bg-zinc-100" />
                 <span className="text-[10px] font-bold text-primary tracking-tight">Step 1/4</span>
               </div>
               <div className="space-y-0.5">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Personal Details</h1>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">Let's start with your profile</p>
               </div>
            </div>

            <div className="space-y-5">
               <div className="flex justify-center">
                  <div 
                    onClick={() => document.getElementById('profile-upload').click()}
                    className="w-16 h-16 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-0.5 group cursor-pointer hover:border-primary transition-all overflow-hidden"
                  >
                     {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                        <>
                           <User className="w-5 h-5 text-zinc-300 group-hover:text-primary transition-colors" />
                           <span className="text-[7px] font-bold text-zinc-400">Add Photo</span>
                        </>
                     )}
                  </div>
                  <input 
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
               </div>
               <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Full Name</label>
                    <Input 
                      placeholder="John Doe" 
                      className="h-11 rounded-xl bg-white border-2 border-zinc-100 font-bold text-black text-sm focus:border-primary shadow-sm"
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        setFormData({...formData, name: val});
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Native City</label>
                    <Input 
                      placeholder="Indore" 
                      className="h-11 rounded-xl bg-white border-2 border-zinc-100 font-bold text-black text-sm focus:border-primary shadow-sm"
                    />
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <Button 
                 disabled={!formData.name}
                 className="w-full h-11 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                 onClick={handleNext}
               >
                  Continue
               </Button>
            </div>
          </div>
        );

       case 5: // Wizard Step 2: Vehicle Details
        return (
          <div className="flex flex-col py-6 px-5 space-y-6">
            <div className="space-y-3">
               <div className="flex justify-between items-center mb-2">
                 <Progress value={50} className="h-1.5 flex-1 mr-3 bg-zinc-100" />
                 <span className="text-[10px] font-bold text-primary tracking-tight">Step 2/4</span>
               </div>
               <div className="space-y-0.5">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Vehicle Details</h1>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">What are you driving?</p>
               </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-1">
               <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Vehicle Type</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {vehicleTypes.map((type) => (
                        <div 
                          key={type}
                          onClick={() => setFormData({...formData, vehicleType: type})}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all flex justify-between items-center cursor-pointer",
                            formData.vehicleType === type ? "border-primary bg-primary/5" : "border-zinc-100 bg-white"
                          )}
                        >
                          <span className="text-[11px] font-bold text-zinc-900">{type}</span>
                          {formData.vehicleType === type && <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-zinc-900" strokeWidth={4} /></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Reg. Number</label>
                      <Input placeholder="MP-09-XX-XXXX" className="h-11 rounded-xl bg-white border-2 border-zinc-100 font-bold text-zinc-900 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Capacity</label>
                      <Input placeholder="e.g. 500kg" className="h-11 rounded-xl bg-white border-2 border-zinc-100 font-bold text-zinc-900 text-xs" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <Button 
                 disabled={!formData.vehicleType}
                 className="w-full h-11 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                 onClick={handleNext}
               >
                  Next Step
               </Button>
            </div>
          </div>
        );

      case 6: // Wizard Step 3: Categories
        return (
          <div className="flex flex-col py-6 px-5 space-y-6">
            <div className="space-y-3">
               <div className="flex justify-between items-center mb-2">
                 <Progress value={75} className="h-1.5 flex-1 mr-3 bg-zinc-100" />
                 <span className="text-[10px] font-bold text-primary tracking-tight">Step 3/4</span>
               </div>
               <div className="space-y-0.5">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Service Categories</h1>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">Select what you offer</p>
               </div>
            </div>

            <div className="space-y-3.5 flex-1">
               <div className="grid grid-cols-1 gap-2">
                  {serviceCategories.map((cat) => (
                    <div 
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer relative overflow-hidden",
                        formData.categories.includes(cat) ? "border-primary bg-primary/5" : "border-zinc-100 bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        formData.categories.includes(cat) ? "bg-primary text-zinc-900" : "bg-zinc-50 text-zinc-300"
                      )}>
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-zinc-900 tracking-tight">{cat}</span>
                      {formData.categories.includes(cat) && <Check className="absolute right-4 w-4 h-4 text-primary stroke-[3]" />}
                    </div>
                  ))}
               </div>
               <div className="p-3 bg-zinc-50 rounded-xl flex gap-2.5 border border-zinc-100">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[9px] font-bold text-zinc-500 leading-relaxed italic">You can change these categories anytime from your profile settings.</p>
               </div>
            </div>

            <div className="pt-2">
               <Button 
                 disabled={formData.categories.length === 0}
                 className="w-full h-11 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                 onClick={handleNext}
               >
                  Almost Done
               </Button>
            </div>
          </div>
        );

      case 7: // Wizard Step 4: Operating Areas
        return (
          <div className="flex flex-col py-6 px-5 space-y-6">
            <div className="space-y-3">
               <div className="flex justify-between items-center mb-2">
                 <Progress value={100} className="h-1.5 flex-1 mr-3 bg-zinc-100" />
                 <span className="text-[10px] font-bold text-primary tracking-tight">Final Step</span>
               </div>
               <div className="space-y-0.5">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Operating Areas</h1>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">Where do you operates?</p>
               </div>
            </div>

            <div className="space-y-5">
               <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Secondary Routes / Cities</label>
                    <div className="relative">
                       <MapPinned className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-300" />
                       <textarea 
                          placeholder="e.g. Indore to Bhopal, local, etc."
                          className="w-full h-24 pl-10 pr-3 pt-3.5 rounded-xl bg-white border-2 border-zinc-100 font-bold text-xs text-zinc-900 focus:border-primary shadow-sm outline-none resize-none"
                          value={formData.areas}
                          onChange={(e) => setFormData({...formData, areas: e.target.value})}
                       />
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl flex gap-3.5 border border-emerald-100">
                     <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                     <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-emerald-800 leading-tight">Verification in Progress</p>
                        <p className="text-[9px] font-semibold text-emerald-600 leading-relaxed tracking-tight">Our team will verify your vehicle details within 24 hours.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <Button 
                 disabled={!formData.areas}
                 className="w-full h-11 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
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
