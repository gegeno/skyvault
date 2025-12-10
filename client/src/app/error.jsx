'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden"
      role="alert"
      aria-live="assertive"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [-10, 10, -10, 10, 0] }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto bg-destructive/10 p-6 rounded-full w-fit ring-1 ring-destructive/20 shadow-sm"
        >
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Something went wrong!</h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error while processing your request. Our team has been
            notified.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs font-mono text-left overflow-auto max-h-32 border">
              {error.message || 'Unknown error'}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button onClick={() => reset()} size="lg" className="gap-2 shadow-md">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => (window.location.href = '/')}
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </motion.div>
      <footer className="absolute bottom-6 text-xs text-muted-foreground/50">
        Error Code: 500
      </footer>
    </div>
  );
}
