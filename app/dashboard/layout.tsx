'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Assessments', path: '/dashboard/assessments' },
    { name: 'Reports', path: '/dashboard/reports' },
    { name: 'Admin', path: '/dashboard/admin' },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800">
        <nav className="mt-5">
          {menuItems.map((item) => (
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
