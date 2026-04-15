import { HelpCircle, MessageCircle, Phone, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useNavigate } from "react-router-dom";

const SupportPage = () => {
  const navigate = useNavigate();

  const faqs = [
    { q: "How do I track my vehicle?", a: "Go to 'Requests' and select the active request to see live tracking." },
    { q: "What is the cancellation policy?", a: "Cancellations are free within 15 minutes of booking confirmation." },
    { q: "How to pay the vendor?", a: "Payment can be done via app or cash to driver after loading." },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex items-center gap-4 pt-6 pb-4 border-b-2 border-primary">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white shadow-sm border border-zinc-100"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-black tracking-tight">Support Centre</h1>
          <p className="text-[11px] text-zinc-500 font-medium">We're here to help you 24/7</p>
        </div>
      </header>



      <div className="grid grid-cols-2 gap-3">
         <Card className="border-none shadow-premium bg-white active:scale-95 transition-transform cursor-pointer">
            <CardContent className="p-3 flex flex-col items-center gap-2">
               <div className="p-2 bg-primary/10 rounded-2xl text-primary">
                  <MessageCircle className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black text-black uppercase tracking-wider">Chat Support</span>
            </CardContent>
         </Card>
         <Card className="border-none shadow-premium bg-white active:scale-95 transition-transform cursor-pointer">
            <CardContent className="p-3 flex flex-col items-center gap-2">
               <div className="p-2 bg-zinc-50 rounded-2xl text-zinc-400">
                  <Phone className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black text-black uppercase tracking-wider">Call Us</span>
            </CardContent>
         </Card>
      </div>

      <div className="space-y-2 pt-2">
         <h3 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-1">Frequent Questions</h3>
         <div className="space-y-2">
            {faqs.map((faq, idx) => (
               <Card key={idx} className="border-none shadow-sm bg-white">
                  <CardContent className="p-4 space-y-1.5">
                     <div className="flex justify-between gap-4">
                        <span className="text-[13px] font-black text-black leading-tight">{faq.q}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-200 shrink-0" />
                     </div>
                     <p className="text-[11px] text-zinc-500 font-medium leading-tight">{faq.a}</p>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>

      <Card className="border-none bg-zinc-900 p-5 rounded-3xl mt-4 overflow-hidden relative">
         <div className="relative z-10 space-y-1.5">
            <h3 className="text-white font-black italic text-base leading-tight uppercase tracking-tighter">Safety & Trust</h3>
            <p className="text-zinc-500 text-[9px] font-bold uppercase leading-tight max-w-[170px]">Learn how we protect your goods and verify vendors.</p>
            <Button variant="outline" className="h-9 rounded-xl bg-zinc-800 border-zinc-700 text-white text-[9px] font-black uppercase tracking-widest mt-1">
               Read Policies
            </Button>
         </div>
         <HelpCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-800 rotate-[15deg] z-0" />
      </Card>
    </div>
  );
};

export default SupportPage;
