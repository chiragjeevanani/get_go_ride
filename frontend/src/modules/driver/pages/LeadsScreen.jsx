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
  const { leads, rejectLead, driver } = useDriverState();
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
      <header className="flex flex-col gap-3 -mx-4 px-4 py-3 border-b-2 border-yellow-400 sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none">Lead Center</h1>
              <p className="text-[10px] font-semibold text-zinc-500 tracking-tight mt-1">{leads.length} Active leads found</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100">
            <History className="w-4 h-4 text-zinc-500" />
          </Button>
        </div>
      </header>

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

            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sticky top-[60px] bg-white z-20">
               {categories.map((cat) => (
                 <Button
                   key={cat.id}
                   variant={activeTab === cat.id ? "default" : "outline"}
                   onClick={() => setActiveTab(cat.id)}
                   className={cn(
                     "h-8 px-5 rounded-full text-[10px] font-bold tracking-tight transition-all shrink-0",
                     activeTab === cat.id 
                       ? "bg-primary text-zinc-900 shadow-md shadow-primary/20 border-primary" 
                       : "border-zinc-100 text-zinc-400 bg-white hover:bg-zinc-50"
                   )}
                 >
                   {cat.label}
                 </Button>
               ))}
            </div>
         </div>

      {/* Leads List */}
      <section className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredLeads.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredLeads.map((lead, index) => (
                <div key={lead.id} className="relative group">
                  <div className={cn(
                    "transition-all duration-300",
                    !driver.isSubscribed && index > 0 ? "filter blur-[2px] opacity-60 pointer-events-none" : ""
                  )}>
                    <LeadCard 
                      lead={lead} 
                      onReject={rejectLead}
                      onView={(id) => navigate(`/driver/leads/${id}`)}
                    />
                  </div>
                  {!driver.isSubscribed && index > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                       <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/driver/subscribe");
                        }}
                        className="bg-zinc-900/90 text-primary border border-primary/20 backdrop-blur-md rounded-xl h-10 px-6 font-black text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all"
                       >
                          <Lock className="w-4 h-4 mr-2" /> UNLOCK THIS LEAD
                       </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col items-center justify-center py-16 px-10 text-center space-y-4"
            >
               <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center grayscale opacity-20">
                  <Zap className="w-8 h-8" />
               </div>
               <div className="space-y-1">
                  <h3 className="font-bold text-zinc-900 tracking-tight">No leads found</h3>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-tight">Try changing your location or category filters.</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Suggested Routes / Areas */}
      <Card className="bg-zinc-900 border-none p-5 relative overflow-hidden rounded-2xl mx-1">
        <div className="relative z-10 space-y-3.5 text-white">
           <div className="space-y-0.5">
              <h3 className="font-bold text-base tracking-tight">High Demand Alert</h3>
              <p className="text-[10px] text-zinc-400 font-bold tracking-tight">Rajwada to Bhopal Road</p>
           </div>
           <Button className="h-8 bg-primary text-zinc-900 font-bold text-[9px] px-4 rounded-lg hover:bg-primary/90">
              Go Online Here <ArrowRight className="w-3 h-3 ml-1.5" />
           </Button>
        </div>
        <MapPin className="absolute -right-4 -bottom-4 w-28 h-28 text-primary/10 rotate-12" />
      </Card>
    </motion.div>
  );
};

export default LeadsScreen;
