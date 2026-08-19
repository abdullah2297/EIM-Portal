'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { formatNumber } from '@/lib/format';

/**
 * Animated counter tile.
 *
 * The count-up only starts once the tile scrolls into view, and is skipped
 * entirely when the visitor prefers reduced motion.
 *
 * @param {{
 *  value: number, label: string, icon?: string, suffix?: string,
 *  onDark?: boolean, duration?: number, className?: string,
 * }} props
 */
export function StatTile({ value, label, icon = 'Insights', suffix = '', onDark = false, duration = 1100, className = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const target = Number(value) || 0;
    const node = ref.current;
    if (!node) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplay(target);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || hasRun.current) return;
        hasRun.current = true;

        const start = performance.now();
        const step = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          // Ease-out cubic keeps the last digits from crawling.
          setDisplay(Math.round(target * (1 - (1 - progress) ** 3)));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <div className={`stat-tile ${onDark ? 'stat-tile--on-dark' : ''} ${className}`.trim()} ref={ref}>
      <span className="stat-tile__icon">
        <Icon name={icon} fontSize="medium" />
      </span>
      <div>
        <p className="stat-tile__value">
          {formatNumber(display)}
          {suffix}
        </p>
        <p className="stat-tile__label">{label}</p>
      </div>
    </div>
  );
}

export default StatTile;
