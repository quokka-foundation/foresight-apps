'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { TabId } from '@/lib/types';

const TABS: { id: TabId; label: string; href: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    id: 'portfolio',
    label: 'Predictions',
    href: '/portfolio',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
  },
  {
    id: 'wallet',
    label: 'Wallet',
    href: '/wallet',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  },
  {
    id: 'create',
    label: 'Create',
    href: '/create',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();

  const getActiveTab = (): TabId => {
    if (pathname.startsWith('/portfolio')) return 'portfolio';
    if (pathname.startsWith('/wallet')) return 'wallet';
    if (pathname.startsWith('/create')) return 'create';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-base-gray-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-[430px] mx-auto h-14">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center justify-center p-3 transition-all duration-200 ${
                isActive
                  ? 'text-illoblack'
                  : 'text-base-gray-100 hover:text-base-gray-200'
              }`}
              aria-label={tab.label}
            >
              <div>{tab.icon}</div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
