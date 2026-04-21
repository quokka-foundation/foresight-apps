"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  options: string[];
  active: string;
  onSelect: (value: string) => void;
  className?: string;
}

export function FilterChips({ options, active, onSelect, className }: FilterChipsProps) {
  return (
    <div className={cn("flex overflow-x-auto no-scrollbar gap-1.5 px-4 py-2.5", className)}>
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(opt)}
            className={cn(
              "flex-shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-[0.75rem] font-medium tracking-[-0.01em] transition-all duration-200",
              isActive
                ? "bg-ios-blue text-white shadow-blue-glow"
                : "bg-ios-bg-secondary text-ios-text-secondary border border-ios-card-border hover:border-ios-card-border-light hover:text-ios-text",
            )}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}
