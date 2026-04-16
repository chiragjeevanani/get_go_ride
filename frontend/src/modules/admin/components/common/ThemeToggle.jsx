import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-[1.25rem] bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-primary transition-all overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center w-full h-full"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-primary" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
};
