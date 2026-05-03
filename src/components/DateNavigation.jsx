import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { formatDate, isSameDay } from '../utils/dateUtils';

export function DateNavigation({ currentDate, onDateChange, language, translations }) {
  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handlePrevDay = () => {
    vibrate();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    vibrate();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleReturnToday = () => {
    vibrate();
    onDateChange(new Date());
  };

  const handleDatePickerChange = (e) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    onDateChange(new Date(y, m - 1, d));
  };

  const isToday = isSameDay(currentDate, new Date());
  const t = translations[language];

  const dateValue = (() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })();

  return (
    <div className="date-nav-container">
      <button className="icon-btn" aria-label="Previous Day" onClick={handlePrevDay}>
        <ChevronLeftIcon />
      </button>

      <div className="date-center">
        <div className="date-picker-wrapper">
          <span className="date-text">
            {formatDate(currentDate, language, translations)}
          </span>
          <input
            type="date"
            value={dateValue}
            onChange={handleDatePickerChange}
          />
        </div>
        <button
          className={`today-btn-small ${!isToday ? 'visible' : ''}`}
          onClick={handleReturnToday}
        >
          {t.back_today}
        </button>
      </div>

      <button className="icon-btn" aria-label="Next Day" onClick={handleNextDay}>
        <ChevronRightIcon />
      </button>
    </div>
  );
}
