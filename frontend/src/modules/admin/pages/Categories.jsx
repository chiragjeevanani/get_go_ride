import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, 
  Layers, Truck, Info, 
  ChevronRight, Save, X,
  Briefcase, Package, CarFront,
  Tags, Settings2, Activity,
  Scale, Zap
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Modal } from '../components/common/Modal';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Categories = () => {
  const [activeTab, setActiveTab] = useState("service");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const [serviceCategories, setServiceCategories] = useState([
    { 
      id: 1, name: "House Shifting", slug: "house-shifting", count: 120, icon: Briefcase,
      filters: ["Floor Number", "Lift Availability", "Packing Required", "Volume (BHK)"]
    },
    { 
      id: 2, name: "Goods Transport", slug: "goods-transport", count: 450, icon: Package,
      filters: ["Material Type", "Fragile", "Weight (KG)", "Loading Help"]
    },
    { 
      id: 3, name: "Passenger Service", slug: "passenger", count: 85, icon: CarFront,
      filters: ["Passenger Count", "Luggage Count", "AC/Non-AC", "Round Trip"]
    },
    { 
      id: 4, name: "Emergency Dispatch", slug: "emergency", count: 32, icon: Truck,
      filters: ["Severity Level", "Medical Equipment", "Patient Support", "Priority"]
    },
  ]);

  const [vehicleTypes, setVehicleTypes] = useState([
    { id: 1, name: "Mini Truck (Tata Ace)", capacity: "800kg", icon: Truck },
    { id: 2, name: "Pick-up (Bolero)", capacity: "1.2 - 1.5 Ton", icon: Truck },
    { id: 3, name: "Heavy Truck (14ft - 19ft)", capacity: "5 - 9 Ton", icon: Truck },
    { id: 4, name: "Auto Rickshaw (Cargo)", capacity: "300kg", icon: CarFront },
  ]);

  const handleOpenFilters = (cat) => {
    setSelectedCategory(cat);
    setIsFilterModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Category Config" 
        subtitle="Manage available service categories and matching rules" 
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
            <TabsTrigger value="matching" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
               Matching Logic
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
                    className="admin-card p-6 flex flex-col gap-6 group hover:border-primary/20 transition-all border-2 border-zinc-200 dark:border-zinc-900"
                  >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <cat.icon className="w-6 h-6 text-primary" strokeWidth={2} />
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{cat.name}</h3>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Identifier: <span className="text-zinc-400">{cat.slug}</span></p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-primary transition-all">
                              <Edit2 className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 transition-all">
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Requirement Filters</span>
                           <Button 
                             variant="link" 
                             onClick={() => handleOpenFilters(cat)}
                             className="p-0 h-fit text-[9px] font-black uppercase text-primary tracking-widest"
                           >
                              Manage Filters
                           </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {cat.filters.map((filter, i) => (
                              <Badge key={i} className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[8px] font-black uppercase text-zinc-500 py-1">
                                 {filter}
                              </Badge>
                           ))}
                           <Badge className="bg-zinc-50 dark:bg-zinc-800/50 border-dashed border-zinc-200 dark:border-zinc-700 text-[8px] font-black uppercase text-zinc-600 py-1">
                              + {Math.floor(Math.random() * 5) + 2} More
                           </Badge>
                        </div>
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
         </TabsContent>

         <TabsContent value="matching" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Matching Radius */}
                  <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-8 relative overflow-hidden group">
                     <div className="space-y-1 relative z-10">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Proximity Engine</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Define geographic distribution rules</p>
                     </div>
                     <div className="space-y-4 relative z-10">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Global Scan Radius (KM)</label>
                           <input defaultValue="50" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-sm font-black text-primary italic focus:outline-none focus:border-primary" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-900">
                           <span className="text-[10px] font-black text-zinc-500 uppercase">Auto-Expansion</span>
                           <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase px-2 py-1">Enabled</Badge>
                        </div>
                     </div>
                     <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-primary opacity-[0.02] rotate-[-15deg] group-hover:opacity-[0.05] transition-opacity" />
                  </div>

                  {/* Load Balancing */}
                  <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-8 relative overflow-hidden group">
                     <div className="space-y-1 relative z-10">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Load Balancing</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Manage vendor response limits</p>
                     </div>
                     <div className="space-y-4 relative z-10">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Max Bids Per Lead</label>
                           <input defaultValue="10" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-sm font-black text-primary italic focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Bid Window (Hours)</label>
                           <input defaultValue="72" className="w-full h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-4 text-sm font-black text-primary italic focus:outline-none focus:border-primary" />
                        </div>
                     </div>
                     <Scale className="absolute -right-4 -bottom-4 w-32 h-32 text-primary opacity-[0.02] rotate-[15deg] group-hover:opacity-[0.05] transition-opacity" />
                  </div>

                  {/* Scoring Engine */}
                  <div className="admin-card p-8 border-zinc-200 dark:border-zinc-900 space-y-8 relative overflow-hidden group">
                     <div className="space-y-1 relative z-10">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Scoring & Priority</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">How vendors are sorted for users</p>
                     </div>
                     <div className="space-y-3 relative z-10">
                        {[
                          { label: "Proximity weight", val: "40%" },
                          { label: "Rating weight", val: "30%" },
                          { label: "Reliability score", val: "30%" }
                        ].map((item, i) => (
                           <div key={i} className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                 <span className="text-[9px] font-black text-zinc-500 uppercase">{item.label}</span>
                                 <span className="text-[10px] font-black text-primary">{item.val}</span>
                              </div>
                              <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary rounded-full" style={{ width: item.val }} />
                              </div>
                           </div>
                        ))}
                     </div>
                     <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-primary opacity-[0.02] rotate-[-5deg] group-hover:opacity-[0.05] transition-opacity" />
                  </div>
               </div>

               <div className="flex justify-end gap-3">
                  <Button variant="ghost" className="text-[10px] font-black uppercase text-zinc-500">Reset Defaults</Button>
                  <Button className="bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-10 rounded-xl">Save Matching Rules</Button>
               </div>
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

      {/* Advanced Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title={`${selectedCategory?.name} Filters`}
        description="Configure requirement fields for this service category"
        size="md"
      >
        {selectedCategory && (
          <div className="space-y-8 py-6">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Requirement Fields</h4>
                  <Button variant="ghost" className="h-fit p-0 text-[9px] font-black uppercase text-primary">Add Custom Field</Button>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {selectedCategory.filters.map((filter, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl group">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                             <Tags className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">{filter}</span>
                             <span className="text-[8px] font-black text-zinc-600 uppercase">Input Type: Dropdown / Tag</span>
                          </div>
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500">
                             <Settings2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 border-rose-500/20">
                             <X className="w-3.5 h-3.5" />
                          </Button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
               <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest">Smart Matching Note</h4>
               </div>
               <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed tracking-tight italic">
                  Changes to filters will affect how leads are distributed to vendors based on their profile capabilities. Existing leads will maintain their current schema.
               </p>
            </div>

            <div className="pt-4 flex gap-3">
               <Button className="flex-1 bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 rounded-xl">
                  Save Filter Schema
               </Button>
               <Button variant="ghost" onClick={() => setIsFilterModalOpen(false)} className="px-6 text-zinc-500 font-black uppercase text-[10px] tracking-widest">
                  Cancel
               </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Categories;
