import React from 'react';
import { motion } from 'framer-motion';

export const ChartCard = ({ title, subtitle, children, actions }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-card p-6"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <h3 className="text-[13px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest">{title}</h3>
          {subtitle && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-[0.1em]">{subtitle}</p>}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      <div className="h-[280px] w-full">
        {children}
      </div>
    </motion.div>
  );
};
