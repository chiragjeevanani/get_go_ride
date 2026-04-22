import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from "@/lib/utils";

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  size = 'md' 
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
              />
            </Dialog.Overlay>
            
            <Dialog.Content asChild>
              <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                  className={cn(
                    "w-full bg-white border border-zinc-200 rounded-3xl shadow-2xl relative overflow-hidden pointer-events-auto",
                    sizes[size]
                  )}
                >
                  {/* Header */}
                  <div className="px-6 pt-6 pb-2 flex justify-between items-start">
                    <div className="space-y-1">
                      <Dialog.Title className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                        {title}
                      </Dialog.Title>
                      {description && (
                        <Dialog.Description className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    
                    <Dialog.Close className="p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all cursor-pointer">
                      <X className="w-4 h-4" />
                    </Dialog.Close>
                  </div>

                  {/* Body */}
                  <div className="px-6 pb-6 pt-2 overflow-y-auto max-h-[85vh] admin-scrollbar">
                    {children}
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
};
