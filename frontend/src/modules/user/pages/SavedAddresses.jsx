import { MapPin, Plus, Trash2, Home, Briefcase, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const SavedAddresses = () => {
  const navigate = useNavigate();

  const addresses = [
    { id: 1, label: "Home", icon: <Home className="w-5 h-5" />, address: "B-204, Crystal Heights, Borivali East, Mumbai 400066" },
    { id: 2, label: "Office", icon: <Briefcase className="w-5 h-5" />, address: "G-Block, BKC, Bandra East, Mumbai 400051" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          <h1 className="text-xl font-black text-black tracking-tight">Saved Addresses</h1>
          <p className="text-[11px] text-zinc-500 font-medium">Quickly book from frequent locations</p>
        </div>
      </header>

      <div className="space-y-2">
        {addresses.map((addr) => (
          <Card key={addr.id} className="border-none shadow-premium bg-white group hover:shadow-md transition-all">
            <CardContent className="p-3 flex items-start gap-3">
              <div className="p-2 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:bg-primary group-hover:text-black transition-all">
                {addr.icon}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                   <span className="font-black text-black text-xs uppercase tracking-widest">{addr.label}</span>
                   <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-300 hover:text-red-500 transition-colors">
                     <Trash2 className="w-3.5 h-3.5" />
                   </Button>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium leading-tight pr-6">{addr.address}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button className="w-full h-12 rounded-2xl bg-primary text-black font-black shadow-lg shadow-primary/20 mt-2">
          <Plus className="w-5 h-5 mr-2" />
          Add New Address
        </Button>
      </div>

      {/* Visual tip */}
      <div className="bg-zinc-50/50 rounded-3xl p-4 text-center space-y-2">
         <div className="w-10 h-10 bg-white rounded-full mx-auto flex items-center justify-center text-primary shadow-sm">
            <MapPin className="w-5 h-5" />
         </div>
         <h4 className="text-[10px] font-bold text-black uppercase tracking-wider">Fast Booking</h4>
         <p className="text-[9px] text-zinc-400 font-medium leading-tight">Saved addresses appear first when you select locations in the booking flow.</p>
      </div>
    </div>
  );
};

export default SavedAddresses;
