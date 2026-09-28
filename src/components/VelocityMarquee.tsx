import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from 'motion/react';
import { cn } from '@/lib/utils';

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return range === 0 ? min : ((((v - min) % range) + range) % range) + min;
};

interface VelocityMarqueeProps {
  items: string[];
  /** Base drift in px per frame. Negative runs right-to-left. */
  baseVelocity?: number;
  /** Speed up and skew with scroll velocity. Off gives a calm, constant drift. */
  scrollBoost?: boolean;
  className?: string;
}

export function VelocityMarquee({ items, baseVelocity = -1.4, scrollBoost = true, className }: VelocityMarqueeProps) {
  const still = useReducedMotion() ?? false;
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const skew = useTransform(smooth, [-2000, 2000], [8, -8], { clamp: true });

  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_t, delta) => {
    if (still) return;
    let moveBy = direction.current * baseVelocity * (delta / 16);
    const factor = scrollBoost ? velocityFactor.get() : 0;
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    moveBy += direction.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <motion.div className="flex w-max flex-nowrap" style={{ x, skewX: still || !scrollBoost ? 0 : skew }}>
        {[0, 1, 2, 3].map((copy) => (
          <div key={copy} className="flex flex-nowrap" aria-hidden={copy > 0}>
            {items.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                className="flex items-center whitespace-nowrap px-5 font-[var(--font-mono)] text-[13px] tracking-[0.08em] text-[var(--tx2)]"
              >
                <span className="mr-5 text-[var(--acc)]">◆</span>
                {item}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default VelocityMarquee;
