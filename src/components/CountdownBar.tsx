import { motion, useReducedMotion } from 'framer-motion';

type CountdownBarProps = {
  remainingPct: number;
  isLive: boolean;
};

export function CountdownBar({ remainingPct, isLive }: CountdownBarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="countdown-bar-shell" aria-label="Countdown progress">
      <motion.div
        className="countdown-bar-fill"
        initial={false}
        animate={{ width: `${remainingPct}%` }}
        transition={
          prefersReducedMotion
            ? { duration: 0.2 }
            : {
                type: 'spring',
                stiffness: 90,
                damping: 20,
                mass: 0.7,
              }
        }
      >
        {!prefersReducedMotion && isLive ? <div className="countdown-bar-shimmer" /> : null}
      </motion.div>
    </div>
  );
}
