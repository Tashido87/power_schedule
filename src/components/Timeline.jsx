import { TimelineItem } from './TimelineItem';
import { isSameDay } from '../utils/dateUtils';

export function Timeline({ schedule, currentDate, language, translations, showGenerator }) {
  const now = new Date();
  const isToday = isSameDay(currentDate, now);

  return (
    <ol className="timeline-list">
      {schedule.map((slot, idx) => {
        const isActive = isToday && now >= slot.start && now < slot.end;
        const isLast = idx === schedule.length - 1;
        return (
          <TimelineItem
            key={idx}
            slot={slot}
            isToday={isToday}
            isActive={isActive}
            language={language}
            translations={translations}
            showGenerator={showGenerator}
            isLast={isLast}
          />
        );
      })}
    </ol>
  );
}
