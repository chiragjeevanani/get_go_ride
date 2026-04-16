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
                    "w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl relative overflow-hidden pointer-events-auto",
                    sizes[size]
                  )}
                >
                  {/* Header */}
                  <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <Dialog.Title className="text-2xl font-black text-white uppercase tracking-tight">
                        {title}
                      </Dialog.Title>
                      {description && (
                        <Dialog.Description className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    
                    <Dialog.Close className="p-2 rounded-xl bg-zinc-950/50 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all">
                      <X className="w-5 h-5 text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                    </Dialog.Close>
                  </div>

                  {/* Body */}
                  <div className="px-8 pb-8 pt-2 overflow-y-auto max-h-[80vh] admin-scrollbar">
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
