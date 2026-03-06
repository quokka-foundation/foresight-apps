'use client';

import type { SafeAreaInsets } from '@/lib/types';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  insets?: SafeAreaInsets;
  className?: string;
}

export function SafeAreaContainer({
  children,
  insets,
  className = '',
}: SafeAreaContainerProps) {
  return (
    <main
      className={`flex flex-col min-h-screen max-w-[430px] mx-auto bg-ios-bg ${className}`}
      style={{
        paddingTop: insets?.top ?? 0,
        paddingBottom: insets?.bottom ?? 0,
        paddingLeft: insets?.left ?? 0,
        paddingRight: insets?.right ?? 0,
      }}
    >
      {children}
    </main>
  );
}
