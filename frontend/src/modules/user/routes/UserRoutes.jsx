import { Routes, Route } from "react-router-dom";
import UserMainLayout from "../components/Layout/UserMainLayout";
import AuthPage from "../pages/AuthPage";
import Dashboard from "../pages/Dashboard";
import CreateRequirement from "../pages/CreateRequirement";
import RequestList from "../pages/RequestList";
import RequestDetails from "../pages/RequestDetails";
import VendorProfile from "../pages/VendorProfile";
import ChatPage from "../pages/ChatPage";
import ChatList from "../pages/ChatList";
import FinalizePage from "../pages/FinalizationFlow";
import ProfilePage from "../pages/ProfilePage";
import PaymentMethods from "../pages/PaymentMethods";
import SavedAddresses from "../pages/SavedAddresses";
import SupportPage from "../pages/SupportPage";
import LocationSearchPage from "../pages/LocationSearchPage";
import NearbyVehicles from "../pages/NearbyVehicles";
import FavoriteVendors from "../pages/FavoriteVendors";
import NotificationSettings from "../pages/NotificationSettings";
import SecuritySettings from "../pages/SecuritySettings";

const UserRoutes = () => {
  return (
    <Routes>
      {/* Public Pages like Auth */}
      <Route path="auth" element={<AuthPage />} />

      {/* Main App with Shared Shell Layout */}
      <Route element={<UserMainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="post-requirement" element={<CreateRequirement />} />
        <Route path="nearby-vehicles" element={<NearbyVehicles />} />
        <Route path="search-location" element={<LocationSearchPage />} />
        <Route path="requests" element={<RequestList />} />
        <Route path="request/:id" element={<RequestDetails />} />
        <Route path="vendor/:id" element={<VendorProfile />} />
        <Route path="chats" element={<ChatList />} />
        <Route path="chat/:requestId/:vendorId" element={<ChatPage />} />
        <Route path="finalize/:requestId/:vendorId" element={<FinalizePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="payments" element={<PaymentMethods />} />
        <Route path="addresses" element={<SavedAddresses />} />
        <Route path="vendors" element={<FavoriteVendors />} />
        <Route path="alerts" element={<NotificationSettings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="support" element={<SupportPage />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
