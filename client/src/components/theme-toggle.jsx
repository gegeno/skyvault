'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg border-border bg-background/80 backdrop-blur-sm z-50 hover:bg-accent hover:shadow-xl transition-all"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun-icon"
            initial={{ opacity: 0, rotate: -90, scale: 0 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-6 w-6 text-yellow-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon-icon"
            initial={{ opacity: 0, rotate: 90, scale: 0 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-6 w-6 text-slate-700 dark:text-slate-400" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
