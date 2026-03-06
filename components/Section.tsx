'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import classNames from 'classnames';

// Motion variants matching Base website pattern
export const contentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const itemContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

type SectionContent = {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type SectionProps = {
  content: SectionContent;
  children?: ReactNode;
  className?: string;
  dark?: boolean;
};

export function Section({ content, children, className, dark = false }: SectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={contentVariants}
      className={classNames(
        'px-5 py-10',
        dark ? 'bg-illoblack text-white' : 'bg-white text-ios-text',
        className,
      )}
    >
      {/* Section header */}
      <motion.div variants={itemContentVariants} className="mb-8">
        <h2
          className={classNames(
            'font-sans text-[1.75rem] leading-[110%] font-medium tracking-[-0.05rem] mb-3',
            dark ? 'text-white' : 'text-ios-text',
          )}
        >
          {content.title}
        </h2>
        {content.description && (
          <p
            className={classNames(
              'text-base leading-[140%]',
              dark ? 'text-white/60' : 'text-ios-text-secondary',
            )}
          >
            {content.description}
          </p>
        )}
        {content.ctaLabel && (
          <button
            className={classNames(
              'mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans font-medium text-[0.9375rem] transition-all duration-200 active:scale-95',
              dark
                ? 'bg-white text-illoblack hover:bg-white/90'
                : 'bg-ios-blue text-white hover:bg-ios-blue-dark',
            )}
          >
            {content.ctaLabel}
            <span className="inline-block">&#8594;</span>
          </button>
        )}
      </motion.div>

      {/* Section content */}
      <motion.div variants={itemContentVariants}>
        {children}
      </motion.div>
    </motion.section>
  );
}
