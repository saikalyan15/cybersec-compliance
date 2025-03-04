'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (
      status === 'authenticated' &&
      session?.user?.passwordResetRequired &&
      pathname !== '/dashboard/change-password'
    ) {
      router.push('/dashboard/change-password');
    }
  }, [status, session, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f4eb]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (
    session?.user?.passwordResetRequired &&
    pathname !== '/dashboard/change-password'
  ) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f4eb]">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
