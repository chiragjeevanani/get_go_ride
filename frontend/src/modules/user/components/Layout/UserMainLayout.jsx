import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Package, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const UserMainLayout = () => {
  const location = useLocation();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: "Home", path: "/user/dashboard" },
    { icon: <Package className="w-5 h-5" />, label: "Requests", path: "/user/requests" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Chats", path: "/user/chats" },
    { icon: <User className="w-5 h-5" />, label: "Profile", path: "/user/profile" },
  ];

  const hideNavPaths = ["post-requirement", "chat/", "finalize", "vendor", "request/", "payments", "addresses", "support"];
  const shouldHideNav = hideNavPaths.some(path => location.pathname.includes(path));

  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-white text-black font-sans",
      !shouldHideNav ? "pb-24" : "pb-0"
    )}>
      <main className="flex-1 w-full max-w-md mx-auto relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={location.pathname.split('/')[2] || 'home'}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="p-4"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation for Mobile-First experience */}
      {!shouldHideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-zinc-100 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2.5rem] max-w-md mx-auto h-20 px-4">
          <div className="flex justify-around items-center h-full gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path.split('/').pop());
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex-1 flex flex-col items-center justify-center relative h-[70%] transition-all duration-300 group"
                >
                  {/* Subtle highlight behind the active tab */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-primary rounded-2xl z-0 shadow-lg shadow-primary/20"
                      initial={false}
                      transition={{ 
                         type: "spring", 
                         stiffness: 380, 
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
                      "text-[9px] font-black uppercase tracking-tighter transition-all duration-300",
                      isActive ? "text-black" : "text-zinc-400"
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

export default UserMainLayout;
