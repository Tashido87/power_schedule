import { describe, expect, it } from 'vitest';
import {
  buildDaySchedule,
  buildLookaheadScheduleForNow,
  getNowState,
  getPatternForDate,
} from '../logic/scheduleEngine';
import {
  TIME_ZONE,
  formatTimeLabel,
  getDayKeyInZone,
  parseDateKey,
  parseTime,
  zonedDateTimeToDate,
} from '../logic/time';

function at(dateKey: string, time: string): Date {
  return zonedDateTimeToDate(parseDateKey(dateKey), parseTime(time), TIME_ZONE);
}

describe('scheduleEngine', () => {
  it('alternates patterns by absolute day parity from anchor', () => {
    expect(getPatternForDate(at('2025-12-09', '00:00'))).toBe('A');
    expect(getPatternForDate(at('2025-12-10', '00:00'))).toBe('B');
    expect(getPatternForDate(at('2025-12-08', '00:00'))).toBe('B');
    expect(getPatternForDate(at('2025-12-11', '00:00'))).toBe('A');
  });

  it('builds midnight-spanning slots with end date pushed to next day', () => {
    const slots = buildDaySchedule(at('2025-12-09', '00:00'));
    const overnight = slots[slots.length - 1];

    expect(overnight.type).toBe('grid');
    expect(formatTimeLabel(overnight.start, TIME_ZONE)).toBe('17:00');
    expect(formatTimeLabel(overnight.end, TIME_ZONE)).toBe('05:00');
    expect(getDayKeyInZone(overnight.start, TIME_ZONE)).toBe('2025-12-09');
    expect(getDayKeyInZone(overnight.end, TIME_ZONE)).toBe('2025-12-10');
  });

  it('resolves generator running/resting sub-rules inside outage windows', () => {
    const restNow = at('2025-12-09', '11:30');
    const restState = getNowState({ now: restNow, selectedDateLocal: restNow });
    expect(restState.mode).toBe('GEN_REST');
    expect(formatTimeLabel(restState.nextChangeAt, TIME_ZONE)).toBe('12:00');

    const runningNow = at('2025-12-09', '12:30');
    const runningState = getNowState({ now: runningNow, selectedDateLocal: runningNow });
    expect(runningState.mode).toBe('GEN_RUNNING');
    expect(formatTimeLabel(runningState.nextChangeAt, TIME_ZONE)).toBe('13:00');
  });

  it('includes previous-day spillover so early-morning status remains correct', () => {
    const now = at('2025-12-10', '02:00');
    const state = getNowState({ now, selectedDateLocal: now });

    expect(state.mode).toBe('GRID_ON');
    expect(formatTimeLabel(state.nextChangeAt, TIME_ZONE)).toBe('07:30');

    const lookahead = buildLookaheadScheduleForNow(now);
    expect(lookahead.some((slot) => now >= slot.start && now < slot.end)).toBe(true);
  });

  it('switches to non-live preview for future selected dates', () => {
    const now = at('2025-12-09', '10:00');
    const futureDate = at('2025-12-10', '00:00');
    const state = getNowState({ now, selectedDateLocal: futureDate });

    expect(state.mode).toBe('FUTURE_DATE');
    expect(state.isLive).toBe(false);
    expect(state.secondsRemaining).toBe(0);
  });
});
