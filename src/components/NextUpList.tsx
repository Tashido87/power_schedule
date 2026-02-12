import { motion } from 'framer-motion';
import type { UpcomingItem } from '../logic/scheduleEngine';
import { formatTimeLabel } from '../logic/time';

type NextUpListProps = {
  items: UpcomingItem[];
};

export function NextUpList({ items }: NextUpListProps) {
  return (
    <section className="panel next-up-panel">
      <div className="panel-header">
        <h2>Next Up</h2>
      </div>

      {items.length === 0 ? <div className="empty">No upcoming transitions available.</div> : null}

      <div className="next-up-list">
        {items.map((item, index) => (
          <motion.button
            key={`${item.start.getTime()}-${item.label}`}
            type="button"
            className="next-up-item"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <span className={`chip ${item.type === 'grid' ? 'good' : 'warn'}`}>{item.label}</span>
            <span className="range">
              {formatTimeLabel(item.start)} - {formatTimeLabel(item.end)}
            </span>
            {item.subSummary ? <span className="sub-summary">{item.subSummary}</span> : null}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
