'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, User, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <header className="bg-[#1a365d] text-white border-b border-[#2d4a77] z-10 shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* App Title */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-white">
              Cybersec Compliance
            </h1>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 text-[#e6c78b] hover:text-white rounded-full hover:bg-[#2d4a77] transition-colors">
              <Bell size={20} />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 text-sm text-white hover:text-[#e6c78b] transition-colors"
              >
                <div className="bg-[#e6c78b] text-[#1a365d] p-2 rounded-full">
                  <User size={18} />
                </div>
                <span className="hidden md:inline-block font-medium">
                  {session?.user?.firstName ||
                    session?.user?.username ||
                    'User'}
                </span>
                <ChevronDown size={16} className="text-[#e6c78b]" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-[#e6c78b]"
                  onBlur={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 text-sm text-[#1a365d] border-b border-gray-100">
                    <p className="font-medium">
                      {session?.user?.firstName} {session?.user?.lastName}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {session?.user?.email}
                    </p>
                    <p className="text-gray-600 text-xs mt-1 capitalize">
                      {session?.user?.role}
                    </p>
                  </div>

                  <a
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-[#1a365d] hover:bg-[#f8f4eb] transition-colors"
                  >
                    Profile Settings
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
