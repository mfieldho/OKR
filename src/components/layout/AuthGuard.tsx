'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.replace('/');
    }
  }, [isAuthenticated, pathname, router]);

  // Login page: full-screen, no sidebar
  if (!isAuthenticated) {
    return <div className="flex-1">{children}</div>;
  }

  // Authenticated: sidebar + main content
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {children}
      </div>
    </>
  );
}
