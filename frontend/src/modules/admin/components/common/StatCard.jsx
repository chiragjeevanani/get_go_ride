import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export const StatCard = ({ title, value, icon: Icon, trend, trendDirection, color = "primary" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="admin-card p-5 relative overflow-hidden group hover:border-zinc-400/50 dark:hover:border-zinc-600/50 transition-all border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-[#18181b]"
      style={{ borderRadius: 'var(--radius-admin)' }}
    >
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white transition-colors group-hover:bg-zinc-900 dark:group-hover:bg-zinc-700 group-hover:text-white">
            <Icon className="w-4.5 h-4.5" strokeWidth={1.5} />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
              trendDirection === 'up' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}>
              {trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </div>
          )}
        </div>

        <div>
           <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1.5">{title}</p>
           <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">{value}</h3>
        </div>
      </div>

      {/* Extremely subtle background icon for texture */}
      <Icon className="absolute -right-2 -bottom-2 w-20 h-20 text-zinc-900 dark:text-white opacity-[0.02] dark:opacity-[0.03] group-hover:opacity-[0.04] dark:group-hover:opacity-[0.05] transition-opacity" />
    </motion.div>
  );
};
