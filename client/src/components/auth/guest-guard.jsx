'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useUserStore } from '@/store/user-store';

export default function GuestGuard({ children }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    retry: false,
    enabled: !user,
  });

  const isAuthenticated = !!user || !!data?.data;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/drive');
    }
  }, [isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div
        className="h-screen w-full flex items-center justify-center bg-background"
        role="status"
        aria-label="Checking session"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="sr-only">Redirecting to dashboard...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
