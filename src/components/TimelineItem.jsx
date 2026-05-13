import { useState, useEffect, useRef } from 'react';
import { BoltIcon, PowerOffIcon, PlugIcon } from './Icons';
import { getProgressPct, formatTime } from '../utils/dateUtils';

export function TimelineItem({ slot, isToday, isActive, language, translations, showGenerator, isLast }) {
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);
  const itemRef = useRef(null);
  const t = translations[language];
  const now = new Date();

  let activeSub = null;
  if (isActive && slot.type === 'outage' && showGenerator && slot.subRules?.length > 0) {
    activeSub = slot.subRules.find((r) => now >= r.start && now < r.end) || null;
  }

  let stateKey = 'idle';
  if (isActive) {
    if (slot.type === 'grid') {
      stateKey = 'grid-on';
    } else if (activeSub?.status === 'Running') {
      stateKey = 'gen-on';
    } else {
      stateKey = 'grid-off';
    }
  }

  useEffect(() => {
    if (!isActive) return undefined;

    const update = () => {
      const n = new Date();
      if (isToday && n >= slot.start && n < slot.end) {
        setProgress(getProgressPct(n, slot.start, slot.end));
        setTick((v) => (v + 1) % 1000);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isActive, isToday, slot.start, slot.end]);

  useEffect(() => {
    if (isActive && itemRef.current) {
      const id = setTimeout(() => {
        itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 220);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [isActive]);

  const Icon = slot.type === 'grid' ? BoltIcon : PowerOffIcon;
  const title = slot.type === 'grid' ? t.grid_on : t.power_off;
  const startTime = formatTime(slot.start, language);
  const endTime = formatTime(slot.end, language);
  const timeRange = `${startTime} – ${endTime}`;

  return (
    <li
      ref={itemRef}
      className={`tl-item ${isActive ? 'active' : ''} ${isLast ? 'last' : ''}`}
      data-state={stateKey}
      data-tick={tick}
    >
      <div className="tl-rail">
        <span className="tl-dot" aria-hidden="true"></span>
        {!isLast && <span className="tl-line" aria-hidden="true"></span>}
      </div>

      <article className="tl-card">
        <div className="tl-card-row">
          <div className="tl-card-lead">
            <span className="tl-icon" aria-hidden="true"><Icon /></span>
            <div className="tl-headings">
              <h3 className="tl-title">{title}</h3>
              <p className="tl-subtitle">{timeRange}</p>
            </div>
          </div>
          <span className="tl-time">{startTime}</span>
        </div>

        {isActive && (
          <div className="tl-progress" aria-hidden="true">
            <div className="tl-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {showGenerator && slot.type === 'outage' && slot.subRules?.length > 0 && (
          <ul className="tl-subs">
            {slot.subRules.map((r, idx) => {
              const subActive = isToday && now >= r.start && now < r.end;
              const subStatus = r.status === 'Running' ? 'gen-on' : 'gen-rest';
              const subLabel = r.status === 'Running' ? t.gen_running : t.gen_rest;
              const SubIcon = r.status === 'Running' ? PlugIcon : PowerOffIcon;
              return (
                <li
                  key={idx}
                  className={`tl-sub ${subActive ? 'sub-active' : ''}`}
                  data-state={subStatus}
                >
                  <span className="tl-sub-lead">
                    <span className="tl-sub-icon"><SubIcon /></span>
                    <span>{subLabel}</span>
                  </span>
                  <span className="tl-sub-time">
                    {formatTime(r.start, language)} – {formatTime(r.end, language)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </li>
  );
}
