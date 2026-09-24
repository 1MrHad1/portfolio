import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

interface CountUpProps {
  to: number;
  suffix?: string;
  label: string;
  duration?: number;
  className?: string;
}

export function CountUp({ to, suffix = '', label, duration = 1.4, className }: CountUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const still = useReducedMotion() ?? false;
  // Render the final value on the server and for reduced-motion viewers,
  // so the number is never missing if JS or motion is unavailable.
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (still) return;
    setValue(0);
  }, [still]);

  useEffect(() => {
    if (!inView || still) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, still]);

  return (
    <div ref={ref} className={cn('metric', className)}>
      <div className="v">
        <em>{value}</em>
        {suffix}
      </div>
      <div className="l">{label}</div>
    </div>
  );
}

export default CountUp;
