'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
      <div className="min-h-screen bg-[#f8f4eb]">
        <LoadingSpinner
          size="lg"
          containerClassName="flex justify-center items-center min-h-screen"
        />
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
    <div className="min-h-screen bg-[#f8f4eb]">
      <Sidebar />
      <main className="pl-64">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </main>
    </div>
  );
}
