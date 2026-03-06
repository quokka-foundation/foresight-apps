'use client';

import { motion } from 'framer-motion';
import classNames from 'classnames';
import { levelStyles, TitleLevel } from '@/components/Typography';

const animationConfig = {
  initial: { color: '#9CA3AF', opacity: 0.6 },
  whileInView: { color: 'inherit', opacity: 1 },
  viewport: { once: true, amount: 0.3 },
};

const easeFn = [0.4, 0, 0.2, 1] as const;

const getTransition = (delay: number, index: number) => ({
  duration: 0.4,
  delay: delay + index * 0.05,
  ease: easeFn,
});

const getColumnTransition = (delay: number, index: number) => ({
  duration: 0.8,
  delay: delay + index * 0.1,
  ease: easeFn,
});

const isFixedChar = (char: string) => /[.,\s\-$<>+%]/.test(char);

// Deterministic character generation (no Math.random)
const generateRandomChars = (targetChar: string, index: number) => {
  const isNumeric = /[0-9]/.test(targetChar);
  const isAlpha = /[A-Z]/i.test(targetChar);

  let chars: string;
  if (isNumeric) {
    chars = '0123456789';
  } else if (isAlpha) {
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  } else {
    chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }

  return [chars[(index * 7) % chars.length], chars[(index * 11 + 3) % chars.length]];
};

type AnimatedTextProps = {
  text: string;
  titleLevel?: TitleLevel;
  className?: string;
  delay?: number;
};

export function AnimatedText({
  text,
  titleLevel = TitleLevel.H4Mono,
  className = '',
  delay = 0,
}: AnimatedTextProps) {
  const characters = text.split('').map((char, index) => {
    const baseId = `${text}_${char === ' ' ? 'space' : char}_${index}`;

    if (isFixedChar(char)) {
      return { actualChar: char, isFixed: true, id: baseId };
    }

    const randomChars = generateRandomChars(char, index);
    return {
      actualChar: char,
      isFixed: false,
      column: [
        { char: randomChars[0], id: `${baseId}_0` },
        { char: randomChars[1], id: `${baseId}_1` },
        { char, id: `${baseId}_2` },
      ],
      id: baseId,
    };
  });

  const titleClass = levelStyles[titleLevel] ?? '';
  const charHeight = titleLevel === TitleLevel.H4Mono ? '1.4em' : '1.2em';
  const slideDistance = titleLevel === TitleLevel.H4Mono ? '-2.8em' : '-2.4em';

  const containerStyle = { height: charHeight, lineHeight: charHeight };
  const charStyle = {
    height: charHeight,
    lineHeight: charHeight,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
  const initialAnimation = { y: 0 };
  const finalAnimation = { y: slideDistance };
  const viewportConfig = { once: true, amount: 0.3 };

  return (
    <div className={classNames('inline-flex', className)}>
      {characters.map((charData, index) => {
        if (charData.isFixed) {
          return (
            <motion.span
              key={charData.id}
              initial={animationConfig.initial}
              whileInView={animationConfig.whileInView}
              viewport={animationConfig.viewport}
              transition={getTransition(delay + index * 0.1, 0)}
              className={titleClass}
              style={charStyle}
            >
              {charData.actualChar === ' ' ? '\u00A0' : charData.actualChar}
            </motion.span>
          );
        }

        const { column, id } = charData;
        if (!column) return null;
        return (
          <div
            key={id}
            className={classNames('relative overflow-hidden', titleClass)}
            style={containerStyle}
          >
            <motion.div
              initial={initialAnimation}
              whileInView={finalAnimation}
              viewport={viewportConfig}
              transition={getColumnTransition(delay, index)}
              className="flex flex-col"
            >
              {column.map((charObj, charIndex) => {
                const isFinalChar = charIndex === 2;
                return (
                  <motion.span
                    key={charObj.id}
                    initial={isFinalChar ? { opacity: 1 } : animationConfig.initial}
                    whileInView={isFinalChar ? { opacity: 1 } : animationConfig.whileInView}
                    viewport={animationConfig.viewport}
                    transition={getTransition(delay + index * 0.1, charIndex)}
                    className={classNames(titleClass, 'block')}
                    style={charStyle}
                  >
                    {charObj.char === ' ' ? '\u00A0' : charObj.char}
                  </motion.span>
                );
              })}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
