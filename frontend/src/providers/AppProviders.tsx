"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as ReduxProvider } from 'react-redux';
import { useState, ReactNode, useEffect } from 'react';
import { store } from '@/store';
import { initializeAuth } from '@/store/slices/authSlice';

/**
 * Redux holds client auth mirror (localStorage sync); TanStack Query owns server state (properties, etc.).
 * Prefer Query for API caches; use Redux only for auth slice patterns that already depend on the store.
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  // Initialize QueryClient to prevent hydration errors across renders
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Keep cached availability data for 1 min
        retry: 1, // Only retry once to avoid spamming the backend
        refetchOnWindowFocus: false, // Don't disrupt animations
      },
    },
  }));

  // Re-hydrate auth state from localStorage securely on mount
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Adds debug panel during dev to watch background data fetches */}
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      </QueryClientProvider>
    </ReduxProvider>
  );
}
