"use client";

import { cn } from "@/lib/utils";
import { BackArrow } from "./BackArrow";

interface TopBarProps {
  title: string;
  back?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, back, action, className }: TopBarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-40 glass px-4 py-3 flex items-center justify-between border-b border-ios-separator",
        className,
      )}
    >
      <div className="w-8">{back && <BackArrow onClick={back} />}</div>
      <h5 className="font-sans text-[1rem] font-medium leading-[120%] text-ios-text">{title}</h5>
      <div className="w-8 flex justify-end">{action}</div>
    </div>
  );
}
