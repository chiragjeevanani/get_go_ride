import { useState, useEffect, useRef } from "react";
import { MapPin, Plus, Trash2, Home, Briefcase, ChevronLeft, Loader2, X, AlertTriangle, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { userApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SavedAddresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [label, setLabel] = useState("Home");
  const [customLabel, setCustomLabel] = useState("");
  const [addressVal, setAddressVal] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [locLoading, setLocLoading] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAddresses();
      setAddresses(res.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await userApi.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr._id !== id));
      toast.success("Address deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete address");
    }
  };

  const handleSearch = (value) => {
    setAddressVal(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLocLoading(true);
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5`
        );
        const data = await resp.json();
        setSuggestions(
          data.map(item => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          }))
        );
      } catch (err) {
        console.error("OSM Error:", err);
      } finally {
        setLocLoading(false);
      }
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalLabel = label === "Other" ? customLabel : label;
    if (!finalLabel) {
      toast.error("Please provide a label");
      return;
    }
    if (!addressVal) {
      toast.error("Please enter or select an address");
      return;
    }

    setSubmitting(true);
    try {
      await userApi.addAddress({
        label: finalLabel,
        address: addressVal,
        lat: suggestions[0]?.lat || 0,
        lon: suggestions[0]?.lon || 0
      });
      toast.success("Address added successfully");
      setModalOpen(false);
      
      // Reset State
      setAddressVal("");
      setCustomLabel("");
      setSuggestions([]);
      
      fetchAddresses();
    } catch (err) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (lbl) => {
    const l = lbl.toLowerCase();
    if (l === "home") return <Home className="w-5 h-5" />;
    if (l === "office") return <Briefcase className="w-5 h-5" />;
    return <MapPin className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24 relative">
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Addresses...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.length === 0 ? (
            <div className="text-center py-12 px-6 border-2 border-dashed border-zinc-100 rounded-3xl space-y-2">
              <MapPinned className="w-10 h-10 mx-auto text-zinc-300" />
              <h3 className="text-xs font-black text-zinc-500 uppercase">No Saved Addresses</h3>
              <p className="text-[10px] text-zinc-400 font-bold leading-tight">Add your home or office address to make booking lightning fast.</p>
            </div>
          ) : (
            addresses.map((addr) => (
              <Card key={addr._id} className="border-none shadow-premium bg-white group hover:shadow-md transition-all">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="p-2 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:bg-primary group-hover:text-black transition-all">
                    {getIcon(addr.label)}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                       <span className="font-black text-black text-xs uppercase tracking-widest">{addr.label}</span>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDelete(addr._id)}
                         className="h-7 w-7 text-zinc-300 hover:text-red-500 transition-colors"
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </Button>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium leading-tight pr-6">{addr.address}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <Button 
            onClick={() => setModalOpen(true)}
            className="w-full h-12 rounded-2xl bg-primary text-black font-black shadow-lg shadow-primary/20 mt-2"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Address
          </Button>
        </div>
      )}

      {/* Add Address Modal (Bottom Draw / Modal Dialog Overlay) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[2.5rem] w-full max-w-md p-6 pb-8 space-y-6 animate-in slide-in-from-bottom-12 duration-300 shadow-2xl relative">
            <header className="flex justify-between items-center">
              <div className="flex flex-col">
                <h2 className="text-base font-black text-black uppercase tracking-tight">Add New Address</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Fast checkout location</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-zinc-50 hover:bg-zinc-100" 
                onClick={() => setModalOpen(false)}
              >
                <X className="w-4 h-4 text-zinc-500" />
              </Button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Location Label</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Home", "Office", "Other"].map((item) => (
                    <Button
                      key={item}
                      type="button"
                      variant="ghost"
                      onClick={() => setLabel(item)}
                      className={cn(
                        "h-10 rounded-xl font-bold text-xs uppercase tracking-wider border-2",
                        label === item ? "border-primary bg-primary/5 text-black" : "border-zinc-50 text-zinc-400 bg-zinc-50/50"
                      )}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Label if Other */}
              {label === "Other" && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Custom Label Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Warehouse, Parents"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              )}

              {/* Address Autocomplete search */}
              <div className="space-y-1 relative">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Full Address</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Search address or street..."
                    value={addressVal}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-primary transition-all"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-300">
                    {locLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <MapPin className="w-4 h-4" />}
                  </div>
                </div>

                {/* Autocomplete suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in duration-200">
                    {suggestions.map((sug, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setAddressVal(sug.display_name);
                          setSuggestions([]);
                        }}
                        className="p-3 text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-b-0 flex items-start gap-2.5 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{sug.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/20"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Location"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setModalOpen(false)}
                  className="px-6 text-zinc-500 font-black uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
