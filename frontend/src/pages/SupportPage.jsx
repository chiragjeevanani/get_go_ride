import React, { useState, useEffect } from "react";
import { HelpCircle, Mail, ChevronRight, ChevronLeft, Loader2, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { faqApi } from "@/lib/api";
import { toast } from "sonner";

const SupportPage = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fallback high-quality FAQs in case server FAQs are empty/fail to load
  const fallbackFaqs = [
    {
      question: "How do I request a ride or cargo shipment?",
      answer: "Login to your account, enter your pickup and delivery locations, choose the appropriate vehicle category, and submit your requirement. Nearby verified drivers will place bids instantly."
    },
    {
      question: "What vehicle categories are available?",
      answer: "We offer a range of heavy-duty transport vehicles, construction transport, mini trucks, and emergency logistics fleets tailored to different load requirements."
    },
    {
      question: "How are payment options handled?",
      answer: "We support advance payments (50%) through integrated Razorpay (cards, UPI, net banking) and cash options direct to drivers upon delivery verification."
    },
    {
      question: "How can I track my shipment status?",
      answer: "Go to your active Gigs list in the Requests tab. You'll receive real-time status updates as the driver starts, arrives, and finishes the trip."
    }
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await faqApi.getAll();
      if (res && res.success) {
        setFaqs(res.data || []);
      } else {
        setFaqs(fallbackFaqs);
      }
    } catch (err) {
      console.error("Failed to load FAQs, using high-quality local fallbacks", err);
      setFaqs(fallbackFaqs);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent("Support Request - Get Go Load Web");
    const body = encodeURIComponent("Hello Support Team,\n\nI need assistance with the following:\n\n[Describe your issue here]\n\nMy Registered Phone Number: ");
    window.location.href = `mailto:support@getgoride.com?subject=${subject}&body=${body}`;
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-base font-semibold text-zinc-900 tracking-tight leading-none uppercase italic">Support Center</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">We're here to help you 24/7</p>
          </div>
        </header>

        {/* Support Body */}
        <div className="flex-1 p-4 space-y-6">
          {/* Main Email Card */}
          <Card 
            onClick={handleEmailSupport}
            className="border-2 border-primary/20 bg-primary/[0.03] rounded-3xl p-6 hover:shadow-lg hover:border-primary active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1.5 max-w-[220px]">
                <span className="text-[9px] font-semibold uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-md tracking-wider leading-none">RECOMMENDED SUPPORT</span>
                <h3 className="text-base font-semibold text-zinc-900 leading-tight uppercase italic mt-1.5">Email Support Team</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed mt-0.5">
                  Direct communication with our 24/7 dedicated customer resolution desk.
                </p>
              </div>
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6" strokeWidth={2.5} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2"></div>
          </Card>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-400" />
            </span>
            <input
              type="text"
              placeholder="SEARCH FAQS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[11px] font-bold uppercase tracking-wider placeholder-zinc-450 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
            />
          </div>

          {/* Dynamic FAQs Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-semibold uppercase text-zinc-400 tracking-[0.15em] px-1">Frequent Questions</h3>
            
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Loading FAQs...</span>
              </div>
            ) : filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => (
                  <Card key={faq._id || idx} className="border border-zinc-100 shadow-sm rounded-2.5xl overflow-hidden hover:border-primary/20 transition-all bg-white group">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex justify-between gap-4 items-start">
                        <span className="text-xs font-semibold text-zinc-900 leading-snug uppercase tracking-tight group-hover:text-primary transition-colors">{faq.question}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium tracking-tight leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50 rounded-2xl">
                No FAQs Found
              </div>
            )}
          </div>

          {/* Privacy Link footer card */}
          <Card className="border-none bg-zinc-950 p-6 rounded-3xl overflow-hidden relative shadow-xl">
            <div className="relative z-10 space-y-2">
              <h3 className="text-white font-semibold italic text-base leading-none uppercase tracking-tighter">Privacy & Policies</h3>
              <p className="text-zinc-400 text-[9px] font-bold uppercase leading-relaxed max-w-[200px]">Learn how we protect your goods and verify vendors.</p>
              <Button 
                variant="outline" 
                className="h-9 px-4 rounded-xl bg-zinc-900 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-750 text-white text-[9px] font-semibold uppercase tracking-widest mt-1"
                onClick={() => navigate("/privacy")}
              >
                Read Privacy Policy <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
            <HelpCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-900 rotate-[15deg] z-0" />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
