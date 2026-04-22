import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

export const Toast = ({ show, message, type = 'success', onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] min-w-[300px]"
        >
          <div className={cn(
            "p-4 rounded-2xl border shadow-2xl flex items-center gap-3",
            type === 'success' ? "bg-white border-emerald-100 text-emerald-600" : 
            type === 'error' ? "bg-white border-rose-100 text-rose-600" : 
            "bg-white border-zinc-100 text-zinc-600"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
              type === 'success' ? "bg-emerald-50" : 
              type === 'error' ? "bg-rose-50" : 
              "bg-zinc-50"
            )}>
              {type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {type === 'error' && <XCircle className="w-5 h-5" />}
              {type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                {type === 'success' ? 'Action Completed' : type === 'error' ? 'Action Rejected' : 'Notification'}
              </p>
              <p className="text-xs font-bold text-zinc-900">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
