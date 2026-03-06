'use client';

import { useRef } from 'react';

type InteractiveCardProps = {
  imageSrc?: string;
  patternSrc?: string;
  brightness?: number;
  contrast?: number;
  borderRadius?: number;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

/**
 * InteractiveCard — CSS-based interactive wrapper with hover/press effects.
 *
 * Previously used a global WebGL overlay for halftone shader effects on hover.
 * Now simplified to CSS transitions — the 3D dot-matrix artwork lives inside
 * each card via CardScene (per-card Canvas, matching Base website pattern).
 */
export function InteractiveCard({
  borderRadius = 24,
  className,
  children,
  onClick,
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98] ${className ?? ''}`}
      style={{ borderRadius, position: 'relative' }}
    >
      {children}
    </div>
  );
}
