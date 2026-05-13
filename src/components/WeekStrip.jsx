import { isSameDay } from '../utils/dateUtils';

function getWeekDays(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const wd = new Date(monday);
    wd.setDate(monday.getDate() + i);
    return wd;
  });
}

export function WeekStrip({ currentDate, onDateChange, language }) {
  const days = getWeekDays(currentDate);
  const today = new Date();

  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(8);
  };

  return (
    <nav className="week-strip" aria-label="Week selector">
      {days.map((day) => {
        const isSelected = isSameDay(day, currentDate);
        const isToday = isSameDay(day, today);
        const weekday = new Intl.DateTimeFormat(
          language === 'mm' ? 'my-MM' : 'en-US',
          { weekday: language === 'mm' ? 'narrow' : 'short' }
        ).format(day);

        return (
          <button
            key={day.getTime()}
            className={`week-day ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
            onClick={() => {
              vibrate();
              onDateChange(day);
            }}
            aria-current={isSelected ? 'date' : undefined}
          >
            <span className="week-day-name">{weekday}</span>
            <span className="week-day-num">{day.getDate()}</span>
            {isToday && <span className="week-day-mark"></span>}
          </button>
        );
      })}
    </nav>
  );
}
