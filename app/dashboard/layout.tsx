'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      roles: ['user', 'admin', 'owner'],
    },
    {
      name: 'Assessments',
      path: '/dashboard/assessments',
      roles: ['user', 'admin', 'owner'],
    },
    {
      name: 'Reports',
      path: '/dashboard/reports',
      roles: ['user', 'admin', 'owner'],
    },
    { name: 'Admin', path: '/dashboard/admin', roles: ['admin'] },
    {
      name: 'User Management',
      path: '/dashboard/admin/users',
      roles: ['admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(session?.user?.role || 'user')
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800">
        <nav className="mt-5">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block py-2 px-4 text-sm ${
                pathname === item.path
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/"
            className="block py-2 px-4 text-sm text-gray-400 hover:bg-gray-700"
          >
            Logout
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
