"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TabId } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: { id: TabId; label: string; href: string; icon: React.ReactNode }[] = [
  {
    id: "feed",
    label: "Feed",
    href: "/",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 11a9 9 0 0 1 9 9" />
        <path d="M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1" />
      </svg>
    ),
  },
  {
    id: "wallets",
    label: "Wallets",
    href: "/wallets",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  },
  {
    id: "tokens",
    label: "Tokens",
    href: "/tokens",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M6 12h12" />
      </svg>
    ),
  },
  {
    id: "alerts",
    label: "Alerts",
    href: "/alerts",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();

  const getActiveTab = (): TabId => {
    if (pathname.startsWith("/wallets") || pathname.startsWith("/wallet/")) return "wallets";
    if (pathname.startsWith("/tokens") || pathname.startsWith("/token/")) return "tokens";
    if (pathname.startsWith("/alerts")) return "alerts";
    if (pathname.startsWith("/profile")) return "profile";
    return "feed";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-ios-separator safe-area-bottom">
      <div className="flex items-center justify-around max-w-[430px] mx-auto h-14">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 p-2 transition-all duration-200",
                isActive ? "text-ios-blue" : "text-ios-text-tertiary hover:text-ios-text-secondary",
              )}
              aria-label={tab.label}
            >
              <div>{tab.icon}</div>
              <span className="text-[0.625rem] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
