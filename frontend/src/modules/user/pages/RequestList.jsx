import { useState } from "react";
import { Search, Filter, Package, ChevronRight, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RequestList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");

  const requests = [
    {
      id: "REQ-101",
      service: "House Shifting (1BHK)",
      pickup: "Borivali East, Mumbai",
      dropoff: "Powai, Mumbai",
      date: "09 April 2026",
      status: "Responding",
      responses: 4,
      isNew: true,
    },
    {
      id: "REQ-100",
      service: "Industrial Goods (2T)",
      pickup: "Vapi, Gujarat",
      dropoff: "Vasai, Maharashtra",
      date: "05 April 2026",
      status: "Finalized",
      responses: 8,
      isNew: false,
    },
    {
        id: "REQ-099",
        service: "Personal Car - SUV",
        pickup: "Pune",
        dropoff: "Mumbai Airport",
        date: "01 April 2026",
        status: "Completed",
        responses: 3,
        isNew: false,
    }
  ];

  const filteredRequests = activeTab === "active" 
    ? requests.filter(r => r.status === "Responding" || r.status === "Finalized")
    : requests.filter(r => r.status === "Completed" || r.status === "Cancelled");

  return (
    <div className="space-y-4 pb-20 pt-2">
      <header className="flex justify-between items-center py-2 border-b-2 border-primary/20 -mx-4 px-4 sticky top-0 bg-white/80 backdrop-blur-lg z-30">
        <h1 className="text-sm font-black text-black uppercase tracking-widest">My Requests</h1>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100">
           <Filter className="w-4 h-4 text-zinc-600" />
        </Button>
      </header>

      <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 rounded-xl h-10">
          <TabsTrigger value="active" className="rounded-lg text-[10px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Active</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-[10px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative group">
         <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
         <Input placeholder="Search request ID or service" className="pl-10 bg-white border-zinc-100 shadow-sm h-10 text-xs" />
      </div>

      <div className="space-y-4">
        {filteredRequests.map((req, index) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/user/request/${req.id}`)}
          >
            <Card className="border-none shadow-premium hover:shadow-lg transition-all cursor-pointer overflow-visible">
              <CardContent className="p-0">
                <div className="p-4 flex items-start justify-between border-b border-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary text-black rounded-2xl">
                       <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black">{req.id}</span>
                        {req.isNew && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                      </div>
                      <p className="text-sm font-semibold text-zinc-600">{req.service}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={req.status === "Responding" ? "info" : req.status === "Finalized" ? "success" : "secondary"} 
                    className="rounded-lg text-[10px]"
                  >
                    {req.status}
                  </Badge>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <div className="w-0.5 h-4 bg-zinc-100"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                       <span className="text-[11px] text-zinc-500 line-clamp-1">{req.pickup}</span>
                       <span className="text-[11px] text-zinc-500 line-clamp-1">{req.dropoff}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {req.date}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-primary">{req.responses} Responses</span>
                        <ChevronRight className="w-4 h-4 text-zinc-300" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
             <Package className="w-16 h-16 opacity-10 mb-4" />
             <p className="text-sm">No requests found</p>
          </div>
        )}
      </div>
      
      <Button 
        className="w-full h-11 rounded-xl bg-white border border-zinc-200 text-black hover:bg-zinc-50 shadow-sm font-bold text-xs"
        onClick={() => navigate("/user/post-requirement")}
      >
        Post New Requirement
      </Button>
    </div>
  );
};

export default RequestList;
