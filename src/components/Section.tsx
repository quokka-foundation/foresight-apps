"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, action, children, className }: SectionProps) {
  return (
    <section className={cn("px-4 py-3", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-sans text-[0.75rem] font-medium uppercase tracking-[0.05em] text-ios-text-secondary">
          {title}
        </h3>
        {action && (
          <Link href={action.href} className="text-[0.75rem] font-medium text-ios-blue">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
