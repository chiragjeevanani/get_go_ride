import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { useAdminTheme } from '../../hooks/useAdminTheme';
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const [isCollapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useAdminTheme();

  const token = localStorage.getItem('gtgl_token');
  let isAdmin = false;
  try {
    const user = JSON.parse(localStorage.getItem('gtgl_user') || '{}');
    isAdmin = user && user.role === 'admin';
  } catch (e) {
    isAdmin = false;
  }

  if (!token || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className={cn(
      "flex h-screen overflow-hidden admin-theme transition-colors duration-500",
      theme === "dark" ? "dark bg-zinc-950 text-white" : "light bg-white text-black"
    )}>
      {/* Sidebar Navigation */}
      <Sidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Navigation */}
        <TopHeader theme={theme} toggleTheme={toggleTheme} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 admin-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
