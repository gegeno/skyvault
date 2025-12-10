'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Cloud } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      router.replace('/login');
    } else if (data && data.data) {
      setUser(data.data);
    }
  }, [data, isError, router, setUser]);

  if (isLoading) {
    return (
      <div
        className="h-screen w-full flex items-center justify-center bg-background text-foreground"
        role="status"
        aria-live="polite"
        aria-label="Loading application"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="bg-card p-4 rounded-2xl shadow-lg border border-border relative z-10">
              <Cloud className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-sm z-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">SkyVault</h2>
            <p className="text-sm text-muted-foreground animate-pulse">Decrypting your vault...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isError) return null;

  return <>{children}</>;
}
