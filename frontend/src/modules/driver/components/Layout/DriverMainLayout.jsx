import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Zap, MessageSquare, User, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const DriverMainLayout = () => {
  const location = useLocation();

  const navItems = [
    { icon: <Home className="w-[18px] h-[18px]" strokeWidth={2.5} />, label: "Home", path: "/driver/dashboard" },
    { icon: <Zap className="w-[18px] h-[18px]" strokeWidth={2.5} />, label: "Leads", path: "/driver/leads" },
    { icon: <MessageSquare className="w-[18px] h-[18px]" strokeWidth={2.5} />, label: "Chats", path: "/driver/chats" },
    { icon: <BarChart2 className="w-[18px] h-[18px]" strokeWidth={2.5} />, label: "Stats", path: "/driver/analytics" },
    { icon: <User className="w-[18px] h-[18px]" strokeWidth={2.5} />, label: "Profile", path: "/driver/profile" },
  ];

  const hideNavPaths = ["auth", "subscribe", "leads/", "chat/"];
  const shouldHideNav = hideNavPaths.some(path => location.pathname.includes(path));

  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-white text-black font-sans",
      !shouldHideNav ? "pb-20" : "pb-0"
    )}>
      <main className="flex-1 w-full max-w-md mx-auto relative overflow-hidden px-4 pb-4">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile-First experience */}
      {!shouldHideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-zinc-100 safe-area-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.06)] rounded-t-3xl max-w-md mx-auto h-16 px-6">
          <div className="flex justify-around items-center h-full gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path.split('/').pop());
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex-1 flex flex-col items-center justify-center relative h-[80%] transition-all duration-300 group rounded-2xl"
                >
                  {/* Square highlight behind the active tab */}
                  {isActive && (
                    <motion.div
                      layoutId="driverActiveTabPill"
                      className="absolute inset-x-0.5 inset-y-0.5 bg-primary rounded-xl z-0 shadow-[0_4px_12px_rgba(255,214,0,0.4)]"
                      initial={false}
                      transition={{ 
                         type: "spring", 
                         stiffness: 450, 
                         damping: 30 
                      }}
                    />
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                    <motion.div
                      animate={{ 
                        scale: isActive ? 1.2 : 1,
                        y: isActive ? -1 : 0 
                      }}
                      className={cn(
                        "transition-colors duration-300",
                        isActive ? "text-black" : "text-zinc-400 group-hover:text-zinc-600"
                      )}
                    >
                      {item.icon}
                    </motion.div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.05em] transition-all duration-300",
                      isActive ? "text-black scale-105" : "text-zinc-400"
                    )}>
                      {item.label}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default DriverMainLayout;
