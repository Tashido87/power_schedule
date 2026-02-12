import { motion } from 'framer-motion';
import type { Slot } from '../logic/scheduleEngine';
import { formatTimeLabel } from '../logic/time';

type TodayStripProps = {
  slots: Slot[];
  now: Date;
  isLive: boolean;
  onSelectSlot: (slot: Slot) => void;
};

function getDuration(slot: Slot): number {
  return Math.max(1, slot.end.getTime() - slot.start.getTime());
}

export function TodayStrip({ slots, now, isLive, onSelectSlot }: TodayStripProps) {
  const totalDuration = slots.reduce((sum, slot) => sum + getDuration(slot), 0);

  return (
    <section className="panel today-strip-panel">
      <div className="panel-header">
        <h2>Today Strip</h2>
      </div>

      <div className="today-strip" role="list" aria-label="Daily schedule segments">
        {slots.map((slot) => {
          const width = (getDuration(slot) / totalDuration) * 100;
          const isActive = isLive && now >= slot.start && now < slot.end;

          return (
            <button
              key={`${slot.start.getTime()}-${slot.end.getTime()}`}
              type="button"
              className={`strip-segment ${slot.type} ${isActive ? 'active' : ''}`}
              style={{ width: `${width}%` }}
              role="listitem"
              onClick={() => onSelectSlot(slot)}
              aria-label={`${slot.type === 'grid' ? 'Grid on' : 'Outage'} from ${formatTimeLabel(slot.start)} to ${formatTimeLabel(slot.end)}`}
            >
              {isActive ? (
                <motion.span
                  className="active-beacon"
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.05, 0.9] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8, ease: 'easeInOut' }}
                />
              ) : null}
              <span className="segment-label">{slot.type === 'grid' ? 'ON' : 'OFF'}</span>
            </button>
          );
        })}
      </div>

      <div className="strip-time-legend" aria-hidden="true">
        <span>{slots[0] ? formatTimeLabel(slots[0].start) : '--:--'}</span>
        <span>{slots[slots.length - 1] ? formatTimeLabel(slots[slots.length - 1].end) : '--:--'}</span>
      </div>
    </section>
  );
}
