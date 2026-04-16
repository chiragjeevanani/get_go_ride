import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Truck, MessageSquare, 
  CreditCard, PieChart, Layers, ShieldCheck, 
  Settings, Bell, ChevronLeft, ChevronRight,
  LogOut, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ]
  },
  {
    label: "Management",
    items: [
      { path: "/admin/users", icon: Users, label: "Users" },
      { path: "/admin/vendors", icon: Truck, label: "Vendors" },
      { path: "/admin/leads", icon: Layers, label: "Leads" },
    ]
  },
  {
    label: "Finance",
    items: [
      { path: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
      { path: "/admin/revenue", icon: PieChart, label: "Revenue" },
    ]
  },
  {
    label: "Platform",
    items: [
      { path: "/admin/categories", icon: Layers, label: "Categories" },
      { path: "/admin/moderation", icon: ShieldCheck, label: "Moderation" },
      { path: "/admin/notifications", icon: Bell, label: "Notifications" },
      { path: "/admin/settings", icon: Settings, label: "Settings" },
    ]
  }
];

export const Sidebar = ({ isCollapsed, setCollapsed }) => {
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out flex flex-col relative z-50 h-screen admin-theme",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Brand Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg admin-logo-accent flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
             <Shield className="w-5 h-5 text-zinc-950 dark:text-zinc-900" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight leading-none">Safar Setto</span>
              <span className="text-[10px] font-bold admin-logo-text uppercase tracking-widest mt-1">Admin Panel</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto admin-scrollbar py-6 px-3 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h5 className="px-4 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 opacity-70">{group.label}</h5>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group relative",
                      isActive 
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 transition-transform group-hover:scale-110",
                      isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white"
                    )} strokeWidth={isActive ? 2.5 : 2} />
                    
                    {!isCollapsed && (
                      <span className="text-[11px] font-medium uppercase tracking-wide">{item.label}</span>
                    )}

                    {isActive && (
                      <div className="admin-nav-indicator" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile */}
      {!isCollapsed && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
          <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
             <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase truncate">Super Admin</span>
                <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 uppercase truncate tracking-tight">admin@safar.com</span>
             </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-xl z-50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
};
