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
import UpcomingGigDriver from "../pages/UpcomingGigDriver";
import BankDetailsPage from "../pages/BankDetailsPage";
import WithdrawalPage from "../pages/WithdrawalPage";
import UpcomingGigsList from "../pages/UpcomingGigsList";
import GigHistory from "../pages/GigHistory";

const DriverRoutes = () => {
  return (
    <div className="mobile-app-shell min-h-screen bg-white">
      <Routes>
        <Route path="auth" element={<DriverAuthPage />} />
        <Route path="subscribe" element={<SubscriptionGate />} />
        <Route path="profile" element={<DriverProfile />} />
        <Route path="earnings" element={<EarningsWallet />} />
        <Route path="history" element={<GigHistory />} />

        <Route element={<DriverMainLayout />}>
          <Route index element={<DriverDashboard />} />
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="leads" element={<LeadsScreen />} />
          <Route path="leads/:id" element={<LeadDetails />} />
          <Route path="chats" element={<ChatListPage />} />
          <Route path="chat/:id" element={<DriverChatPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="subscription" element={<SubscriptionManagement />} />
          <Route path="profile/vehicle" element={<VehicleDetails />} />
          <Route path="profile/pricing" element={<PricingAndAreas />} />
          <Route path="profile/alerts" element={<NotificationAlerts />} />
          <Route path="profile/security" element={<AccountSecurity />} />
          <Route path="profile/support" element={<HelpSupport />} />
          <Route path="checkout/:id" element={<CheckoutPage />} />
          <Route path="gigs" element={<UpcomingGigsList />} />
          <Route path="gig/:bidId" element={<UpcomingGigDriver />} />
          <Route path="bank-details" element={<BankDetailsPage />} />
          <Route path="withdraw" element={<WithdrawalPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default DriverRoutes;
