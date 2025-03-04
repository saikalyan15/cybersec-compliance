'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Globe,
  Network,
  FileText,
  Users,
  LogOut,
  Shield,
  Key,
  ListChecks,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/app/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Get user role directly from the session
  const userRole = session?.user?.role;

  // Debug log
  console.log('Sidebar - Session:', session);
  console.log('Sidebar - User Role:', userRole);
  console.log('Current pathname:', pathname);

  // Check if user has admin role
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      href: '/dashboard/assessment',
      label: 'Assessment',
      icon: ClipboardCheck,
      adminOnly: false,
    },
    {
      href: '/dashboard/admin/domains',
      label: 'Domains',
      icon: Globe,
      adminOnly: true,
    },
    {
      href: '/dashboard/admin/subdomains',
      label: 'Sub Domains',
      icon: Network,
      adminOnly: true,
    },
    {
      href: '/dashboard/admin/controls',
      label: 'Controls',
      icon: ListChecks,
      adminOnly: true,
    },
    {
      href: '/dashboard/reports',
      label: 'Reports',
      icon: FileText,
      adminOnly: false,
    },
    {
      href: '/dashboard/admin/users',
      label: 'Users',
      icon: Users,
      adminOnly: true,
    },
    {
      href: '/dashboard/change-password',
      label: 'Change Password',
      icon: Key,
      adminOnly: false,
    },
  ];

  // Improved active state detection that works with nested paths
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return pathname?.startsWith(path) && path !== '/dashboard';
  };

  return (
    <aside className="bg-[#0f2744] text-white w-64 min-h-screen p-4 shadow-lg">
      <div className="flex items-center justify-center mb-8 pt-4">
        <div className="bg-[#e6c78b] p-3 rounded-lg shadow-md">
          <Shield size={24} className="text-[#0f2744]" />
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          // Skip admin-only items if user is not admin
          if (item.adminOnly && !isAdmin) {
            return null;
          }

          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md transition-colors',
                active
                  ? 'bg-[#e6c78b] text-[#0f2744] font-medium'
                  : 'text-gray-300 hover:bg-[#1a365d]'
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Show user info for debugging */}
      <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-slate-500">
        <p>Logged in as: {session?.user?.username || 'Unknown'}</p>
        <p>Role: {userRole || 'None'}</p>
        <p>Admin access: {isAdmin ? 'Yes' : 'No'}</p>
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center space-x-3 px-3 py-2 w-full text-left text-gray-300 hover:bg-[#1a365d] rounded-md transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
