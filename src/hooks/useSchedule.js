import { useState, useEffect } from 'react';
import { SCHEDULE_PATTERNS } from '../utils/scheduleData';
import { dayDiffUTC, buildScheduleObjects } from '../utils/dateUtils';

export function useSchedule(currentDate, todayPattern = 'A') {
  const [schedule, setSchedule] = useState([]);
  const [pattern, setPattern] = useState('A');

  useEffect(() => {
    const today = new Date();
    const diffFromToday = dayDiffUTC(today, currentDate);
    const isPatternA = Math.abs(diffFromToday) % 2 === 0
      ? todayPattern === 'A'
      : todayPattern !== 'A';
    const patternName = isPatternA ? 'A' : 'B';
    const rawPattern = isPatternA ? SCHEDULE_PATTERNS.A : SCHEDULE_PATTERNS.B;

    setPattern(patternName);
    setSchedule(buildScheduleObjects(rawPattern, currentDate));
  }, [currentDate, todayPattern]);

  return { schedule, pattern };
}
