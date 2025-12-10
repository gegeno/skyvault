'use client';

import { Loader2, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-md"
      role="status"
      aria-label="Loading content"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />

          <div className="bg-card p-4 rounded-2xl shadow-lg border border-border/50 relative z-10">
            <Cloud className="h-10 w-10 text-primary" />
          </div>

          <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-sm border border-border z-20">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">SkyVault</h2>
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </motion.div>
    </div>
  );
}
