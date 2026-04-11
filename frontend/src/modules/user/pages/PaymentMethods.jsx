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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          <h1 className="text-xl font-black text-black tracking-tight">Payments</h1>
          <p className="text-xs text-zinc-500 font-medium">Manage your payment methods</p>
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
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-50 rounded-2xl">
                    <CreditCard className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-black">{card.type}</span>
                    <span className="text-sm font-bold text-zinc-500 tabular-nums">{card.number}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 flex justify-between items-center bg-zinc-50 rounded-xl p-3">
                 <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Expiry Date</span>
                 <span className="text-xs font-black text-black">{card.expiry}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button className="w-full h-14 rounded-2xl bg-primary text-black font-black shadow-lg shadow-primary/20 mt-4">
          <Plus className="w-5 h-5 mr-2" />
          Add New Method
        </Button>
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
