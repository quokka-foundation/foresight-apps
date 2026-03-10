"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export function AnimatedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className,
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl font-sans font-medium transition-colors",
        size === "sm" && "px-3 py-1.5 text-[0.75rem]",
        size === "md" && "px-4 py-2.5 text-[0.875rem]",
        size === "lg" && "px-6 py-3.5 text-[1rem] w-full",
        variant === "primary" && "bg-ios-blue text-white hover:bg-ios-blue/90",
        variant === "secondary" && "bg-ios-card text-white hover:bg-ios-card/90",
        variant === "outline" &&
          "bg-transparent border border-ios-separator text-ios-text hover:bg-ios-bg-secondary",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
