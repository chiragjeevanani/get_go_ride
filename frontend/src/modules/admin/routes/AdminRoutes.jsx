import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const VendorManagement = lazy(() => import('../pages/VendorManagement'));
const LeadManagement = lazy(() => import('../pages/LeadManagement'));
const SubscriptionManagement = lazy(() => import('../pages/SubscriptionManagement'));
const Revenue = lazy(() => import('../pages/Revenue'));
const Categories = lazy(() => import('../pages/Categories'));
const Moderation = lazy(() => import('../pages/Moderation'));
const Settings = lazy(() => import('../pages/Settings'));
const Notifications = lazy(() => import('../pages/Notifications'));
const ActivityFeed = lazy(() => import('../pages/ActivityFeed'));
const Faqs = lazy(() => import('../pages/Faqs'));
const Login = lazy(() => import('../pages/Login'));
const WithdrawalManagement = lazy(() => import('../pages/WithdrawalManagement'));
const FcmTestDashboard = lazy(() => import('../pages/FcmTestDashboard'));

// Placeholder Loading Component
const PageLoading = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Loading Admin Module...</span>
  </div>
);

const AdminRoutes = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Unprotected standalone login page */}
        <Route path="login" element={<Login />} />

        {/* Protected layout and children */}
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="activity" element={<ActivityFeed />} />
          <Route path="users" element={<UserManagement />} />
          {/* <Route path="users/:id" element={<UserDetail />} /> */}
          <Route path="vendors" element={<VendorManagement />} />
          {/* <Route path="vendors/:id" element={<VendorDetail />} /> */}
          <Route path="leads" element={<LeadManagement />} />
          {/* <Route path="leads/:id" element={<LeadDetail />} /> */}
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="categories" element={<Categories />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="fcm-test" element={<FcmTestDashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="withdrawals" element={<WithdrawalManagement />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
