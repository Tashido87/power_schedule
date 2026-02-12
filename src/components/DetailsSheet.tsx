import { AnimatePresence, motion } from 'framer-motion';
import type { Slot } from '../logic/scheduleEngine';
import { formatTimeLabel } from '../logic/time';

type DetailsSheetProps = {
  slot: Slot | null;
  onClose: () => void;
};

export function DetailsSheet({ slot, onClose }: DetailsSheetProps) {
  return (
    <AnimatePresence>
      {slot ? (
        <>
          <motion.button
            type="button"
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close details"
          />

          <motion.section
            className="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 130, damping: 18 }}
            aria-label="Slot details"
          >
            <div className="sheet-handle" />
            <h3>{slot.type === 'grid' ? 'Grid Window' : 'Outage Window'}</h3>
            <p>
              {formatTimeLabel(slot.start)} - {formatTimeLabel(slot.end)}
            </p>

            {slot.subRules && slot.subRules.length > 0 ? (
              <div className="sub-rule-list">
                {slot.subRules.map((rule) => (
                  <div className="sub-rule-row" key={`${rule.start.getTime()}-${rule.end.getTime()}`}>
                    <span className={`chip ${rule.status === 'Running' ? 'good' : 'warn'}`}>{rule.status}</span>
                    <span>
                      {formatTimeLabel(rule.start)} - {formatTimeLabel(rule.end)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">No generator phase details for this slot.</p>
            )}
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
