import { motion } from 'framer-motion';
import { useRef } from 'react';
import { formatDateLabel } from '../logic/time';

type DateSwiperProps = {
  selectedDate: Date;
  isToday: boolean;
  onShiftDay: (delta: number) => void;
  onToday: () => void;
  onOpenSettings: () => void;
};

const SWIPE_THRESHOLD = 42;

export function DateSwiper({ selectedDate, isToday, onShiftDay, onToday, onOpenSettings }: DateSwiperProps) {
  const startX = useRef<number | null>(null);

  return (
    <section
      className="date-swiper"
      onTouchStart={(event) => {
        startX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (startX.current === null) {
          return;
        }

        const endX = event.changedTouches[0]?.clientX ?? startX.current;
        const delta = endX - startX.current;
        if (Math.abs(delta) >= SWIPE_THRESHOLD) {
          onShiftDay(delta > 0 ? -1 : 1);
        }

        startX.current = null;
      }}
    >
      <div className="date-actions">
        <button type="button" className="icon-btn" onClick={() => onShiftDay(-1)} aria-label="Previous day">
          ‹
        </button>
        <button type="button" className="icon-btn" onClick={() => onShiftDay(1)} aria-label="Next day">
          ›
        </button>
      </div>

      <motion.div
        key={formatDateLabel(selectedDate)}
        className="date-label"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {formatDateLabel(selectedDate)}
      </motion.div>

      <div className="date-actions right">
        <button type="button" className="chip-btn" onClick={onToday} disabled={isToday}>
          Today
        </button>
        <button type="button" className="icon-btn" onClick={onOpenSettings} aria-label="Open settings">
          ⚙
        </button>
      </div>
    </section>
  );
}
