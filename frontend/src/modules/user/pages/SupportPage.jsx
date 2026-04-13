import { HelpCircle, MessageCircle, Phone, FileText, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const SupportPage = () => {
  const navigate = useNavigate();

  const faqs = [
    { q: "How do I track my vehicle?", a: "Go to 'Requests' and select the active request to see live tracking." },
    { q: "What is the cancellation policy?", a: "Cancellations are free within 15 minutes of booking confirmation." },
    { q: "How to pay the vendor?", a: "Payment can be done via app or cash to driver after loading." },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white shadow-sm border border-zinc-100"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-black tracking-tight">Support Centre</h1>
          <p className="text-xs text-zinc-500 font-medium">We're here to help you 24/7</p>
        </div>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <Input 
          placeholder="How can we help?" 
          className="pl-12 h-14 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus-visible:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
         <Card className="border-none shadow-premium bg-white active:scale-95 transition-transform cursor-pointer">
            <CardContent className="p-5 flex flex-col items-center gap-2">
               <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <MessageCircle className="w-6 h-6" />
               </div>
               <span className="text-xs font-black text-black uppercase tracking-wider">Chat Support</span>
            </CardContent>
         </Card>
         <Card className="border-none shadow-premium bg-white active:scale-95 transition-transform cursor-pointer">
            <CardContent className="p-5 flex flex-col items-center gap-2">
               <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400">
                  <Phone className="w-6 h-6" />
               </div>
               <span className="text-xs font-black text-black uppercase tracking-wider">Call Us</span>
            </CardContent>
         </Card>
      </div>

      <div className="space-y-3 pt-4">
         <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Frequent Questions</h3>
         <div className="space-y-3">
            {faqs.map((faq, idx) => (
               <Card key={idx} className="border-none shadow-sm bg-white">
                  <CardContent className="p-5 space-y-2">
                     <div className="flex justify-between gap-4">
                        <span className="text-sm font-black text-black leading-tight">{faq.q}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-200 shrink-0" />
                     </div>
                     <p className="text-xs text-zinc-500 font-medium leading-relaxed">{faq.a}</p>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>

      <Card className="border-none bg-zinc-900 p-6 rounded-[2.5rem] mt-6 overflow-hidden relative">
         <div className="relative z-10 space-y-2">
            <h3 className="text-white font-black italic text-lg leading-tight uppercase tracking-tighter">Safety & Trust</h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase leading-tight max-w-[180px]">Learn how we protect your goods and verify vendors.</p>
            <Button variant="outline" className="h-10 rounded-xl bg-zinc-800 border-zinc-700 text-white text-[10px] font-black uppercase tracking-widest mt-2">
               Read Policies
            </Button>
         </div>
         <HelpCircle className="absolute -bottom-6 -right-6 w-32 h-32 text-zinc-800 rotate-[15deg] z-0" />
      </Card>
    </div>
  );
};

export default SupportPage;
