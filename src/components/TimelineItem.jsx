import { useState, useEffect, useRef } from 'react';
import { BoltIcon, PowerOffIcon } from './Icons';
import { isSameDay, getProgressPct, formatTime } from '../utils/dateUtils';

export function TimelineItem({ slot, isToday, language, translations, isActive, showGenerator }) {
  const [progress, setProgress] = useState(0);
  const itemRef = useRef(null);
  const t = translations[language];

  useEffect(() => {
    if (!isActive) return;

    const updateProgress = () => {
      const now = new Date();
      if (isToday && now >= slot.start && now < slot.end) {
        const prog = getProgressPct(now, slot.start, slot.end);
        setProgress(prog);
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [isActive, isToday, slot.start, slot.end]);

  useEffect(() => {
    if (isActive && itemRef.current) {
      setTimeout(() => {
        itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isActive]);

  const themeClass = slot.type === 'grid' ? 'status-grid' : 'status-outage';
  const timeStr = `${formatTime(slot.start, language)} - ${formatTime(slot.end, language)}`;
  const label = slot.type === 'grid' ? t.grid_on : t.power_off;

  return (
    <div 
      ref={itemRef}
      className={`timeline-item ${isActive ? 'active' : ''} ${themeClass}`}
    >
      <div className="timeline-dot"></div>
      <div className="time-label">{timeStr}</div>
      <div className="card-bubble">
        <div className="card-title">
          {slot.type === 'grid' ? <BoltIcon /> : <PowerOffIcon />}
          <span>{label}</span>
        </div>

        {isActive && (
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ '--prog': `${progress}%` }}
            ></div>
          </div>
        )}

        {showGenerator && slot.subRules && slot.subRules.length > 0 && (
          <div className="sub-timeline">
            {slot.subRules.map((r, idx) => {
              const now = new Date();
              const subActive = isToday && now >= r.start && now < r.end;
              const rStatus = r.status === 'Running' ? 'status-gen' : 'status-rest';
              const rLabel = r.status === 'Running' ? t.gen_running : t.gen_rest;
              const subColor = rStatus === 'status-gen' ? 'var(--c-warning)' : 'var(--c-text-sec)';

              return (
                <div
                  key={idx}
                  className={`sub-item ${subActive ? 'active-sub' : ''}`}
                  style={{ '--sub-color': subColor }}
                >
                  <span>{rLabel}</span>
                  <span>{formatTime(r.start, language)} - {formatTime(r.end, language)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
