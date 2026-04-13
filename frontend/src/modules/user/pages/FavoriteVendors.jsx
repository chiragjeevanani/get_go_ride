import { useState } from "react";
import { Heart, Star, MapPin, ChevronLeft, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const FavoriteVendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([
    { id: 1, name: "City Express Logistix", rating: 4.8, jobs: 120, location: "Mumbai, MH", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=200" },
    { id: 2, name: "Safe Move Services", rating: 4.5, jobs: 85, location: "Pune, MH", image: "https://images.unsplash.com/photo-1600518464441-915c143bc053?auto=format&fit=crop&q=80&w=200" },
    { id: 3, name: "Rapid Delivery Co", rating: 4.9, jobs: 240, location: "Bangalore, KA", image: "https://images.unsplash.com/photo-1549194382-246030919f20?auto=format&fit=crop&q=80&w=200" },
  ]);

  const removeVendor = (id) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

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
          <h1 className="text-xl font-black text-black tracking-tight">Favorite Vendors</h1>
          <p className="text-[11px] text-zinc-500 font-medium">Your trusted service providers</p>
        </div>
      </header>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {vendors.length > 0 ? (
            vendors.map((vendor) => (
              <motion.div
                key={vendor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-none shadow-premium bg-white group overflow-hidden active:scale-98 transition-transform">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start">
                         <h3 className="font-black text-black text-xs uppercase truncate pr-4">{vendor.name}</h3>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => removeVendor(vendor.id)}
                           className="h-6 w-6 text-zinc-300 hover:text-red-500 transition-colors shrink-0"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                         <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded text-[9px] font-black text-green-600">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {vendor.rating}
                         </div>
                         <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">{vendor.jobs} Jobs Done</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-zinc-400">
                         <MapPin className="w-2.5 h-2.5" />
                         <span className="text-[9px] font-medium truncate">{vendor.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200">
                  <Search className="w-8 h-8" />
               </div>
               <div className="space-y-1">
                  <p className="text-xs font-black text-black uppercase tracking-widest">No Favorites Yet</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Heart your preferred vendors to see them here.</p>
               </div>
               <Button 
                onClick={() => navigate('/user/dashboard')}
                className="h-9 px-6 rounded-xl bg-primary text-black text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
               >
                Discover Vendors
               </Button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {vendors.length > 0 && (
        <div className="bg-zinc-50/50 rounded-3xl p-4 text-center space-y-2 mt-4">
           <div className="w-10 h-10 bg-white rounded-full mx-auto flex items-center justify-center text-primary shadow-sm">
              <Heart className="w-5 h-5 fill-current" />
           </div>
           <h4 className="text-[10px] font-bold text-black uppercase tracking-wider">Quick Re-booking</h4>
           <p className="text-[9px] text-zinc-400 font-medium leading-tight px-4">Keep your favorite vendors close for faster booking and reliable service every time.</p>
        </div>
      )}
    </div>
  );
};

export default FavoriteVendors;
