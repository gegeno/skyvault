'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-md mx-auto"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mx-auto bg-muted/50 p-6 rounded-full w-fit ring-1 ring-border shadow-sm"
        >
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold tracking-tighter text-primary/20 select-none">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            The page or file you are looking for might have been moved, deleted, or possibly never
            existed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild size="lg" className="gap-2">
            <Link href="/drive">
              <Home className="h-4 w-4" />
              Return to Drive
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </motion.div>
      <footer className="absolute bottom-6 text-xs text-muted-foreground/50">
        SkyVault Secure Storage
      </footer>
    </div>
  );
}
