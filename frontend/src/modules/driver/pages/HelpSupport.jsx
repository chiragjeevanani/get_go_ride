import React from "react";
import { 
  HelpCircle, MessageSquare, Phone, Mail, 
  ChevronLeft, ChevronRight, FileText, 
  LifeBuoy, ShieldAlert, Zap, Search,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";

const HelpSupport = () => {
  const navigate = useNavigate();
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const faqs = [
    { q: "How do I get more leads?", a: "Upgrade to Quarterly or Annual plans for priority matching and higher visibility in peak zones." },
    { q: "Payment not reflecting?", a: "UPI payments can take up to 2 hours. If issue persists, share the UTR number in 'Report a Problem'." },
    { q: "Can I change my service city?", a: "Yes, go to Profile > Pricing & Areas to update your operational routes and cities." },
    { q: "WhatsApp alerts not working?", a: "Ensure your registered number is active on WhatsApp and 'WhatsApp Alerts' is ON in Notification Settings." },
  ];

  const contactMethods = [
    { label: "WhatsApp Chat", icon: <MessageSquare className="w-5 h-5 text-emerald-500" />, desc: "Instant help from our team", action: "Chat Now" },
    { label: "Voice Support", icon: <Phone className="w-5 h-5 text-blue-500" />, desc: "Daily 9 AM to 9 PM", action: "Call Now" },
    { label: "Email Support", icon: <Mail className="w-5 h-5 text-zinc-400" />, desc: "Responses within 24 hours", action: "Send Mail" },
  ];

  const handleReportIssue = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsTicketModalOpen(false);
      alert("Ticket Created! ID: #SST-0921. Our team will contact you shortly.");
    }, 2000);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-base font-black text-zinc-900 tracking-tighter uppercase leading-none">Help & Support</h1>
          <p className="text-[10px] font-bold text-zinc-500 tracking-tight mt-1">Get instant fleet assistance</p>
        </div>
      </header>

      {/* Emergency Helpline (High Priority) */}
      <Card className="rounded-none border-none bg-red-600 text-white overflow-hidden relative shadow-xl">
         <CardContent className="p-5 flex justify-between items-center relative z-10">
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-red-50">Emergency Helpline</h3>
               </div>
               <p className="text-2xl font-black tracking-tighter leading-none">1800-SAFE-GO</p>
               <p className="text-[9px] font-bold text-red-200 uppercase tracking-tighter mt-1">Available 24/7 for driver safety</p>
            </div>
            <Button size="icon" className="w-12 h-12 bg-white text-red-600 rounded-none shadow-2xl active:scale-90 transition-transform">
               <Phone className="w-6 h-6 fill-current" />
            </Button>
         </CardContent>
         <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 blur-[60px] pointer-events-none"></div>
      </Card>

      {/* Contact Grid */}
      <section className="space-y-2">
         <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase px-1">Fast Contact</h3>
         <div className="grid grid-cols-1 gap-2">
            {contactMethods.map((method, i) => (
               <Card key={i} className="rounded-none border-zinc-100 shadow-none bg-white p-3 hover:border-zinc-900 transition-all cursor-pointer group">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-none bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:border-zinc-900 group-hover:text-white transition-all">
                           {method.icon}
                        </div>
                        <div className="space-y-0.5">
                           <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{method.label}</h4>
                           <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{method.desc}</p>
                        </div>
                     </div>
                     <Badge className="rounded-none bg-zinc-50 border border-zinc-100 text-zinc-600 font-black text-[8px] uppercase tracking-tighter px-2 h-6 px-1.5 flex items-center gap-1 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                        {method.action}
                        <ExternalLink className="w-2 h-2" />
                     </Badge>
                  </div>
               </Card>
            ))}
         </div>
      </section>

      {/* FAQ & Search */}
      <section className="space-y-3">
         <div className="flex items-center justify-between px-1 pt-2">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Knowledge Base</h3>
            <Zap className="w-3 h-3 text-primary animate-pulse" />
         </div>
         
         <div className="relative px-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search issue or topic..." 
               className="h-11 rounded-none border-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 pl-10 text-[11px] font-bold uppercase tracking-tight"
            />
         </div>

         <div className="space-y-0.5 border border-zinc-100 bg-white min-h-[100px]">
            <AnimatePresence mode="popLayout">
               {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, i) => (
                     <motion.div 
                        key={faq.q}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="p-4 border-b border-zinc-50 last:border-b-0 space-y-2 group cursor-pointer hover:bg-zinc-50 transition-all bg-white"
                     >
                        <div className="flex justify-between items-start gap-4">
                           <p className="text-[10px] font-black text-zinc-900 uppercase tracking-tight leading-tight flex-1">{faq.q}</p>
                           <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:translate-x-1 group-hover:text-zinc-900 transition-all" />
                        </div>
                        <p className="text-[9px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tighter">{faq.a}</p>
                     </motion.div>
                  ))
               ) : (
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="p-10 flex flex-col items-center justify-center text-center space-y-2"
                  >
                     <HelpCircle className="w-8 h-8 text-zinc-100" />
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No matching topics found</p>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </section>

      {/* Ticket Action */}
      <section className="pt-6 px-1">
         <Button 
            onClick={() => setIsTicketModalOpen(true)}
            className="w-full h-12 bg-zinc-900 text-white font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 rounded-none shadow-[4px_4px_0px_0px_#facc15] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
         >
            <FileText className="w-4 h-4" />
            REPORT A PROBLEM
         </Button>
         <div className="flex items-center justify-center gap-2 mt-4">
            <LifeBuoy className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Always here to support your journey</span>
         </div>
      </section>

      {/* Ticket Modal */}
      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent className="sm:max-w-md rounded-none border-none p-0 bg-white shadow-2xl overflow-hidden">
           <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                 <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Create Ticket</h2>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Describe your issue in detail</p>
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Issue Category</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['Leads', 'Payment', 'App', 'Other'].map((cat) => (
                          <Button key={cat} variant="outline" className="h-9 rounded-none border-zinc-100 text-[10px] font-black uppercase tracking-widest hover:border-zinc-900">
                             {cat}
                          </Button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">Describe Problem</label>
                    <textarea 
                       className="w-full h-24 p-3 border-2 border-zinc-100 rounded-none focus:outline-none focus:border-zinc-900 text-[11px] font-bold text-zinc-900 uppercase tracking-tight"
                       placeholder="What happened? Type here..."
                    ></textarea>
                 </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                 <Button onClick={handleReportIssue} disabled={isProcessing} className="w-full h-12 bg-zinc-900 text-white font-black uppercase tracking-widest text-[11px] rounded-none shadow-xl shadow-zinc-900/10">
                    {isProcessing ? "Submitting..." : "Submit Ticket"}
                 </Button>
                 <Button variant="ghost" onClick={() => setIsTicketModalOpen(false)} className="w-full h-11 font-black text-zinc-400 uppercase tracking-widest text-[10px] rounded-none hover:bg-zinc-50">Cancel</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default HelpSupport;
