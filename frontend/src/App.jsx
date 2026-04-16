import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserRoutes from "./modules/user/routes/UserRoutes";
import DriverRoutes from "./modules/driver/routes/DriverRoutes";
import AdminRoutes from "./modules/admin/routes/AdminRoutes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user/*" element={<UserRoutes />} />
        <Route path="/driver/*" element={<DriverRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        {/* Redirect root to user module for now as per task scope */}
        <Route path="/" element={<Navigate to="/user" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
