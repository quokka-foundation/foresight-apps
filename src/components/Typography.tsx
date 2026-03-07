'use client';

import { type ReactNode, type ElementType } from 'react';
import classNames from 'classnames';

// Title levels matching Base website typography system
export enum TitleLevel {
  H0Medium = 'h0-medium',
  H1Medium = 'h1-medium',
  H1Regular = 'h1-regular',
  H2Medium = 'h2-medium',
  H2Regular = 'h2-regular',
  H3Medium = 'h3-medium',
  H3Regular = 'h3-regular',
  H4Regular = 'h4-regular',
  H4Mono = 'h4-mono',
  H4MonoSmall = 'h4-mono-small',
  H5Medium = 'h5-medium',
  H5Regular = 'h5-regular',
  H6Regular = 'h6-regular',
  H6Mono = 'h6-mono',
}

const defaultTags: Record<TitleLevel, ElementType> = {
  [TitleLevel.H0Medium]: 'h1',
  [TitleLevel.H1Medium]: 'h1',
  [TitleLevel.H1Regular]: 'h1',
  [TitleLevel.H2Medium]: 'h2',
  [TitleLevel.H2Regular]: 'h2',
  [TitleLevel.H3Medium]: 'h3',
  [TitleLevel.H3Regular]: 'h3',
  [TitleLevel.H4Regular]: 'h4',
  [TitleLevel.H4Mono]: 'h4',
  [TitleLevel.H4MonoSmall]: 'h4',
  [TitleLevel.H5Medium]: 'h5',
  [TitleLevel.H5Regular]: 'h5',
  [TitleLevel.H6Regular]: 'h6',
  [TitleLevel.H6Mono]: 'h6',
};

export const levelStyles: Record<TitleLevel, string> = {
  [TitleLevel.H0Medium]:
    'font-sans text-[3.5rem] leading-[100%] tracking-[-0.175rem]',
  [TitleLevel.H1Medium]:
    'font-sans text-[2.5rem] leading-[100%] font-medium tracking-[-0.125rem]',
  [TitleLevel.H1Regular]:
    'font-sans text-[2.25rem] leading-[110%] tracking-[-0.0625rem]',
  [TitleLevel.H2Medium]:
    'font-sans text-[1.5rem] leading-[110%] font-medium tracking-[-0.03125rem]',
  [TitleLevel.H2Regular]:
    'font-sans text-[1.5rem] leading-[110%] tracking-[-0.03125rem]',
  [TitleLevel.H3Medium]:
    'font-sans text-[2rem] leading-[100%] tracking-[-0.08rem] font-medium',
  [TitleLevel.H3Regular]:
    'font-sans text-[2rem] leading-[100%] tracking-[-0.08rem]',
  [TitleLevel.H4Regular]:
    'font-sans text-[1.75rem] leading-[110%] tracking-[-0.09rem]',
  [TitleLevel.H4Mono]:
    'font-mono text-[1.75rem] leading-[110%] tracking-[-0.09rem] font-light',
  [TitleLevel.H4MonoSmall]:
    'font-mono text-[1.25rem] leading-[105%] tracking-[-0.04rem] font-light',
  [TitleLevel.H5Medium]:
    'font-sans text-[1.25rem] leading-[105%] tracking-[-0.04rem] font-medium',
  [TitleLevel.H5Regular]:
    'font-sans text-[1.25rem] leading-[105%] tracking-[-0.04rem]',
  [TitleLevel.H6Regular]:
    'font-sans text-[1rem] leading-[120%] tracking-[-0.025rem]',
  [TitleLevel.H6Mono]:
    'font-mono text-[1rem] leading-[120%] tracking-[-0.025rem] font-light',
};

type TitleProps = {
  children: ReactNode;
  level?: TitleLevel;
  as?: ElementType;
  className?: string;
};

export default function Title({
  level = TitleLevel.H2Medium,
  children,
  as,
  className,
}: TitleProps) {
  const Tag = (as ?? defaultTags[level]) as any;
  const titleClasses = classNames('text-currentColor text-balance', levelStyles[level], className);
  return <Tag className={titleClasses}>{children}</Tag>;
}

// Text variants for body text
export enum TextVariant {
  Body = 'body',
  BodyLarge = 'BodyLarge',
  BodyMono = 'body-mono',
  CTALabel = 'cta-label',
  CTALabelSm = 'cta-label-sm',
  Caption = 'caption',
  CaptionMono = 'caption-mono',
}

const textDefaultTags: Record<TextVariant, ElementType> = {
  [TextVariant.Body]: 'p',
  [TextVariant.BodyLarge]: 'p',
  [TextVariant.BodyMono]: 'p',
  [TextVariant.CTALabel]: 'span',
  [TextVariant.CTALabelSm]: 'span',
  [TextVariant.Caption]: 'span',
  [TextVariant.CaptionMono]: 'span',
};

export const variantStyles: Record<TextVariant, string> = {
  [TextVariant.BodyLarge]: 'font-sans text-[1.125rem] leading-[130%] tracking-[-0.015625rem]',
  [TextVariant.Body]: 'font-sans text-[1rem] leading-[130%]',
  [TextVariant.BodyMono]: 'font-mono font-[350] text-[1rem] tracking-[0.0175rem] leading-[100%]',
  [TextVariant.CTALabel]: 'font-sans text-[0.9375rem] font-medium leading-[114%]',
  [TextVariant.CTALabelSm]: 'font-sans text-[0.875rem] font-regular leading-[114%] tracking-[0.01em]',
  [TextVariant.Caption]: 'font-sans text-[0.75rem] leading-[130%]',
  [TextVariant.CaptionMono]: 'font-mono text-[0.6875rem] leading-[140%] uppercase tracking-[0.055rem]',
};

type TextProps = {
  children: ReactNode;
  variant?: TextVariant;
  as?: ElementType;
  className?: string;
};

export function Text({ variant = TextVariant.Body, children, as, className }: TextProps) {
  const Tag = (as ?? textDefaultTags[variant]) as any;
  const textClasses = classNames('text-currentColor text-pretty', variantStyles[variant], className);
  return <Tag className={textClasses}>{children}</Tag>;
}
