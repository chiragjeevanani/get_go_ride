import { useState, useEffect } from "react";
import { HelpCircle, Mail, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { faqApi } from "@/lib/api";
import { toast } from "sonner";

const SupportPage = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await faqApi.getAll();
      if (res.success) {
        setFaqs(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent("Support Request - Safarsetto User");
    const body = encodeURIComponent("Hello Support Team,\n\nI need assistance with the following:\n\n[Describe your issue here]\n\nMy Registered Phone Number: ");
    window.location.href = `mailto:support@getgoride.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 px-4">
      <header className="flex items-center gap-4 pt-6 pb-4 border-b-2 border-primary -mx-4 px-4 sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white shadow-sm border border-zinc-100 w-9 h-9"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-zinc-900 tracking-tight leading-none uppercase italic">Support Centre</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">We're here to help you 24/7</p>
        </div>
      </header>

      {/* Email Us - Full Width Premium Support Action Card */}
      <Card 
        onClick={handleEmailSupport}
        className="border-2 border-primary/20 bg-primary/[0.03] rounded-3xl p-6 hover:shadow-lg hover:border-primary active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1.5 max-w-[250px]">
             <span className="text-[9px] font-semibold uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-md tracking-wider leading-none">RECOMMENDED SUPPORT</span>
             <h3 className="text-base font-semibold text-zinc-900 leading-tight uppercase italic mt-1">Email Support Team</h3>
             <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed">Direct communication with our 24/7 dedicated customer resolution desk.</p>
          </div>
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-zinc-900 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
             <Mail className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2"></div>
      </Card>

      {/* Dynamic FAQs Section */}
      <div className="space-y-4">
         <h3 className="text-[10px] font-semibold uppercase text-zinc-400 tracking-[0.15em] px-1">Frequent Questions</h3>
         
         {loading ? (
           <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Loading FAQs...</span>
           </div>
         ) : faqs.length > 0 ? (
           <div className="space-y-3">
              {faqs.map((faq, idx) => (
                 <Card key={faq._id || idx} className="border border-zinc-100 shadow-sm rounded-2.5xl overflow-hidden hover:border-primary/20 transition-all bg-white group">
                    <CardContent className="p-5 space-y-2">
                       <div className="flex justify-between gap-4 items-start">
                          <span className="text-xs font-semibold text-zinc-900 leading-snug uppercase tracking-tight group-hover:text-primary transition-colors">{faq.question}</span>
                          <ChevronRight className="w-4 h-4 text-zinc-200 shrink-0 mt-0.5 group-hover:text-black transition-colors" />
                       </div>
                       <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-tight leading-relaxed">{faq.answer}</p>
                    </CardContent>
                 </Card>
              ))}
           </div>
         ) : (
           <div className="py-8 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50 rounded-2xl">
             No FAQs Available
           </div>
         )}
      </div>

      <Card className="border-none bg-zinc-900 p-6 rounded-3xl overflow-hidden relative shadow-xl">
         <div className="relative z-10 space-y-2">
            <h3 className="text-white font-semibold italic text-base leading-none uppercase tracking-tighter">Safety & Trust</h3>
            <p className="text-zinc-500 text-[9px] font-bold uppercase leading-relaxed max-w-[170px]">Learn how we protect your goods and verify vendors.</p>
            <Button variant="outline" className="h-9 px-4 rounded-xl bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-white text-[9px] font-semibold uppercase tracking-widest mt-1">
               Read Policies
            </Button>
         </div>
         <HelpCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-800 rotate-[15deg] z-0" />
      </Card>
    </div>
  );
};

export default SupportPage;
