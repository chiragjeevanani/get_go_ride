import { useState } from "react";
import { CreditCard, Plus, Trash2, ChevronLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const PaymentMethods = () => {
  const navigate = useNavigate();

  const cards = [
    { id: 1, type: "Visa", number: "**** **** **** 4242", expiry: "12/26", isDefault: true },
    { id: 2, type: "Mastercard", number: "**** **** **** 5555", expiry: "08/25", isDefault: false },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex items-center gap-4 py-3 border-b-2 border-primary/20 sticky top-0 bg-white/80 backdrop-blur-md z-30 -mx-4 px-4 shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 rounded-full bg-zinc-50/50 hover:bg-zinc-100 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5 text-black" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-sm font-black text-black tracking-[0.1em] uppercase">Payments</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Manage Methods</p>
        </div>
      </header>

      <div className="space-y-4">
        {cards.map((card) => (
          <Card key={card.id} className="border-none shadow-premium bg-white overflow-hidden relative">
            {card.isDefault && (
               <div className="absolute top-0 right-0 bg-primary text-black text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">
                  Default
               </div>
            )}
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zinc-50 rounded-lg">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-black text-xs leading-none">{card.type}</span>
                    <span className="text-[10px] font-bold text-zinc-400 tabular-nums tracking-wider mt-0.5">{card.number}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-6 h-6 text-zinc-300 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="mt-2 flex justify-between items-center bg-zinc-50/50 rounded-md p-1.5 px-2.5 border border-zinc-50">
                 <span className="text-[7px] font-black uppercase text-zinc-400 tracking-[0.1em]">Expiry</span>
                 <span className="text-[9px] font-black text-black tabular-nums">{card.expiry}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
         <div className="p-2 bg-emerald-500 rounded-lg">
            <Shield className="w-4 h-4 text-white" />
         </div>
         <p className="text-[10px] font-bold text-emerald-800 leading-tight uppercase tracking-wide">
            Your payment data is fully encrypted and secure. <br/>We follow global PCI-DSS standards.
         </p>
      </div>
    </div>
  );
};

export default PaymentMethods;
