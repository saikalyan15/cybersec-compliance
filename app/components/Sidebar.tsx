'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin =
    session?.user?.role === 'admin' || session?.user?.role === 'owner';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Assessment', href: '/dashboard/assessment' },
    { name: 'Reports', href: '/dashboard/reports' },
    ...(isAdmin ? [{ name: 'Users', href: '/dashboard/users' }] : []),
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <nav className="mt-8">
        <div className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-4 py-2 rounded-md ${
                pathname === item.href
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
