import { useState, useEffect } from 'react';

const mockLeads = [
  {
    id: "L-001",
    service: "Goods Transport",
    pickup: "Rajwada, Indore",
    drop: "Vijay Nagar, Indore",
    weight: "500kg",
    items: "Boxes",
    date: "Today, 4:00 PM",
    distance: "8km",
    status: "new",
    type: "goods"
  },
  {
    id: "L-002",
    service: "House Shifting",
    pickup: "Old Palasia, Indore",
    drop: "Bhawarkua, Indore",
    weight: "2000kg",
    items: "Household items",
    date: "Tomorrow, 10:00 AM",
    distance: "12km",
    status: "new",
    type: "house"
  },
  {
    id: "L-003",
    service: "Passenger",
    pickup: "Indore Airport",
    drop: "Dewas Naka, Indore",
    weight: "4 Persons",
    items: "Luggage included",
    date: "Today, 6:30 PM",
    distance: "15km",
    status: "expiring",
    type: "passenger"
  }
];

export const useDriverState = () => {
  const [driver, setDriver] = useState(() => {
    const saved = localStorage.getItem('safar_driver');
    return saved ? JSON.parse(saved) : {
      name: "Ramesh Kumar",
      phone: "+91 9876543210",
      vehicle: "Tata Ace (Chota Hathi)",
      vehicleNumber: "MP 09 AB 1234",
      regNumber: "REG-991823",
      rating: 4.8,
      completedLeads: 124,
      isSubscribed: false,
      isOnline: true,
      profileProgress: 75,
      subscriptionExpiry: "2026-05-15"
    };
  });

  const [leads, setLeads] = useState(mockLeads);
  const [activeLeads, setActiveLeads] = useState([]);
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('safar_driver_stats');
    return savedStats ? JSON.parse(savedStats) : {
      total: 142,
      accepted: 86,
      rejected: 56
    };
  });
  
  useEffect(() => {
    localStorage.setItem('safar_driver', JSON.stringify(driver));
  }, [driver]);

  useEffect(() => {
    localStorage.setItem('safar_driver_stats', JSON.stringify(stats));
  }, [stats]);

  const toggleOnline = () => {
    setDriver(prev => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const activateSubscription = (plan) => {
    setDriver(prev => ({ ...prev, isSubscribed: true }));
  };

  const acceptLead = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setActiveLeads(prev => [...prev, { ...lead, status: 'accepted' }]);
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setStats(prev => ({ ...prev, accepted: prev.accepted + 1 }));
    }
  };

  const rejectLead = (leadId) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
  };

  return {
    driver,
    leads,
    activeLeads,
    stats,
    toggleOnline,
    activateSubscription,
    acceptLead,
    rejectLead,
    setDriver
  };
};
