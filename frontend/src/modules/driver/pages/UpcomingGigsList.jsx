import { useState, useEffect } from "react";
import { 
  ChevronLeft, Truck, MapPin, Calendar, Clock, 
  ArrowRight, ShieldCheck, Loader2, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { paymentApi } from "@/lib/api";

const UpcomingGigsList = () => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        const res = await paymentApi.getUpcomingGigs();
        if (res.success) {
          setGigs(res.data || []);
        } else {
          setError("Failed to fetch upcoming gigs");
        }
      } catch (err) {
        setError("Could not load upcoming gigs");
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 max-w-md mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-yellow-400 px-4 py-4 flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-none bg-zinc-50 border border-zinc-100" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-sm font-black text-zinc-900 tracking-widest uppercase italic">Scheduled Gigs</h1>
          <p className="text-[8px] font-black text-zinc-400 tracking-widest uppercase mt-0.5">My Work Orders</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {error ? (
          <div className="text-center py-20 bg-white border border-zinc-100 p-6 space-y-3">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-zinc-500">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">Retry</Button>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-100 p-8 space-y-4 rounded-3xl">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-sm uppercase tracking-wider">No Upcoming Gigs</h3>
              <p className="text-xs text-zinc-400 font-bold mt-1 leading-relaxed">
                You do not have any active or scheduled gigs at the moment. Keep bidding on incoming leads to win bookings!
              </p>
            </div>
            <Button className="w-full bg-primary text-black font-black text-xs uppercase h-11 rounded-xl shadow-md" onClick={() => navigate("/driver/leads")}>
              Browse Available Leads
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {gigs.map((gig) => {
              const req = gig.requirement || {};
              const advance = gig.advanceAmount || Math.round(gig.amount * 0.5);
              const remaining = gig.amount - advance;
              const isStarted = gig.gigStatus === 'in_progress';

              return (
                <motion.div 
                  key={gig._id} 
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/driver/gig/${gig._id}`)}
                >
                  <Card className="border border-zinc-100 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white hover:border-primary/30">
                    {/* Badge header */}
                    <div className="bg-zinc-50 px-4 py-2.5 flex justify-between items-center border-b border-zinc-100">
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <Truck className="w-3 h-3 text-primary" /> Gig: {gig._id.slice(-6).toUpperCase()}
                      </span>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase border-none rounded-md px-2 py-0.5",
                        isStarted ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {isStarted ? "In Progress" : "Scheduled"}
                      </Badge>
                    </div>

                    <CardContent className="p-4 space-y-4">
                      {/* Routes */}
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div className="w-0.5 h-8 bg-zinc-100 border-dashed border-l" />
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-[7px] font-black text-zinc-400 uppercase leading-none">Pickup</p>
                            <p className="text-[11px] font-bold text-zinc-800 line-clamp-1 mt-0.5 uppercase">{req.pickup?.address}</p>
                          </div>
                          <div>
                            <p className="text-[7px] font-black text-zinc-400 uppercase leading-none">Drop</p>
                            <p className="text-[11px] font-bold text-zinc-800 line-clamp-1 mt-0.5 uppercase">{req.drops?.[0]?.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Info Bar */}
                      <div className="grid grid-cols-2 gap-2 bg-zinc-50/50 p-2.5 rounded-2xl border border-zinc-100/50 text-[10px] font-bold text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{req.date ? new Date(req.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{req.time || "N/A"}</span>
                        </div>
                      </div>

                      {/* Pay overview */}
                      <div className="border-t border-zinc-100 pt-3 flex justify-between items-center">
                        <div>
                          <span className="text-[8px] font-black text-zinc-400 uppercase">Payout</span>
                          <p className="text-base font-black text-zinc-950">₹{gig.amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-black text-zinc-400 uppercase">Advance Held</span>
                          <p className="text-xs font-black text-emerald-600">₹{advance.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingGigsList;
