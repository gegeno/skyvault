'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from './ui/sonner';
import { ThemeProvider } from './theme-provider';
import ThemeToggle from './theme-toggle';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ThemeToggle />
        </ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
