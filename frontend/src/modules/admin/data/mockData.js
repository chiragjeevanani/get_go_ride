export const mockUsers = [
  { id: "u1", name: "Amit Sharma", phone: "9876543210", location: "Indore, MP", totalRequests: 12, status: "Active", joinDate: "2024-01-15" },
  { id: "u2", name: "Suresh Gupta", phone: "9123456789", location: "Bhopal, MP", totalRequests: 5, status: "Active", joinDate: "2024-02-10" },
  { id: "u3", name: "Priya Verma", phone: "9988776655", location: "Dewas, MP", totalRequests: 8, status: "Blocked", joinDate: "2023-11-20" },
  { id: "u4", name: "Rajesh Kumar", phone: "9456123789", location: "Indore, MP", totalRequests: 20, status: "Active", joinDate: "2023-12-05" },
  { id: "u5", name: "Anil Singh", phone: "9345678210", location: "Ujjain, MP", totalRequests: 3, status: "Active", joinDate: "2024-03-01" },
];

export const mockVendors = [
  { 
    id: "v1", 
    name: "Vijay Logistics", 
    phone: "9826012345", 
    vehicleTypes: ["Mini Truck", "Pick-up"], 
    location: "Indore", 
    subscriptionStatus: "Active", 
    rating: 4.8, 
    regNumber: "MP-09-AB-1234",
    capacity: "800kg",
    joinDate: "2024-01-05",
    isVerified: true,
    status: "Verified",
    documents: [
      { id: 1, title: "Driver's License", status: "Verified", date: "Exp: 2028-12-10" },
      { id: 2, title: "Vehicle Registration (RC)", status: "Verified", date: "Uploaded 2 days ago" },
      { id: 3, title: "Commercial Insurance", status: "Verified", date: "Exp: 2025-06-20" },
      { id: 4, title: "Identity Proof (Aadhar)", status: "Verified", date: "Verified by KYC" }
    ]
  },
  { 
    id: "v2", 
    name: "Ravi Transport", 
    phone: "9893054321", 
    vehicleTypes: ["Heavy Truck"], 
    location: "Bhopal", 
    subscriptionStatus: "Expired", 
    rating: 4.2, 
    regNumber: "MP-04-XY-5678",
    capacity: "5 Ton",
    joinDate: "2023-10-15",
    isVerified: true,
    status: "Verified",
    documents: [
      { id: 1, title: "Driver's License", status: "Verified", date: "Exp: 2026-05-15" },
      { id: 2, title: "Vehicle Registration (RC)", status: "Verified", date: "Uploaded 1 month ago" },
      { id: 3, title: "Commercial Insurance", status: "Rejected", date: "Expired" },
      { id: 4, title: "Identity Proof (Aadhar)", status: "Verified", date: "Verified by KYC" }
    ]
  },
  { 
    id: "v3", 
    name: "Speedy Movers", 
    phone: "9425011223", 
    vehicleTypes: ["Pick-up"], 
    location: "Dewas", 
    subscriptionStatus: "Active", 
    rating: 4.5, 
    regNumber: "MP-13-GH-9012",
    capacity: "1.2 Ton",
    joinDate: "2024-02-20",
    isVerified: false,
    status: "Pending",
    documents: [
      { id: 1, title: "Driver's License", status: "Verified", date: "Exp: 2028-12-10" },
      { id: 2, title: "Vehicle Registration (RC)", status: "Pending", date: "Uploaded 2 days ago" },
      { id: 3, title: "Commercial Insurance", status: "Pending", date: "Review needed" },
      { id: 4, title: "Identity Proof (Aadhar)", status: "Verified", date: "Verified by KYC" }
    ]
  },
];

export const mockLeads = [
  { 
    id: "l1", 
    serviceType: "House Shifting", 
    userName: "Amit Sharma", 
    location: "Indore to Bhopal", 
    status: "Finalized", 
    date: "2024-04-10", 
    description: "Full house shifting (2BHK) with furniture and appliances.",
    responses: 4
  },
  { 
    id: "l2", 
    serviceType: "Goods Transport", 
    userName: "Rajesh Kumar", 
    location: "Indore Local", 
    status: "Responded", 
    date: "2024-04-12", 
    description: "Transporting 50 boxes of garment stock.",
    responses: 2
  },
  { 
    id: "l3", 
    serviceType: "Emergency", 
    userName: "Anil Singh", 
    location: "Ujjain to Indore", 
    status: "Open", 
    date: "2024-04-15", 
    description: "Urgent need to move industrial equipment.",
    responses: 0
  },
];

export const mockSubscriptions = [
  { id: "s1", vendorName: "Vijay Logistics", plan: "Premium Monthly", expiryDate: "2024-05-15", status: "Active" },
  { id: "s2", vendorName: "Speedy Movers", plan: "Basic Monthly", expiryDate: "2024-05-20", status: "Active" },
  { id: "s3", vendorName: "Ravi Transport", plan: "Premium Yearly", expiryDate: "2024-04-05", status: "Expired" },
];

export const mockPlans = [
  { id: "p1", name: "Basic Monthly", price: 499, duration: "30 Days", features: ["10 Leads/Day", "Basic Support"] },
  { id: "p2", name: "Premium Monthly", price: 999, duration: "30 Days", features: ["Unlimited Leads", "Priority Support", "Verified Badge"] },
  { id: "p3", name: "Premium Yearly", price: 8999, duration: "365 Days", features: ["Unlimited Leads", "Priority Support", "Verified Badge", "Free Marketing"] },
];

export const mockRevenueData = [
  { name: "Jan", revenue: 45000 },
  { name: "Feb", revenue: 52000 },
  { name: "Mar", revenue: 48000 },
  { name: "Apr", revenue: 61000 },
  { name: "May", revenue: 55000 },
  { name: "Jun", revenue: 67000 },
];

export const mockLeadsTrend = [
  { name: "Mon", leads: 20 },
  { name: "Tue", leads: 35 },
  { name: "Wed", leads: 25 },
  { name: "Thu", leads: 45 },
  { name: "Fri", leads: 30 },
  { name: "Sat", leads: 55 },
  { name: "Sun", leads: 40 },
];

export const mockReviews = [
  { id: "rev1", user: "Amit S.", vendor: "Vijay Logistics", rating: 5, comment: "Excellent service, very professional.", status: "Approved", date: "2024-04-01" },
  { id: "rev2", user: "Rajesh K.", vendor: "Speedy Movers", rating: 2, comment: "Arrived late, but handled items well.", status: "Pending", date: "2024-04-05" },
];

export const mockNotifications = [
  { id: "n1", title: "New Vendor Registration", message: "Shyam Transport has registered and is waiting for approval.", type: "vendor", time: "2 hours ago", isRead: false },
  { id: "n2", title: "Subscription Expiring", message: "Ravi Transport's subscription is expiring in 2 days.", type: "subscription", time: "5 hours ago", isRead: true },
  { id: "n3", title: "High Lead Activity", message: "Indore Local route is seeing high demand today.", type: "leads", time: "1 day ago", isRead: true },
];
