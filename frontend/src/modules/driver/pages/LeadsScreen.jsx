import { useState } from "react";
import { Search, Filter, MapPin, Zap, ChevronLeft, Calendar, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LeadCard } from "../components/LeadCard";
import { useDriverState } from "../hooks/useDriverState";
import { cn } from "@/lib/utils";

const LeadsScreen = () => {
  const navigate = useNavigate();
  const { leads, rejectLead } = useDriverState();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", label: "All Leads" },
    { id: "goods", label: "Goods" },
    { id: "house", label: "House" },
    { id: "passenger", label: "Passenger" },
    { id: "emergency", label: "Emergency" }
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesTab = activeTab === "all" || lead.type === activeTab;
    const matchesSearch = lead.pickup.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.drop.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24 pt-4"
    >
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-black text-black tracking-tight leading-none uppercase italic">Lead Center</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Found {leads.length} leads in your area</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl bg-zinc-50 border border-zinc-100">
            <History className="w-5 h-5 text-zinc-400" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 px-1">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search pickup or drop city..." 
                className="pl-11 h-12 bg-zinc-50 border-zinc-100 rounded-xl font-bold text-xs focus:bg-white transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeTab === cat.id ? "default" : "outline"}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "h-9 px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                    activeTab === cat.id 
                      ? "bg-primary text-black shadow-md shadow-primary/20" 
                      : "border-zinc-100 text-zinc-400 bg-white"
                  )}
                >
                  {cat.label}
                </Button>
              ))}
           </div>
        </div>
      </header>

      {/* Leads List */}
      <section className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredLeads.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredLeads.map((lead, index) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onReject={rejectLead}
                  onView={(id) => navigate(`/driver/leads/${id}`)}
                />
              ))}
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col items-center justify-center py-20 px-10 text-center space-y-4"
            >
               <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center grayscale opacity-20">
                  <Zap className="w-10 h-10" />
               </div>
               <div className="space-y-1">
                  <h3 className="font-black text-black uppercase tracking-tight">No leads found</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Try changing your location or category filters.</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Suggested Routes / Areas */}
      <Card className="bg-zinc-900 border-none p-6 relative overflow-hidden rounded-[2rem] mx-1">
        <div className="relative z-10 space-y-4 text-white">
           <div className="space-y-1">
              <h3 className="font-black text-lg tracking-tight italic uppercase">High Demand Alert</h3>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Rajwada to Bhopal Road</p>
           </div>
           <Button className="bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-primary/90">
              Go Online Here <ArrowRight className="w-3 h-3 ml-1.5" />
           </Button>
        </div>
        <MapPin className="absolute -right-6 -bottom-6 w-32 h-32 text-primary/10 rotate-12" />
      </Card>
    </motion.div>
  );
};

export default LeadsScreen;
