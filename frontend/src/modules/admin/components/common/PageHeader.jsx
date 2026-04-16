import React from 'react';
import { motion } from 'framer-motion';

export const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 font-medium mt-1 uppercase tracking-widest">{subtitle}</p>}
      </motion.div>
      
      {actions && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
};
