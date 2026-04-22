import { Routes, Route } from "react-router-dom";
import DriverMainLayout from "../components/Layout/DriverMainLayout";
import DriverAuthPage from "../pages/DriverAuthPage";
import SubscriptionGate from "../pages/SubscriptionGate";
import DriverDashboard from "../pages/DriverDashboard";
import LeadsScreen from "../pages/LeadsScreen";
import LeadDetails from "../pages/LeadDetails";
import DriverChatPage from "../pages/DriverChatPage";
import ChatListPage from "../pages/ChatListPage";
import DriverProfile from "../pages/DriverProfile";
import SubscriptionManagement from "../pages/SubscriptionManagement";
import AnalyticsPage from "../pages/AnalyticsPage";
import VehicleDetails from "../pages/VehicleDetails";
import PricingAndAreas from "../pages/PricingAndAreas";
import NotificationAlerts from "../pages/NotificationAlerts";
import AccountSecurity from "../pages/AccountSecurity";
import HelpSupport from "../pages/HelpSupport";
import CheckoutPage from "../pages/CheckoutPage";
import EarningsWallet from "../pages/EarningsWallet";

const DriverRoutes = () => {
  return (
    <Routes>
      <Route path="auth" element={<DriverAuthPage />} />
      <Route path="subscribe" element={<SubscriptionGate />} />

      <Route element={<DriverMainLayout />}>
        <Route index element={<DriverDashboard />} />
        <Route path="dashboard" element={<DriverDashboard />} />
        <Route path="leads" element={<LeadsScreen />} />
        <Route path="leads/:id" element={<LeadDetails />} />
        <Route path="chats" element={<ChatListPage />} />
        <Route path="chat/:id" element={<DriverChatPage />} />
        <Route path="profile" element={<DriverProfile />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="subscription" element={<SubscriptionManagement />} />
        <Route path="profile/vehicle" element={<VehicleDetails />} />
        <Route path="profile/pricing" element={<PricingAndAreas />} />
        <Route path="profile/alerts" element={<NotificationAlerts />} />
        <Route path="profile/security" element={<AccountSecurity />} />
        <Route path="profile/support" element={<HelpSupport />} />
        <Route path="checkout/:id" element={<CheckoutPage />} />
        <Route path="earnings" element={<EarningsWallet />} />
      </Route>
    </Routes>
  );
};

export default DriverRoutes;
