import React from 'react';
import { 
  Bell, Search, User, Menu, 
  Settings, LogOut, ChevronDown, Shield 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from '../common/ThemeToggle';

export const TopHeader = ({ theme, toggleTheme }) => {
  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 transition-all admin-theme">
      {/* Search Bar Area */}
      <div className="flex-1 max-w-lg group">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Search platform..." 
            className="w-full h-10 pl-11 pr-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-[#09090b] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium"
          />
        </div>
      </div>

      {/* Action Hub */}
      <div className="flex items-center gap-2">
        {/* Theme Toggler */}
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        {/* Alerts */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white dark:hover:bg-zinc-800/50 transition-all relative">
               <Bell className="w-4 h-4" />
               <Badge className="absolute top-2 right-2 w-4 h-4 p-0 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-0 text-[8px] font-bold rounded-full">3</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-[#09090b] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white p-2 rounded-xl mt-2 shadow-2xl">
             <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Recent Alerts</span>
             </div>
             {[1, 2, 0].map(i => (
               <DropdownMenuItem key={i} className="p-3 rounded-lg flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer">
                  <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                     <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-bold leading-none">System Notification</p>
                     <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">New platform event logged</p>
                  </div>
               </DropdownMenuItem>
             ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-2" />

        {/* User Account */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 pr-1 h-11 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 group">
               <div className="flex flex-col items-end text-right hidden md:flex">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white leading-none">Super Admin</span>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Management Hub</span>
               </div>
               <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 shadow-lg shadow-zinc-200 dark:shadow-none group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5 text-white dark:text-zinc-900" />
               </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#09090b] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white p-1 rounded-xl shadow-2xl mt-2">
            <DropdownMenuItem className="p-3 rounded-lg flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer group">
               <div className="w-8 h-8 rounded-md bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white" />
               </div>
               <span className="text-[11px] font-bold uppercase tracking-widest">Global Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 rounded-lg flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer group">
               <div className="w-8 h-8 rounded-md bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white" />
               </div>
               <span className="text-[11px] font-bold uppercase tracking-widest">System Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 my-1" />
            <DropdownMenuItem className="p-3 rounded-lg flex items-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 cursor-pointer font-bold transition-colors">
               <div className="w-8 h-8 rounded-md bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-rose-500" />
               </div>
               <span className="text-[11px] font-bold uppercase tracking-widest">Secure Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
