import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { NowMode } from '../logic/scheduleEngine';
import { formatTimeLabel } from '../logic/time';

const MODE_META: Record<
  NowMode,
  {
    headline: string;
    subline: string;
    tone: 'grid' | 'outage' | 'gen-run' | 'gen-rest' | 'preview';
    icon: string;
  }
> = {
  GRID_ON: {
    headline: 'Grid Live',
    subline: 'Utility electricity is available now.',
    tone: 'grid',
    icon: 'GL',
  },
  POWER_OFF: {
    headline: 'Power Off',
    subline: 'Grid is down and generator is not active.',
    tone: 'outage',
    icon: 'OF',
  },
  GEN_RUNNING: {
    headline: 'Generator Running',
    subline: 'Backup generation is supplying power.',
    tone: 'gen-run',
    icon: 'GR',
  },
  GEN_REST: {
    headline: 'Generator Rest',
    subline: 'Generator is paused in this outage window.',
    tone: 'gen-rest',
    icon: 'RS',
  },
  FUTURE_DATE: {
    headline: 'Future Preview',
    subline: 'Live tracking is disabled for future dates.',
    tone: 'preview',
    icon: 'FV',
  },
  PAST_DATE: {
    headline: 'Past Preview',
    subline: 'Viewing archived schedule for this day.',
    tone: 'preview',
    icon: 'PV',
  },
};

type NowCardProps = {
  mode: NowMode;
  pattern: 'A' | 'B';
  dayLabel: string;
  timer: string;
  nextChangeLabel: string;
  nextChangeAt: Date;
  isLive: boolean;
};

export function NowCard({ mode, pattern, dayLabel, timer, nextChangeLabel, nextChangeAt, isLive }: NowCardProps) {
  const meta = MODE_META[mode];
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className={`now-card tone-${meta.tone}`}
      layout
      initial={false}
      animate={{ scale: 1, opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 130, damping: 16 }}
    >
      <div className="now-card-topline">
        <span className="chip">Pattern {pattern}</span>
        <span className="chip quiet">{dayLabel}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          className="now-mode-wrap"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
          transition={{ duration: prefersReducedMotion ? 0.12 : 0.28 }}
        >
          <div className="status-pill">
            <span className="status-dot" aria-hidden="true" />
            <span className="status-icon">{meta.icon}</span>
          </div>

          <h1>{meta.headline}</h1>
          <p>{meta.subline}</p>
        </motion.div>
      </AnimatePresence>

      <div className="countdown-grid" aria-live="polite">
        <div>
          <div className="label">Countdown</div>
          <div className="timer">{isLive ? timer : '--:--:--'}</div>
        </div>
        <div>
          <div className="label">Next Change</div>
          <div className="next-time">{isLive ? formatTimeLabel(nextChangeAt) : 'Preview'}</div>
        </div>
      </div>

      <div className="next-change-line">{nextChangeLabel}</div>
    </motion.section>
  );
}
