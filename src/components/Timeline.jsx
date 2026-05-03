import { useState, useEffect, useRef } from 'react';
import { TimelineItem } from './TimelineItem';
import { DateNavigation } from './DateNavigation';
import { SunBurstIcon } from './Icons';
import { isSameDay } from '../utils/dateUtils';

export function Timeline({ schedule, currentDate, onDateChange, language, translations, showGenerator }) {
  const [showFab, setShowFab] = useState(false);
  const sheetRef = useRef(null);
  const now = new Date();
  const isToday = isSameDay(currentDate, now);

  useEffect(() => {
    const handleScroll = () => {
      const activeItem = sheetRef.current?.querySelector('.timeline-item.active');
      if (activeItem) {
        const rect = activeItem.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          setShowFab(true);
        } else {
          setShowFab(false);
        }
      }
    };

    const sheet = sheetRef.current;
    sheet?.addEventListener('scroll', handleScroll);
    return () => sheet?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFabClick = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    const activeItem = sheetRef.current?.querySelector('.timeline-item.active');
    activeItem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <main ref={sheetRef} className="schedule-sheet">
      <div className="sheet-handle"></div>

      <DateNavigation
        currentDate={currentDate}
        onDateChange={onDateChange}
        language={language}
        translations={translations}
      />

      <div className="timeline">
        {schedule.map((slot, idx) => {
          const isActive = isToday && now >= slot.start && now < slot.end;
          return (
            <TimelineItem
              key={idx}
              slot={slot}
              isToday={isToday}
              isActive={isActive}
              language={language}
              translations={translations}
              showGenerator={showGenerator}
            />
          );
        })}
      </div>
      <button
        className={`fab-btn ${showFab ? 'show' : ''}`}
        aria-label="Jump to Now"
        onClick={handleFabClick}
      >
        <SunBurstIcon />
      </button>
    </main>
  );
}
