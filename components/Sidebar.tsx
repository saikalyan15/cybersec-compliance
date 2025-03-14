"use client";

import { cn } from "@/app/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Globe,
  Network,
  FileText,
  Users,
  Shield,
  ListChecks,
  CheckSquare,
  Layers,
  Settings,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isAdmin = userRole === "admin" || userRole === "owner";

  const generalNavItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/assessment",
      label: "Assessments",
      icon: ClipboardCheck,
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: FileText,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      href: "/dashboard/admin/domains",
      label: "Main Domains",
      icon: Globe,
    },
    {
      href: "/dashboard/admin/subdomains",
      label: "Sub Domains",
      icon: Network,
    },
    {
      href: "/dashboard/admin/controls",
      label: "Main Controls",
      icon: ListChecks,
    },
    {
      href: "/dashboard/admin/sub-controls",
      label: "Sub Controls",
      icon: CheckSquare,
    },
    {
      href: "/dashboard/admin/levels",
      label: "Levels",
      icon: Layers,
    },
    {
      href: "/dashboard/admin/level-matrix",
      label: "Level Setting",
      icon: Layers,
    },
    {
      href: "/dashboard/admin/level-sub-matrix",
      label: "Level Sub Setting",
      icon: Settings,
    },
    {
      href: "/dashboard/admin/users",
      label: "Users",
      icon: Users,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return pathname?.startsWith(path) && path !== "/dashboard";
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
          active
            ? "bg-[#e6c78b] text-[#0f2744] font-medium"
            : "text-gray-300 hover:bg-[#1a365d]"
        )}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="bg-[#0f2744] text-white w-64 min-h-screen p-4 shadow-lg fixed top-0 left-0 flex flex-col h-screen">
      <div className="flex items-center justify-center mb-8 pt-4">
        <div className="bg-[#e6c78b] p-3 rounded-lg shadow-md">
          <Shield size={24} className="text-[#0f2744]" />
        </div>
      </div>

      <nav className="space-y-6 flex-1 overflow-y-auto">
        {/* General section */}
        <div className="space-y-1">
          {generalNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Admin section */}
        {isAdmin && (
          <div className="space-y-1">
            <div className="px-3 mb-2">
              <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Administration
              </h2>
            </div>
            {adminNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
