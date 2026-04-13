import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Search, MapPin, Navigation, X, ChevronLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// Component to handle map center pin and relocation
const MapEvents = ({ onCityChange }) => {
  const map = useMap();
  
  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onCityChange(center.lat, center.lng);
    },
  });

  return null;
};

// Helper component to recenter map when coords change
const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 15, { duration: 1 });
  }, [coords]);
  return null;
};

const LocationSelector = ({ isOpen, onClose, onSelect, title, initialValue }) => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(initialValue || "");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState([19.0760, 72.8777]); // Default Mumbai
  const [isTyping, setIsTyping] = useState(false);
  const [isManualConfirm, setIsManualConfirm] = useState(false);
  const mapRef = useRef(null);

  // Search for address using Nominatim API (OpenStreetMap)
  const searchAddress = async (query) => {
    if (query.length < 3) return;
    setLoading(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);
      const data = await resp.json();
      setSuggestions(data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      })));
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocoding (Coord to Address)
  const reverseGeocode = async (lat, lng) => {
    if (isManualConfirm) {
      setIsManualConfirm(false);
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await resp.json();
      setSelectedAddress(data.display_name);
      setSearch(""); // Clear search when map is dragged
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const newCoords = [latitude, longitude];
      setCoords(newCoords);
      reverseGeocode(latitude, longitude);
    }, (err) => {
      console.error("Geolocation error:", err);
      setLoading(false);
    });
  };

  const handleSelectSuggestion = (suggestion) => {
    setIsManualConfirm(true);
    const newCoords = [suggestion.lat, suggestion.lon];
    setCoords(newCoords);
    setSelectedAddress(suggestion.display_name);
    setSuggestions([]);
    setIsTyping(false);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search && isTyping) searchAddress(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, isTyping]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 bg-white z-[2000] flex flex-col overflow-hidden max-w-md mx-auto"
        >
          {/* Header & Search */}
          <div className="absolute top-0 left-0 right-0 z-[2010] p-4 space-y-3 bg-white/40 backdrop-blur-md pb-6">
             <div className="flex items-center gap-3 mb-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-white shadow-lg border border-zinc-100"
                  onClick={onClose}
                >
                   <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex-1">
                   <h3 className="text-lg font-black text-black tracking-tight leading-none">{title}</h3>
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Select location on map</p>
                </div>
             </div>

             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder={title}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsTyping(true);
                  }}
                  onFocus={() => setIsTyping(true)}
                  className="pl-11 h-14 bg-white border-none rounded-2xl text-sm font-bold shadow-2xl focus-visible:ring-primary/40 ring-1 ring-zinc-100"
                />
                {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
             </div>

             {/* Suggestions Dropdown */}
             <AnimatePresence>
                {isTyping && suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-50 overflow-hidden"
                  >
                    {suggestions.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        className="p-4 flex items-center gap-3 border-b border-zinc-50 last:border-none hover:bg-zinc-50 transition-colors cursor-pointer group"
                      >
                        <div className="p-2 bg-zinc-100 rounded-xl group-hover:bg-primary/20 transition-colors">
                           <MapPin className="w-4 h-4 text-zinc-500 group-hover:text-black" />
                        </div>
                        <span className="text-xs font-bold text-zinc-600 line-clamp-2 leading-relaxed">{item.display_name}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Map Section */}
          <div className="flex-1 relative">
             <MapContainer 
              center={coords} 
              zoom={15} 
              className="w-full h-full z-0"
              zoomControl={false}
              ref={mapRef}
             >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents onCityChange={reverseGeocode} />
                <RecenterMap coords={coords} />
             </MapContainer>

             {/* Center Point Marker */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500] -translate-y-6">
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative flex flex-col items-center"
                >
                   <div className="bg-black text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-2xl mb-2 flex items-center gap-2 border border-white/20 whitespace-nowrap">
                      {loading ? "Geocoding..." : "Select this location"}
                      {!loading && <Check className="w-3 h-3 text-primary" />}
                   </div>
                   <div className="relative">
                      <MapPin className="w-10 h-10 text-primary fill-current" />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/20 rounded-full blur-[2px]"></div>
                   </div>
                </motion.div>
             </div>

             {/* Bottom Address Card */}
             <div className="absolute bottom-24 left-4 right-4 z-[2010]">
                <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-zinc-100 space-y-4">
                   <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                         <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                         <h4 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1.5">Selected Address</h4>
                         <p className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">
                            {selectedAddress || "Move the map to pinpoint location"}
                         </p>
                      </div>
                   </div>

                   <Button 
                    onClick={useCurrentLocation}
                    variant="outline" 
                    className="w-full h-11 rounded-xl border-zinc-100 text-zinc-600 font-bold text-[10px] uppercase gap-2 hover:bg-zinc-50 tracking-wider"
                  >
                      <Navigation className="w-3.5 h-3.5 fill-current" />
                      Use Current Location
                   </Button>
                </div>
             </div>
          </div>

          {/* Confirm Button */}
          <div className="p-6 bg-white border-t border-zinc-50 pb-8 z-[2020] shadow-[0_-15px_40px_rgba(0,0,0,0.05)]">
             <Button 
                onClick={() => onSelect(selectedAddress)}
                disabled={!selectedAddress || loading}
                className="w-full h-16 rounded-[2rem] bg-black text-white font-black text-lg shadow-2xl shadow-black/20 hover:bg-zinc-900 active:scale-95 transition-all uppercase tracking-tight"
             >
                Confirm {title.split(' ')[1] || 'Location'}
             </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationSelector;
