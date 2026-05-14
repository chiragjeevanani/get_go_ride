import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Phone, MapPin, ArrowRight, ShieldCheck, 
  Truck, Check, User, Briefcase, MapPinned, Info, Zap, Home, FileText
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
import { authApi, categoryApi, vehicleApi, vendorApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import { toast } from "sonner";
import { useEffect } from "react";

const DriverAuthPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Splash/Onboarding, 2: Phone, 3: OTP, 4-7: Wizard
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nativeCity: "",
    vehicleType: "",
    capacity: "",
    regNumber: "",
    categories: [],
    areas: "",
    profileImage: null,
    licenseDoc: null,
    rcDoc: null,
    aadharDoc: null
  });

  const [backendCategories, setBackendCategories] = useState([]);
  const [backendVehicles, setBackendVehicles] = useState([]);
  const [isCustomVehicle, setIsCustomVehicle] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (step < 4) return;
    const fetchOnboardingData = async () => {
      try {
        const catRes = await categoryApi.getAll();
        const vehRes = await vehicleApi.getAll();
        
        const cats = catRes.data || [];
        const vehs = vehRes.data || [];
        
        setBackendCategories(cats);
        setBackendVehicles(vehs);
      } catch (err) {
        console.error("Failed to fetch onboarding metadata:", err);
      }
    };
    fetchOnboardingData();
  }, [step]);

  const onboardingSlides = [
    { 
      title: "Earn More. Drive Smart.", 
      desc: "Connect with verified leads for goods, house shifting, and more.", 
      icon: <Truck className="w-20 h-20 text-primary" /> 
    }
  ];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

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
      const res = await authApi.sendOtp(phoneNumber, 'vendor');
      toast.success(res.message);
      
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
      const res = await authApi.verifyOtp(phoneNumber, otpString, 'vendor');
      
      const { accessToken, refreshToken, vendor, isNewUser } = res.data;
      setIsNewUser(isNewUser);
      
      // Clear other module tokens to prevent cross-contamination
      storage.clearAll();

      localStorage.setItem('gtgl_driver_token', accessToken);
      localStorage.setItem('gtgl_driver_refresh_token', refreshToken);
      storage.setDriver(vendor);
      
      toast.success("Verified successfully!");

      // If existing vendor and onboarding complete, go to dashboard
      // Otherwise, start/continue the wizard
      if (!isNewUser && vendor.onboardingComplete) {
        navigate("/driver/dashboard");
      } else {
        setStep(4);
      }
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOnboarding = async () => {
    try {
      setLoading(true);
      
      // Prepare documents array if provided
      const documents = [];
      if (formData.licenseDoc) documents.push({ title: "Driving License", url: formData.licenseDoc });
      if (formData.rcDoc) documents.push({ title: "Vehicle RC", url: formData.rcDoc });
      if (formData.aadharDoc) documents.push({ title: "Aadhar Card", url: formData.aadharDoc });

      const payload = {
        name: formData.name,
        profileImage: formData.profileImage,
        nativeCity: formData.nativeCity,
        vehicleType: formData.vehicleType,
        vehicleRegNumber: formData.regNumber,
        vehicleCapacity: formData.capacity,
        serviceCategories: formData.categories,
        operatingAreas: formData.areas,
        location: formData.areas || "Default Local",
        documents: documents
      };
      
      const res = await vendorApi.submitOnboarding(payload);
      
      if (res.data) {
        storage.setDriver(res.data);
      }
      toast.success("Profile saved successfully!");
      navigate("/driver/subscribe");
    } catch (error) {
      toast.error(error.message || "Failed to save onboarding details");
    } finally {
      setLoading(false);
    }
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

  const handleDocUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large. Max 5MB allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
        toast.success(`${field.replace('Doc', '').toUpperCase()} uploaded`);
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
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 10) {
                        val = val.slice(-10);
                      }
                      setPhoneNumber(val);
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
                 disabled={phoneNumber.length !== 10 || loading}
                 className="w-full h-12 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
                 onClick={handleSendOtp}
               >
                  {loading ? "Sending..." : "Send Otp"}
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
                  <Button variant="link" className="p-0 h-fit text-primary font-bold text-[9px] tracking-tight mt-1" onClick={handleSendOtp}>Resend OTP</Button>
               </p>
            </div>

            <div className="pt-4">
               <Button 
                 disabled={otp.some(d => !d) || loading}
                 className="w-full h-12 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                 onClick={handleVerifyOtp}
               >
                  {loading ? "Verifying..." : "Verify Now"}
               </Button>
            </div>
          </div>
        );

      case 4: // Wizard Step 1: Personal Details
        return (
          <div className="flex flex-col py-6 px-5 space-y-6">
            <div className="space-y-3">
               <div className="flex justify-between items-center mb-2">
                 <Progress value={20} className="h-1.5 flex-1 mr-3 bg-zinc-100" />
                 <span className="text-[10px] font-bold text-primary tracking-tight">Step 1/5</span>
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
                       value={formData.nativeCity}
                       onChange={(e) => setFormData({...formData, nativeCity: e.target.value})}
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
                 <Progress value={40} className="h-1.5 flex-1 mr-3 bg-zinc-100" />
                 <span className="text-[10px] font-bold text-primary tracking-tight">Step 2/5</span>
               </div>
               <div className="space-y-0.5">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Vehicle Details</h1>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">What are you driving?</p>
               </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-1">
               <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Select Vehicle Type</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(backendVehicles.length > 0 ? backendVehicles : [
                        { _id: "v1", name: "Mini Truck (Tata Ace)", capacity: "800kg", details: "LCV • 4 Tyres • Open Body", categorySlug: "goods" },
                        { _id: "v2", name: "Pick-up (Bolero)", capacity: "1.5 Tonnes", details: "Pickup • 4 Tyres", categorySlug: "goods" },
                        { _id: "v3", name: "Intermediate Truck (6-14ft)", capacity: "5 Tonnes", details: "ICV • 6 Tyres", categorySlug: "goods" },
                        { _id: "v4", name: "Heavy Truck", capacity: "15 Tonnes", details: "HCV • 10-12 Tyres", categorySlug: "goods" }
                      ]).map((veh) => (
                        <div 
                          key={veh._id}
                          onClick={() => {
                            setIsCustomVehicle(false);
                            setFormData(prev => ({
                              ...prev,
                              vehicleType: veh.name,
                              capacity: veh.capacity,
                              categories: veh.categorySlugs || (veh.categorySlug ? [veh.categorySlug] : [])
                            }));
                          }}
                          className={cn(
                            "p-3.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer",
                            (!isCustomVehicle && formData.vehicleType === veh.name) 
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                              : "border-zinc-100 bg-white hover:border-zinc-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                              {veh.image ? (
                                <img src={veh.image} alt={veh.name} className="w-8 h-8 object-contain" />
                              ) : (
                                <Truck className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                              )}
                            </div>
                            <div className="text-left">
                              <h4 className="text-[12px] font-bold text-zinc-950 leading-none">{veh.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-bold mt-1">{veh.capacity} • {veh.details || "Standard Vehicle"}</p>
                            </div>
                          </div>
                          {(!isCustomVehicle && formData.vehicleType === veh.name) && (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-zinc-900" strokeWidth={4} />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Custom Vehicle Trigger */}
                      <div 
                        onClick={() => {
                          setIsCustomVehicle(true);
                          setFormData(prev => ({
                            ...prev,
                            vehicleType: "",
                            capacity: "",
                            categories: []
                          }));
                          setCustomCategory("");
                        }}
                        className={cn(
                          "p-3.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer",
                          isCustomVehicle 
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                            : "border-zinc-100 bg-white hover:border-zinc-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                            <Zap className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-[12px] font-bold text-zinc-950 leading-none">Other / Custom Vehicle</h4>
                            <p className="text-[10px] text-zinc-500 font-bold mt-1">My vehicle is not listed in options</p>
                          </div>
                        </div>
                        {isCustomVehicle && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-zinc-900" strokeWidth={4} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Standard Vehicle Categories Accordion Form */}
                  {(!isCustomVehicle && formData.vehicleType) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3.5 bg-zinc-50/50 p-4 rounded-xl border border-dashed border-zinc-200 mt-2"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">
                          Select Operating Categories for <span className="text-primary font-extrabold">{formData.vehicleType}</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {(backendCategories.length > 0 ? backendCategories : [
                            { _id: "c1", name: "Goods Transport", slug: "goods" },
                            { _id: "c2", name: "House Shifting", slug: "house" },
                            { _id: "c3", name: "Emergency", slug: "emergency" },
                            { _id: "c4", name: "Construction", slug: "construction" }
                          ]).map((cat) => {
                            const isSelected = formData.categories.includes(cat.slug);
                            return (
                              <button
                                type="button"
                                key={cat._id}
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    categories: prev.categories.includes(cat.slug)
                                      ? prev.categories.filter(s => s !== cat.slug)
                                      : [...prev.categories, cat.slug]
                                  }));
                                }}
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all bg-white",
                                  isSelected 
                                    ? "bg-primary/5 border-primary/40 text-zinc-900"
                                    : "border-zinc-100 text-zinc-500 hover:border-zinc-200"
                                )}
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">{cat.name}</span>
                                <div className={cn(
                                  "w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all",
                                  isSelected 
                                    ? "bg-primary border-primary text-black" 
                                    : "border-zinc-300"
                                )}>
                                  {isSelected && (
                                    <svg className="w-2 h-2 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {formData.categories.length === 0 && (
                          <p className="text-[9px] font-bold text-amber-500 italic uppercase px-1 mt-1">* Select at least one category</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Custom Vehicle Details Accordion Form */}
                  {isCustomVehicle && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3.5 bg-zinc-50/50 p-4 rounded-xl border border-dashed border-zinc-200 mt-2"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Custom Vehicle Model Name</label>
                        <Input 
                          placeholder="e.g. Tata Ultra 1518, Mahindra Maxx" 
                          className="h-11 rounded-xl bg-white border-2 border-zinc-100 font-bold text-zinc-900 text-xs focus:border-primary shadow-sm"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Vehicle Classifications (Select Multiple)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(backendCategories.length > 0 ? backendCategories : [
                            { _id: "c1", name: "Goods Transport", slug: "goods" },
                            { _id: "c2", name: "House Shifting", slug: "house" },
                            { _id: "c3", name: "Emergency", slug: "emergency" },
                            { _id: "c4", name: "Construction", slug: "construction" }
                          ]).map((cat) => {
                            const isSelected = formData.categories.includes(cat.slug);
                            return (
                              <button
                                type="button"
                                key={cat._id}
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    categories: prev.categories.includes(cat.slug)
                                      ? prev.categories.filter(s => s !== cat.slug)
                                      : [...prev.categories, cat.slug]
                                  }));
                                }}
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all",
                                  isSelected 
                                    ? "bg-primary/5 border-primary/40 text-zinc-900"
                                    : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200"
                                )}
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">{cat.name}</span>
                                <div className={cn(
                                  "w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all",
                                  isSelected 
                                    ? "bg-primary border-primary text-black" 
                                    : "border-zinc-300"
                                )}>
                                  {isSelected && (
                                    <svg className="w-2 h-2 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Custom Load Capacity</label>
                        <Input 
                          placeholder="e.g. 10 Tonnes, 900kg" 
                          className="h-11 rounded-xl bg-white border-2 border-zinc-100 font-bold text-zinc-900 text-xs focus:border-primary shadow-sm"
                          value={formData.capacity}
                          onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1">Registration Plate Number</label>
                    <Input 
                      placeholder="e.g. MP-09-AB-1234" 
                      className="h-11 rounded-xl bg-white border-2 border-zinc-100 font-bold text-zinc-900 text-xs focus:border-primary"
                      value={formData.regNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, regNumber: e.target.value.toUpperCase() }))}
                    />
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <Button 
                 disabled={!formData.vehicleType || !formData.regNumber || !formData.capacity || !formData.categories || formData.categories.length === 0}
                 className="w-full h-11 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                 onClick={handleNext}
               >
                  Next Step
               </Button>
            </div>
          </div>
        );

      case 6: // Wizard Step 3: Service Categories (Dynamic multi-select)
        const getCategoryIcon = (iconName) => {
          switch (iconName?.toLowerCase()) {
            case 'truck':
            case 'package':
            case 'goods':
              return <Truck className="w-4 h-4" />;
            case 'home':
            case 'house':
              return <Home className="w-4 h-4" />;
            case 'flame':
            case 'shield':
            case 'emergency':
              return <ShieldCheck className="w-4 h-4" />;
            case 'construction':
            case 'wrench':
            case 'crane':
              return <Briefcase className="w-4 h-4" />;
            default:
              return <Briefcase className="w-4 h-4" />;
          }
        };

        const availableCategories = backendCategories.length > 0 ? backendCategories : [
          { _id: "c1", name: "Goods Transport", slug: "goods", description: "Logistics and goods hauling", icon: "Truck" },
          { _id: "c2", name: "House Shifting", slug: "house", description: "Residential relocation packages", icon: "Home" },
          { _id: "c3", name: "Emergency Response", slug: "emergency", description: "Critical emergency breakdown assistance", icon: "Flame" },
          { _id: "c4", name: "Construction Hauling", slug: "construction", description: "Aggregates and raw material supplies", icon: "Briefcase" }
        ];

        return (
          <div className="flex flex-col py-6 px-5 space-y-6">
            <div className="space-y-3">
               <div className="flex justify-between items-center mb-2">
                 <Progress value={60} className="h-1.5 flex-1 mr-3 bg-zinc-100" />
                 <span className="text-[10px] font-bold text-primary tracking-tight">Step 3/5</span>
               </div>
               <div className="space-y-0.5">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Service Categories</h1>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">What jobs do you want to accept?</p>
               </div>
            </div>

            <div className="space-y-3.5 flex-1 overflow-y-auto no-scrollbar pr-1">
               <div className="grid grid-cols-1 gap-2.5">
                  {availableCategories.map((cat) => (
                    <div 
                      key={cat._id}
                      onClick={() => toggleCategory(cat.slug)}
                      className={cn(
                        "p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer relative overflow-hidden group",
                        formData.categories.includes(cat.slug) 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "border-zinc-100 bg-white hover:border-zinc-200"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all border",
                        formData.categories.includes(cat.slug) 
                          ? "bg-primary border-primary text-zinc-900 shadow-sm" 
                          : "bg-zinc-50 border-zinc-100 text-zinc-400 group-hover:bg-primary/5 group-hover:text-primary"
                      )}>
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <div className="text-left flex-1 pr-6">
                        <span className="text-xs font-bold text-zinc-950 block leading-tight">{cat.name}</span>
                        <span className="text-[9px] text-zinc-500 font-bold block mt-0.5 leading-tight">{cat.description || "Accept requests under this category"}</span>
                      </div>
                      {formData.categories.includes(cat.slug) && (
                        <div className="absolute right-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-zinc-900 stroke-[4]" />
                        </div>
                      )}
                    </div>
                  ))}
               </div>
               <div className="p-3 bg-zinc-50 rounded-xl flex gap-2.5 border border-zinc-100">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[9px] font-bold text-zinc-500 leading-relaxed italic">You can change these service categories anytime from your driver settings.</p>
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
                 <Progress value={80} className="h-1.5 flex-1 mr-3 bg-zinc-100" />
                 <span className="text-[10px] font-bold text-primary tracking-tight">Step 4/5</span>
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
               </div>
            </div>

            <div className="pt-2">
               <Button 
                 disabled={!formData.areas || loading}
                 className="w-full h-11 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                 onClick={handleNext}
               >
                  Next Step
               </Button>
            </div>
          </div>
        );

      case 8: // Wizard Step 5: Document Upload
        return (
          <div className="flex flex-col py-6 px-5 space-y-6">
            <div className="space-y-3">
               <div className="flex justify-between items-center mb-2">
                 <Progress value={100} className="h-1.5 flex-1 mr-3 bg-zinc-100" />
                 <span className="text-[10px] font-bold text-primary tracking-tight">Final Step</span>
               </div>
               <div className="space-y-0.5">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Document Verification</h1>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">Upload docs to get verified badge</p>
               </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
               {[
                 { id: 'license', label: 'Driving License', field: 'licenseDoc' },
                 { id: 'rc', label: 'Vehicle RC', field: 'rcDoc' },
                 { id: 'aadhar', label: 'Aadhar Card', field: 'aadharDoc' }
               ].map((doc) => (
                 <div key={doc.id} className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-tight ml-1 uppercase">{doc.label}</label>
                    <div 
                      onClick={() => document.getElementById(`${doc.id}-upload`).click()}
                      className={cn(
                        "h-24 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative overflow-hidden",
                        formData[doc.field] ? "border-primary bg-primary/5" : "border-zinc-200 bg-zinc-50 hover:border-primary/40"
                      )}
                    >
                       {formData[doc.field] ? (
                         <>
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10">
                               <Check className="w-3 h-3 text-zinc-900 stroke-[4]" />
                            </div>
                            <img src={formData[doc.field]} alt={doc.label} className="w-full h-full object-cover opacity-60" />
                            <span className="absolute bottom-2 bg-white/90 px-3 py-1 rounded-full text-[8px] font-black uppercase text-zinc-900 shadow-sm border border-zinc-100">Tap to Change</span>
                         </>
                       ) : (
                         <>
                            <FileText className="w-6 h-6 text-zinc-300" />
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Click to Upload</span>
                         </>
                       )}
                    </div>
                    <input 
                      id={`${doc.id}-upload`}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleDocUpload(e, doc.field)}
                    />
                 </div>
               ))}

               <div className="bg-emerald-50 p-4 rounded-xl flex gap-3.5 border border-emerald-100">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div className="space-y-0.5">
                     <p className="text-[11px] font-bold text-emerald-800 leading-tight">Fast Verification</p>
                     <p className="text-[9px] font-semibold text-emerald-600 leading-relaxed tracking-tight">Our team will verify your vehicle details within 24 hours.</p>
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <Button 
                 disabled={loading}
                 className="w-full h-11 rounded-xl bg-primary text-zinc-900 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                 onClick={handleSubmitOnboarding}
               >
                  {loading ? "Submitting..." : "Complete Signup"}
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

