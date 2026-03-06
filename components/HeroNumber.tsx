'use client';

import { motion } from 'framer-motion';

interface HeroNumberProps {
  value: string;
  label?: string;
  sublabel?: string;
  size?: 'md' | 'lg' | 'xl' | 'xxl';
  color?: 'default' | 'green' | 'blue' | 'red' | 'white';
  mono?: boolean;
  animate?: boolean;
}

const sizeMap = {
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
  xxl: 'text-6xl',
};

const colorMap = {
  default: 'text-ios-text',
  white: 'text-white',
  green: 'text-ios-green',
  blue: 'text-ios-blue',
  red: 'text-ios-red',
};

export function HeroNumber({
  value,
  label,
  sublabel,
  size = 'xl',
  color = 'default',
  mono = true,
  animate = true,
}: HeroNumberProps) {
  const Wrapper = animate ? motion.div : 'div';
  const animProps = animate
    ? { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 } }
    : {};

  return (
    <Wrapper className="text-center" {...animProps}>
      {label && (
        <p className="text-sm font-medium text-ios-text-secondary mb-1">{label}</p>
      )}
      <p className={`${sizeMap[size]} font-extrabold ${colorMap[color]} ${mono ? 'font-mono' : ''} tracking-tighter leading-none`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-sm text-ios-text-secondary mt-1.5">{sublabel}</p>
      )}
    </Wrapper>
  );
}
