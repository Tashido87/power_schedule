import { useMemo } from 'react';
import {
  buildDaySchedule,
  buildLookaheadScheduleForNow,
  getNowState,
  getPatternForDate,
} from '../logic/scheduleEngine';
import { getDayKeyInZone, TIME_ZONE } from '../logic/time';

type UseScheduleArgs = {
  selectedDate: Date;
  now: Date;
  anchorDateLocal: string;
};

export function useSchedule({ selectedDate, now, anchorDateLocal }: UseScheduleArgs) {
  const selectedDayKey = getDayKeyInZone(selectedDate, TIME_ZONE);
  const nowDayKey = getDayKeyInZone(now, TIME_ZONE);

  const daySchedule = useMemo(
    () => buildDaySchedule(selectedDate, { anchorDateLocal, timeZone: TIME_ZONE }),
    [selectedDayKey, anchorDateLocal, selectedDate],
  );

  const lookaheadSchedule = useMemo(
    () => buildLookaheadScheduleForNow(now, { anchorDateLocal, timeZone: TIME_ZONE }),
    [nowDayKey, anchorDateLocal, now],
  );

  const nowState = useMemo(
    () =>
      getNowState({
        now,
        selectedDateLocal: selectedDate,
        anchorDateLocal,
        timeZone: TIME_ZONE,
        daySchedule,
        lookaheadSchedule: selectedDayKey === nowDayKey ? lookaheadSchedule : undefined,
      }),
    [now, selectedDate, daySchedule, lookaheadSchedule, selectedDayKey, nowDayKey, anchorDateLocal],
  );

  const pattern = useMemo(
    () => getPatternForDate(selectedDate, { anchorDateLocal, timeZone: TIME_ZONE }),
    [selectedDate, selectedDayKey, anchorDateLocal],
  );

  return {
    daySchedule,
    lookaheadSchedule,
    nowState,
    pattern,
    isToday: selectedDayKey === nowDayKey,
  };
}
