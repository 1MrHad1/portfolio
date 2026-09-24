import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  text: string;
  className?: string;
  /** Any word containing *asterisks* is highlighted in the accent colour. */
  accentClassName?: string;
  /** Opacity of not-yet-revealed words. Keep it readable at rest. */
  floor?: number;
}

function Word({
  children,
  range,
  progress,
  accent,
  accentClassName,
  still,
  floor,
}: {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
  accent: boolean;
  accentClassName: string;
  still: boolean;
  floor: number;
}) {
  const opacity = useTransform(progress, range, [floor, 1]);
  return (
    <span className="relative inline-block">
      <motion.span
        style={still ? undefined : { opacity }}
        className={cn('inline-block', accent && accentClassName)}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function ScrollReveal({
  text,
  className,
  accentClassName = 'text-[var(--acc)]',
  floor = 0.42,
}: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const still = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'end 0.55'],
  });

  const words = text.split(' ');

  return (
    <p ref={ref} className={cn('flex flex-wrap', className)}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        // Accent markers can sit inside punctuation, e.g. "headless/*React*"
        const accent = word.includes('*');
        const clean = accent ? word.replace(/\*/g, '') : word;
        return (
          <span key={i} className="mr-[0.28em]">
            <Word
              range={[start, end]}
              progress={scrollYProgress}
              accent={accent}
              accentClassName={accentClassName}
              still={still}
              floor={floor}
            >
              {clean}
            </Word>
          </span>
        );
      })}
    </p>
  );
}

export default ScrollReveal;
