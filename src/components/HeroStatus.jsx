import { useState, useEffect } from 'react';
import { BoltIcon, PowerOffIcon, PlugIcon } from './Icons';
import { SCHEDULE_PATTERNS } from '../utils/scheduleData';
import { dayDiffUTC, buildScheduleObjects, isSameDay, formatCountdown } from '../utils/dateUtils';

export function HeroStatus({ schedule, currentDate, language, translations, todayPattern, showGenerator }) {
  const [status, setStatus] = useState({
    type: 'neutral',
    text: 'Loading...',
    icon: null,
    countdown: 'Calculating...'
  });

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const isToday = isSameDay(currentDate, now);
      const t = translations[language];

      if (!isToday) {
        setStatus({
          type: 'neutral',
          text: 'Future Date',
          icon: <PowerOffIcon />,
          countdown: ''
        });
        return;
      }

      // Build next day schedule for lookahead
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      const today = new Date();
      const diffDays = dayDiffUTC(today, nextDay);
      const isNextPatternA = Math.abs(diffDays) % 2 === 0
        ? todayPattern === 'A'
        : todayPattern !== 'A';
      const nextPatternRaw = isNextPatternA ? SCHEDULE_PATTERNS.A : SCHEDULE_PATTERNS.B;
      const nextSchedule = buildScheduleObjects(nextPatternRaw, nextDay);
      const fullSchedule = schedule.concat(nextSchedule);

      let newStatus = { type: 'neutral', text: 'Waiting...', icon: <PowerOffIcon />, countdown: t.today };

      for (let i = 0; i < fullSchedule.length; i++) {
        const slot = fullSchedule[i];

        if (now >= slot.start && now < slot.end) {
          if (slot.type === 'grid') {
            let effectiveEndTime = slot.end;
            let nextIdx = i + 1;

            while (nextIdx < fullSchedule.length && fullSchedule[nextIdx].type === 'grid') {
              effectiveEndTime = fullSchedule[nextIdx].end;
              nextIdx++;
            }

            const diffMins = Math.ceil((effectiveEndTime - now) / 60000);
            newStatus = {
              type: 'grid',
              text: t.grid_on,
              icon: <BoltIcon />,
              countdown: formatCountdown(diffMins, t.power_off, language, translations)
            };
          } else {
            let subActive = null;
            if (showGenerator) {
              for (const r of slot.subRules) {
                if (now >= r.start && now < r.end) {
                  subActive = r;
                  const diffMins = Math.ceil((r.end - now) / 60000);
                  const nextLabel = r === slot.subRules[slot.subRules.length - 1] 
                    ? t.grid_on 
                    : (r.status === 'Running' ? t.gen_rest : t.gen_running);

                  if (r.status === 'Running') {
                    newStatus = {
                      type: 'gen',
                      text: t.gen_running,
                      icon: <PlugIcon />,
                      countdown: formatCountdown(diffMins, nextLabel, language, translations)
                    };
                  } else {
                    newStatus = {
                      type: 'rest',
                      text: t.gen_rest,
                      icon: <PowerOffIcon />,
                      countdown: formatCountdown(diffMins, nextLabel, language, translations)
                    };
                  }
                  break;
                }
              }
            }

            if (!subActive) {
              const diffMins = Math.ceil((slot.end - now) / 60000);
              newStatus = {
                type: 'outage',
                text: t.power_off,
                icon: <PowerOffIcon />,
                countdown: formatCountdown(diffMins, t.grid_on, language, translations)
              };
            }
          }
          break;
        } else if (now < slot.start) {
          const diffMins = Math.ceil((slot.start - now) / 60000);
          const nextLabel = slot.type === 'grid' ? t.grid_on : t.power_off;
          newStatus = {
            type: 'neutral',
            text: 'Waiting...',
            icon: <PowerOffIcon />,
            countdown: formatCountdown(diffMins, nextLabel, language, translations)
          };
          break;
        }
      }

      setStatus(newStatus);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [schedule, currentDate, language, translations, todayPattern, showGenerator]);

  const getColor = () => {
    switch (status.type) {
      case 'grid': return 'var(--c-success)';
      case 'outage':
      case 'rest': return 'var(--c-danger)';
      case 'gen': return 'var(--c-warning)';
      default: return '#8e8e93';
    }
  };

  const getGlow = () => {
    switch (status.type) {
      case 'grid': return 'var(--c-success-glow)';
      case 'outage':
      case 'rest': return 'var(--c-danger-glow)';
      case 'gen': return 'var(--c-warning-glow)';
      default: return '#333';
    }
  };

  return (
    <div className="hero-status-shell" style={{ color: getColor() }}>
      <style>
        {`
          .app-background::before {
            --bg-glow-1: ${getGlow()} !important;
          }
        `}
      </style>
      <div className="hero-status">
        <div className="status-icon-wrapper">
          <div className="hero-icon">{status.icon}</div>
          <div className="pulse-ring"></div>
        </div>
        <h1>{status.text}</h1>
        <div className="hero-subtitle">{status.countdown}</div>
      </div>
    </div>
  );
}
