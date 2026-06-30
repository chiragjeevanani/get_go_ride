import React, { useState } from "react";
import { Shield, ChevronLeft, ArrowRight, Eye, Lock, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const PrivacyPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const sections = [
    {
      id: "overview",
      icon: <Eye className="w-4 h-4" />,
      title: "Overview",
      content: "At Get Go Load, we value your trust and privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related logistical services. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application."
    },
    {
      id: "collection",
      icon: <FileText className="w-4 h-4" />,
      title: "Data Collection",
      content: "We collect information that identifies, relates to, describes, or could reasonably be linked with you. This includes: location data (to track shipments and suggest nearby vehicles), personal identifiers (name, email, phone number), payment information via secure processors, and vehicle data for driver partners."
    },
    {
      id: "security",
      icon: <Lock className="w-4 h-4" />,
      title: "Security & Storage",
      content: "We use administrative, technical, and physical security measures to help protect your personal information. All communications between the app and our servers are encrypted using industry-standard SSL/TLS protocols. Your location tracking details are only retained for the duration of the ride/delivery plus safety auditing periods."
    },
    {
      id: "rights",
      icon: <CheckCircle className="w-4 h-4" />,
      title: "Your Rights",
      content: "Depending on your location, you may have the right to request access to the personal data we hold about you, request corrections to incorrect data, or request the deletion of your account and associated personal details. You can manage these preferences directly through the app profile settings or by contacting support."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 font-sans pb-16">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen shadow-premium flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 pt-6 pb-4 border-b border-zinc-100 px-4 sticky top-0 bg-white/95 backdrop-blur-md z-30">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white shadow-sm border border-zinc-100 w-9 h-9 active:scale-95 transition-transform"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold text-zinc-900 tracking-tight leading-none uppercase italic">Privacy Policy</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Last updated: June 2026</p>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-4 space-y-6">
          {/* Main Hero Card */}
          <Card className="border-2 border-primary/20 bg-primary/[0.03] rounded-3xl p-6 relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-semibold uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-md tracking-wider leading-none">TRUST & SECURITY</span>
                <h3 className="text-base font-semibold text-zinc-900 leading-tight uppercase italic mt-1.5">Your Data is Safe</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed max-w-[200px]">We employ end-to-end encryption to secure your personal info and trip routes.</p>
              </div>
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/25">
                <Shield className="w-6 h-6" strokeWidth={2.5} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2"></div>
          </Card>

          {/* Interactive Navigation Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap border shrink-0 ${
                  activeTab === sec.id
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-white text-zinc-400 border-zinc-100 hover:text-zinc-600 hover:border-zinc-200"
                }`}
              >
                {sec.icon}
                {sec.title}
              </button>
            ))}
          </div>

          {/* Detailed Content Display with Animation */}
          <div className="space-y-4">
            {sections.map((sec) => {
              if (sec.id !== activeTab) return null;
              return (
                <div 
                  key={sec.id}
                  className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <h4 className="text-[10px] font-semibold uppercase text-zinc-400 tracking-[0.15em] px-1">
                    {sec.title} Details
                  </h4>
                  <Card className="border border-zinc-100 shadow-sm rounded-2.5xl bg-white">
                    <CardContent className="p-5">
                      <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                        {sec.content}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Contact and Agreements */}
          <Card className="border-none bg-zinc-950 p-6 rounded-3xl overflow-hidden relative shadow-xl">
            <div className="relative z-10 space-y-2">
              <h3 className="text-white font-semibold italic text-base leading-none uppercase tracking-tighter">Have Questions?</h3>
              <p className="text-zinc-400 text-[9px] font-bold uppercase leading-relaxed max-w-[200px]">
                Reach out to our Data Privacy Officer with any requests regarding your rights.
              </p>
              <Button 
                variant="outline" 
                className="h-9 px-4 rounded-xl bg-zinc-900 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-750 text-white text-[9px] font-semibold uppercase tracking-widest mt-1"
                onClick={() => navigate("/support")}
              >
                Get Support <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
            <Shield className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-900 rotate-[15deg] z-0" />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
