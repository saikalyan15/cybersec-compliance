'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === 'admin' || session?.user?.role === 'owner';

  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Assessment', href: '/dashboard/assessment' },
    { name: 'Reports', href: '/dashboard/reports' },
  ];

  const adminNavigation = [
    { name: 'Users', href: '/dashboard/users' },
    { name: 'Main Domains', href: '/dashboard/admin/domains' },
    { name: 'Sub Domains', href: '/dashboard/admin/subdomains' },
  ];

  const navigation = isAdmin
    ? [...baseNavigation, ...adminNavigation]
    : baseNavigation;

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <nav className="mt-8">
        <div className="space-y-2">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`block px-4 py-2 rounded-md ${
                pathname === item.href
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
