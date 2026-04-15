import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LeadCard = ({ lead, onAccept, onReject, onView, className }) => {
  const isNew = lead.status === 'new';
  const isExpiring = lead.status === 'expiring';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 0.99 }}
      className={cn("w-full", className)}
    >
      <Card className="border-2 border-primary/20 shadow-premium hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400 border border-zinc-100">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-black text-sm leading-tight">{lead.service}</h4>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{lead.id}</span>
                </div>
              </div>
            </div>
            {isNew && (
              <Badge className="bg-emerald-100 text-emerald-600 border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 animate-pulse">
                New
              </Badge>
            )}
            {isExpiring && (
              <Badge variant="destructive" className="bg-red-100 text-red-600 border-red-200 text-[9px] font-black uppercase px-2 py-0.5">
                Expiring
              </Badge>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="relative pl-6 space-y-3">
              <div className="absolute left-1 top-1.5 bottom-1.5 w-0.5 bg-zinc-100"></div>
              
              <div className="relative">
                <div className="absolute -left-[22px] top-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                <p className="text-[11px] font-bold text-zinc-600 leading-tight truncate">{lead.pickup}</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[22px] top-0.5 w-2 h-2 rounded-full bg-red-500 ring-4 ring-white"></div>
                <p className="text-[11px] font-bold text-zinc-600 leading-tight truncate">{lead.drop}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-300" />
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-tight">{lead.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-tight">{lead.distance}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onReject?.(lead.id)}
              className="flex-1 h-10 rounded-xl border-zinc-100 text-zinc-400 font-black text-[10px] uppercase tracking-wider hover:bg-zinc-50 hover:text-zinc-600"
            >
              Reject
            </Button>
            <Button 
              onClick={() => onView?.(lead.id)}
              className="flex-1 h-10 rounded-xl bg-primary text-black font-black text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              View & Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
