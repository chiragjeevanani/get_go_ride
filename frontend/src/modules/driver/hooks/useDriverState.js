import { useState, useEffect } from 'react';
import { leadApi, vendorApi } from '@/lib/api';
import { storage } from '@/lib/storage';

// Normalization helper to map MongoDB Requirement model to UI structure
export const normalizeLead = (req) => {
  if (!req) return null;
  
  let dateStr = "Today";
  try {
    const d = new Date(req.date);
    dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch (e) {}
  if (req.time) {
    dateStr += `, ${req.time}`;
  }

  const serviceMap = {
    goods: "Goods Transport",
    house: "House Shifting",
    emergency: "Emergency Response",
    construction: "Construction Hauling"
  };

  return {
    id: req._id,
    service: serviceMap[req.serviceType] || req.serviceType || "Logistics Ride",
    pickup: req.pickup?.address || "Pickup Address",
    drop: req.drops?.[0]?.address || req.drops?.[req.drops.length - 1]?.address || "Drop Address",
    weight: req.weight || "N/A",
    items: req.items || "General Cargo",
    date: dateStr,
    distance: "Local",
    status: req.status === 'pending' ? 'new' : req.status,
    type: req.serviceType,
    price: req.price || 1500,
    raw: req
  };
};

export const useDriverState = (options = {}) => {
  const { loadProfile = true, loadLeads = false } = options;

  const [driver, setDriver] = useState(() => {
    const saved = storage.getDriver();
    return saved || {
      name: "",
      phone: "",
      vehicleType: "",
      vehicleRegNumber: "",
      vehicleCapacity: "",
      rating: 0,
      completedLeads: 0,
      isSubscribed: false,
      isVerified: false,
      isOnline: true,
      profileProgress: 0,
      documents: [],
      vehicleImages: []
    };
  });

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeLeads, setActiveLeads] = useState([]);
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('get_go_load_driver_stats');
    return savedStats ? JSON.parse(savedStats) : {
      total: 0,
      accepted: 0,
      rejected: 0
    };
  });

  const fetchProfile = async () => {
    try {
      const res = await vendorApi.getProfile();
      const profileData = res.data || res;
      if (profileData) {
        setDriver(prev => ({ ...prev, ...profileData }));
      }
    } catch (err) {
      console.error("Failed to load driver profile details:", err);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await leadApi.getAvailable();
      const data = res.data || res;
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeLead).filter(Boolean);
        setLeads(normalized);
      }
    } catch (err) {
      console.error("Failed to fetch available leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loadProfile) {
      fetchProfile();
    }
  }, [loadProfile]);

  useEffect(() => {
    if (loadLeads) {
      fetchLeads();
    }
  }, [loadLeads]);
  
  useEffect(() => {
    storage.setDriver(driver);
  }, [driver]);

  useEffect(() => {
    localStorage.setItem('get_go_load_driver_stats', JSON.stringify(stats));
  }, [stats]);

  const toggleOnline = () => {
    setDriver(prev => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const activateSubscription = (plan) => {
    setDriver(prev => ({ ...prev, isSubscribed: true }));
  };

  const acceptLead = async (leadId, customAmount) => {
    let bidResult = null;
    try {
      const res = await leadApi.bid(leadId, {
        amount: customAmount || 1500, // Fallback to a default if not provided
        notes: 'Interested in this job'
      });
      bidResult = res.data || res;
    } catch (err) {
      const errData = err.response?.data || err;
      const isAlreadyBid = 
        errData?.error === 'ALREADY_BID' ||
        (err.response?.status === 400 && (
          errData?.message?.toLowerCase().includes('already') ||
          errData?.message?.toLowerCase().includes('bid')
        )) ||
        err.message?.includes('ALREADY_BID');

      if (isAlreadyBid) {
        console.log("Vendor already placed a bid on this lead. Transitioning to chat smoothly.");
        return { alreadyBid: true };
      } else {
        console.error("Failed to place backend bid:", err);
        throw err;
      }
    }
    
    // Update local state if the lead exists in our current lists
    const leadInLeads = leads.find(l => l.id === leadId);
    if (leadInLeads) {
      setActiveLeads(prev => [...prev, { ...leadInLeads, status: 'accepted' }]);
      setLeads(prev => prev.filter(l => l.id !== leadId));
    }
    
    setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
    return bidResult || true;
  };

  const rejectLead = (leadId) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
  };

  const derivedDriver = {
    ...driver,
    isSubscribed: driver.subscriptionStatus === 'Active' || !!driver.isSubscribed
  };

  return {
    driver: derivedDriver,
    leads,
    activeLeads,
    stats,
    loading,
    refreshLeads: fetchLeads,
    refreshProfile: fetchProfile,
    toggleOnline,
    activateSubscription,
    acceptLead,
    rejectLead,
    setDriver
  };
};

