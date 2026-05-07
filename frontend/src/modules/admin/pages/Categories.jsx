import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, 
  Layers, Truck, Info, Home,
  ChevronRight, Save, X,
  Briefcase, Package, CarFront,
  Tags, Settings2, Activity,
  Scale, Zap, Loader2,
  Upload, Image
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Modal } from '../components/common/Modal';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Toast } from '../components/common/Toast';
import { categoryApi, uploadApi, vehicleApi } from '@/lib/api';

const Categories = () => {
  const [activeTab, setActiveTab] = useState("service");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedVehicleCategories, setSelectedVehicleCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [categoryFile, setCategoryFile] = useState(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState("");
  const [categoryImagePreview, setCategoryImagePreview] = useState("");

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchVehicles();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll();
      setServiceCategories(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const res = await vehicleApi.getAll();
      setVehicleTypes(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load vehicle types', 'error');
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleOpenFilters = (cat) => {
    setSelectedCategory(cat);
    setIsFilterModalOpen(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryFile(null);
    setCategoryImageUrl(cat.image || "");
    setCategoryImagePreview(cat.image || "");
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure? This will remove the service category.')) return;
    try {
      await categoryApi.delete(id);
      setServiceCategories(prev => prev.filter(c => c._id !== id));
      showToast('Category removed successfully', 'error');
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFile(null);
    setCategoryImageUrl("");
    setCategoryImagePreview("");
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const fData = new FormData(e.target);

    try {
      // Step 1: Upload image file first if a local file was selected
      let finalImageUrl = categoryImageUrl;
      if (categoryFile) {
        showToast('Uploading image...', 'success');
        const uploadRes = await uploadApi.image(categoryFile);
        finalImageUrl = uploadRes.url;
      }

      // Step 2: Save category with plain JSON including the resolved image URL
      const catData = {
        name: fData.get('name'),
        slug: fData.get('slug') || fData.get('name').toLowerCase().replace(/\s+/g, '-'),
        description: fData.get('description'),
        image: finalImageUrl,
      };

      if (editingCategory) {
        const res = await categoryApi.update(editingCategory._id, catData);
        setServiceCategories(prev => prev.map(c => c._id === editingCategory._id ? res.data : c));
        showToast('Category updated successfully', 'success');
      } else {
        const res = await categoryApi.create(catData);
        setServiceCategories(prev => [...prev, res.data]);
        showToast('New category added successfully', 'success');
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setSelectedVehicleCategories(vehicle.categorySlugs || (vehicle.categorySlug ? [vehicle.categorySlug] : []));
    setIsVehicleModalOpen(true);
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle class?')) return;
    try {
      await vehicleApi.delete(id);
      setVehicleTypes(prev => prev.filter(v => (v._id || v.id) !== id));
      showToast('Vehicle class removed from registry', 'error');
    } catch (err) {
      showToast(err.message || 'Failed to remove vehicle class', 'error');
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setSelectedVehicleCategories([]);
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    const fData = new FormData(e.target);
    const payload = {
      name: fData.get('name'),
      capacity: fData.get('capacity'),
      details: fData.get('details'),
      categorySlug: selectedVehicleCategories[0] || '',
      categorySlugs: selectedVehicleCategories,
      isMostBooked: fData.get('isMostBooked') === 'on',
    };

    try {
      if (editingVehicle) {
        const id = editingVehicle._id || editingVehicle.id;
        const res = await vehicleApi.update(id, payload);
        setVehicleTypes(prev => prev.map(v => (v._id || v.id) === id ? res.data : v));
        showToast('Vehicle class updated successfully', 'success');
      } else {
        const res = await vehicleApi.create(payload);
        setVehicleTypes(prev => [...prev, res.data]);
        showToast('New vehicle class registered successfully', 'success');
      }
      setIsVehicleModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to register vehicle class', 'error');
    }
  };

  // Icon mapping for dynamic icons
  const iconMap = {
    Briefcase, Package, Truck, CarFront, Layers, Zap
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Category Config" 
        subtitle="Manage available service categories and matching rules" 
        actions={
          <Button 
            onClick={handleAddCategory}
            className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
             <Plus className="w-4 h-4 mr-2" />
             Add New
          </Button>
        }
      />

      <Tabs defaultValue="service" className="space-y-6" onValueChange={setActiveTab}>
         <TabsList className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-1 rounded-2xl w-full max-w-xs flex gap-1">
            <TabsTrigger value="service" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
               Service Categories
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest py-3 data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
               Vehicle Class
            </TabsTrigger>
         </TabsList>

         <TabsContent value="service" className="animate-in fade-in slide-in-from-left-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
               {loading ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                     <Loader2 className="w-10 h-10 animate-spin text-primary" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Syncing Categories...</p>
                  </div>
               ) : (
                <>
                {serviceCategories.map((cat) => {
                  const IconComponent = iconMap[cat.icon] || Package;
                  return (
                    <motion.div 
                      key={cat._id} 
                      whileHover={{ scale: 1.01 }}
                      className="admin-card p-6 flex flex-col gap-6 group hover:border-primary/20 transition-all border-2 border-zinc-200 dark:border-zinc-900"
                    >
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors overflow-hidden">
                                {cat.image ? (
                                   <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                ) : (
                                   <IconComponent className="w-6 h-6 text-primary" strokeWidth={2} />
                                )}
                             </div>
                             <div className="space-y-1">
                                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{cat.name}</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Identifier: <span className="text-zinc-400">{cat.slug}</span></p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditCategory(cat)}
                              className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-primary hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                             >
                                <Edit2 className="w-4 h-4" />
                             </Button>
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                             >
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
                             {(cat.filters || []).map((filter, i) => (
                                <Badge key={i} className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[8px] font-black uppercase text-zinc-500 py-1">
                                   {typeof filter === 'string' ? filter : filter.name}
                                </Badge>
                             ))}
                             <Badge className="bg-zinc-50 dark:bg-zinc-800/50 border-dashed border-zinc-200 dark:border-zinc-700 text-[8px] font-black uppercase text-zinc-600 py-1">
                                + {Math.floor(Math.random() * 5) + 2} More
                             </Badge>
                          </div>
                       </div>
                    </motion.div>
                  )
                })}
                </>
               )}

                {/* Add Placeholder */}
                <div 
                  onClick={handleAddCategory}
                  className="admin-card p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-all cursor-pointer hover:border-primary/20 hover:bg-primary/5"
                >
                   <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-zinc-400" />
                   </div>
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Add New Category</span>
                </div>
            </div>
         </TabsContent>

         <TabsContent value="vehicle" className="animate-in fade-in slide-in-from-right-4 duration-300">
             {vehiclesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 admin-card border-dashed">
                   <Loader2 className="w-8 h-8 text-primary animate-spin" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading registered classes...</span>
                </div>
             ) : vehicleTypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 admin-card border-dashed">
                   <Info className="w-8 h-8 text-amber-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">No vehicle classes registered in the database.</span>
                   <Button onClick={handleAddVehicle} className="mt-2 bg-primary/10 hover:bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-lg">Register First Class</Button>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                   {vehicleTypes.map((vehicle) => {
                      const vehicleId = vehicle._id || vehicle.id;
                      const isHouse = vehicle.categorySlug?.includes('house');
                      const isEmergency = vehicle.categorySlug?.includes('emergency');
                      const isConstruction = vehicle.categorySlug?.includes('construction');
                      
                      let VehicleIcon = Truck;
                      if (isHouse) VehicleIcon = Home;
                      else if (isEmergency) VehicleIcon = Activity;
                      else if (isConstruction) VehicleIcon = Layers;

                      return (
                         <motion.div 
                           key={vehicleId} 
                           whileHover={{ scale: 1.01 }}
                           className="admin-card p-6 flex items-center justify-between group hover:border-primary/20 transition-all border-2 border-zinc-200 dark:border-zinc-900 relative"
                         >
                            <div className="flex items-center gap-5">
                               <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                  <VehicleIcon className="w-6 h-6 text-primary" strokeWidth={2} />
                                </div>
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                     <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter leading-none">{vehicle.name}</h3>
                                     {vehicle.isMostBooked && (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase px-1.5 py-0.5 leading-none">Best Option</Badge>
                                     )}
                                  </div>
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-[#71717a]">
                                     Payload Capacity: <span className="text-primary italic">{vehicle.capacity}</span>
                                  </p>
                                  <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                                     {(vehicle.categorySlugs || (vehicle.categorySlug ? [vehicle.categorySlug] : [])).map(slug => (
                                        <Badge key={slug} className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5">
                                           {slug}
                                        </Badge>
                                     ))}
                                     {vehicle.details && (
                                        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 italic uppercase">({vehicle.details})</span>
                                     )}
                                  </div>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => handleEditVehicle(vehicle)}
                                 className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-primary hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                               >
                                  <Edit2 className="w-4 h-4" />
                               </Button>
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => handleDeleteVehicle(vehicleId)}
                                 className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </Button>
                            </div>
                         </motion.div>
                      );
                   })}

                   {/* Add Placeholder */}
                   <div 
                     onClick={handleAddVehicle}
                     className="admin-card p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-all cursor-pointer hover:border-primary/20 hover:bg-primary/5 min-h-[110px]"
                   >
                      <Plus className="w-6 h-6 text-zinc-400" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Define New Class</span>
                   </div>
                </div>
             )}
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

      {/* Category Management Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? "Update Category" : "Define New Category"}
        description="Configure service classification, public identifier, and presentation"
        size="md"
      >
         <form onSubmit={handleSaveCategory} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category Display Name</label>
                     <input 
                        name="name"
                        required
                        placeholder="e.g. Luxury Car Transport"
                        defaultValue={editingCategory?.name}
                        className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary transition-all"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Service Identifier (Slug)</label>
                     <input 
                        name="slug"
                        placeholder="e.g. luxury-transport"
                        defaultValue={editingCategory?.slug}
                        className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-500 italic focus:outline-none focus:border-primary transition-all"
                     />
                     <p className="px-1 text-[8px] font-bold text-zinc-400 uppercase italic">* Leave blank to auto-generate from name</p>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Description / Tagline</label>
                     <input 
                        name="description"
                        placeholder="e.g. For household furniture & appliances"
                        defaultValue={editingCategory?.description}
                        className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary transition-all"
                     />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 font-black">Category Image Presentation</label>
                     
                     {categoryImagePreview ? (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 flex items-center justify-center">
                           <img src={categoryImagePreview} alt="Preview" className="h-full w-auto object-contain" />
                           <button
                              type="button"
                              onClick={() => {
                                 setCategoryFile(null);
                                 setCategoryImageUrl("");
                                 setCategoryImagePreview("");
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-md"
                           >
                              <X className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     ) : (
                        <div className="w-full h-32 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-1.5 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-400">
                           <Image className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                           <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">No Image Assigned</span>
                        </div>
                     )}

                     <div className="grid grid-cols-1 gap-2 pt-1.5">
                        <div className="flex items-center gap-2">
                           <input
                              type="file"
                              id="category-file-input"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                 const file = e.target.files[0];
                                 if (file) {
                                    setCategoryFile(file);
                                    setCategoryImageUrl("");
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                       setCategoryImagePreview(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                 }
                              }}
                           />
                           <label
                              htmlFor="category-file-input"
                              className="flex-1 h-10 px-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-primary/20 hover:bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                           >
                              <Upload className="w-3.5 h-3.5" />
                              Upload Local Image
                           </label>
                        </div>

                        <div className="relative">
                           <input
                              type="text"
                              placeholder="Or paste custom Image URL..."
                              value={categoryImageUrl}
                              onChange={(e) => {
                                 const val = e.target.value;
                                 setCategoryImageUrl(val);
                                 setCategoryImagePreview(val);
                                 setCategoryFile(null);
                              }}
                              className="w-full h-10 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary transition-all"
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
               <Button type="submit" className="flex-1 bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg shadow-primary/20">
                  {editingCategory ? "Save Changes" : "Create Category"}
               </Button>
               <Button type="button" variant="ghost" onClick={() => setIsCategoryModalOpen(false)} className="px-6 text-zinc-500 font-black uppercase text-[10px] tracking-widest">
                  Cancel
               </Button>
            </div>
         </form>
      </Modal>

      {/* Vehicle Management Modal */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        title={editingVehicle ? "Update Vehicle Class" : "Register Vehicle Class"}
        description="Define load capacity and classification for vendor vehicles"
        size="sm"
      >
        <form onSubmit={handleSaveVehicle} className="space-y-6 pt-2">
           <div className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Vehicle Classification Name</label>
                 <input 
                     name="name"
                     required
                     placeholder="e.g. 14ft Closed Container"
                     defaultValue={editingVehicle?.name}
                     className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary transition-all"
                  />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Payload Capacity (Text)</label>
                 <input 
                    name="capacity"
                    required
                    placeholder="e.g. 5 - 7 Ton"
                    defaultValue={editingVehicle?.capacity}
                    className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary transition-all"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category Associations</label>
                 <div className="grid grid-cols-2 gap-2">
                    {serviceCategories.map(cat => {
                       const isSelected = selectedVehicleCategories.includes(cat.slug);
                       return (
                          <button
                             type="button"
                             key={cat.slug}
                             onClick={() => {
                                setSelectedVehicleCategories(prev => 
                                   prev.includes(cat.slug)
                                      ? prev.filter(slug => slug !== cat.slug)
                                      : [...prev, cat.slug]
                                );
                             }}
                             className={cn(
                                "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                isSelected 
                                   ? "bg-primary/5 border-primary/40 text-zinc-900 dark:text-white"
                                   : "bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                             )}
                          >
                             <span className="text-xs font-black uppercase tracking-wider">{cat.name}</span>
                             <div className={cn(
                                "w-4 h-4 rounded-full flex items-center justify-center border transition-all",
                                isSelected 
                                   ? "bg-primary border-primary text-black" 
                                   : "border-zinc-300 dark:border-zinc-700"
                             )}>
                                {isSelected && (
                                   <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                   </svg>
                                )}
                             </div>
                          </button>
                       );
                    })}
                 </div>
                 {selectedVehicleCategories.length === 0 && (
                    <p className="text-[9px] font-bold text-amber-500 italic uppercase px-1">* At least one category must be selected</p>
                 )}
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Specifications Tagline (Details)</label>
                 <input 
                    name="details"
                    placeholder="e.g. ICV • 6 Tyres • High Deck"
                    defaultValue={editingVehicle?.details}
                    className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary transition-all"
                 />
              </div>
           </div>

           <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <input 
                 type="checkbox"
                 id="isMostBooked"
                 name="isMostBooked"
                 defaultChecked={editingVehicle?.isMostBooked}
                 className="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary accent-primary"
              />
              <label htmlFor="isMostBooked" className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest cursor-pointer select-none">
                 Highlight as Best Option (Most Booked Badge)
              </label>
           </div>

           <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
              <Button type="submit" className="flex-1 bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg shadow-primary/20">
                 {editingVehicle ? "Update Registry" : "Register Class"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsVehicleModalOpen(false)} className="px-6 text-zinc-500 font-black uppercase text-[10px] tracking-widest">
                 Cancel
              </Button>
           </div>
        </form>
      </Modal>

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: '', type: 'success' })} 
      />
    </div>
  );
};

export default Categories;
