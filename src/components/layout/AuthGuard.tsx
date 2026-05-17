'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  // Track whether we have completed the initial client-side hydration check.
  // On SSR, localStorage is unavailable, so we wait for mount before deciding.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // During SSR / first paint render nothing to avoid a flash of protected content.
  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    // Redirect is in-flight; render nothing while navigating.
    return null;
  }

  return <>{children}</>;
}
