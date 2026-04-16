import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, 
  Layers, Truck, Info, 
  ChevronRight, Save, X,
  Briefcase, Package, CarFront
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Categories = () => {
  const [activeTab, setActiveTab] = useState("service");
  
  const [serviceCategories, setServiceCategories] = useState([
    { id: 1, name: "House Shifting", slug: "house-shifting", count: 120, icon: Briefcase },
    { id: 2, name: "Goods Transport", slug: "goods-transport", count: 450, icon: Package },
    { id: 3, name: "Passenger Service", slug: "passenger", count: 85, icon: CarFront },
    { id: 4, name: "Emergency Dispatch", slug: "emergency", count: 32, icon: Truck },
  ]);

  const [vehicleTypes, setVehicleTypes] = useState([
    { id: 1, name: "Mini Truck (Tata Ace)", capacity: "800kg", icon: Truck },
    { id: 2, name: "Pick-up (Bolero)", capacity: "1.2 - 1.5 Ton", icon: Truck },
    { id: 3, name: "Heavy Truck (14ft - 19ft)", capacity: "5 - 9 Ton", icon: Truck },
    { id: 4, name: "Auto Rickshaw (Cargo)", capacity: "300kg", icon: CarFront },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Category Config" 
        subtitle="Manage available service categories and vehicle classes" 
        actions={
          <Button className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20">
             <Plus className="w-4 h-4 mr-2" />
             Add New
          </Button>
        }
      />

      <Tabs defaultValue="service" className="space-y-6" onValueChange={setActiveTab}>
         <TabsList className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-1 rounded-2xl w-full max-w-md">
            <TabsTrigger value="service" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
               Service Categories
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
               Vehicle Class
            </TabsTrigger>
         </TabsList>

         <TabsContent value="service" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
               {serviceCategories.map((cat) => (
                  <motion.div 
                    key={cat.id} 
                    whileHover={{ scale: 1.01 }}
                    className="admin-card p-6 flex items-center justify-between group hover:border-primary/20 transition-all border-2 border-zinc-200 dark:border-zinc-900"
                  >
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                           <cat.icon className="w-6 h-6 text-primary" strokeWidth={2} />
                        </div>
                        <div className="space-y-1">
                           <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{cat.name}</h3>
                           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Identifier: <span className="text-zinc-400">{cat.slug}</span> • {cat.count} Active Leads</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-primary hover:border-primary/20 transition-all">
                           <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 hover:border-rose-500/20 transition-all">
                           <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                  </motion.div>
               ))}

               {/* Add Placeholder */}
               <div className="admin-card p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-all cursor-pointer hover:border-primary/20 hover:bg-primary/5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                     <Plus className="w-4 h-4 text-zinc-400" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Add New Category</span>
               </div>
            </div>

            <div className="mt-12 p-8 admin-card bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900 relative overflow-hidden group">
               <div className="space-y-6 relative z-10 text-zinc-900 dark:text-white">
                  <div className="space-y-1">
                     <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Platform Matching Logic
                     </h3>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Configure how requirements are matched with vendors</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Radius matching (KM)</label>
                        <input defaultValue="50" className="w-full h-11 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-xs font-black text-primary italic focus:outline-none focus:border-primary" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Max vendor responses</label>
                        <input defaultValue="10" className="w-full h-11 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-xs font-black text-primary italic focus:outline-none focus:border-primary" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Response auto-close (Hours)</label>
                        <input defaultValue="72" className="w-full h-11 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-xs font-black text-primary italic focus:outline-none focus:border-primary" />
                     </div>
                  </div>
                  
                  <Button className="bg-zinc-800 border-zinc-700 text-zinc-900 dark:text-white font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl hover:bg-zinc-700 shadow-xl">
                     Update Matching Logic
                  </Button>
               </div>
               <Layers className="absolute -right-4 -bottom-4 w-32 h-32 text-primary opacity-5 rotate-[-15deg] group-hover:opacity-10 transition-opacity" />
            </div>
         </TabsContent>

         <TabsContent value="vehicle" className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
               {vehicleTypes.map((vehicle) => (
                  <motion.div 
                    key={vehicle.id} 
                    whileHover={{ scale: 1.01 }}
                    className="admin-card p-6 flex items-center justify-between group hover:border-primary/20 transition-all border-2 border-zinc-200 dark:border-zinc-900"
                  >
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                           <vehicle.icon className="w-6 h-6 text-primary" strokeWidth={2} />
                        </div>
                        <div className="space-y-1">
                           <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{vehicle.name}</h3>
                           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-[#71717a]">Payload Capacity: <span className="text-primary italic">{vehicle.capacity}</span></p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-primary transition-all">
                           <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 transition-all">
                           <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                  </motion.div>
               ))}

               {/* Add Placeholder */}
               <div className="admin-card p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-all cursor-pointer hover:border-primary/20 hover:bg-primary/5">
                  <Plus className="w-6 h-6 text-zinc-400" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Define New Class</span>
               </div>
            </div>
         </TabsContent>
      </Tabs>
    </div>
  );
};

export default Categories;
