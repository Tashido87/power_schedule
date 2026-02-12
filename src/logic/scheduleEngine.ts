import {
  ANCHOR_DATE_LOCAL,
  GEN_RULES,
  PATTERN_SLOTS,
  type GeneratorPhaseStatus,
  type Pattern,
  type SlotType,
} from './scheduleData';
import {
  TIME_ZONE,
  addDaysToDateInZone,
  addDaysYmd,
  formatDateLabel,
  formatTimeLabel,
  getDayKeyInZone,
  getLocalMidnight,
  getYmdInZone,
  parseDateKey,
  parseTime,
  ymdToDayNumber,
  zonedDateTimeToDate,
} from './time';

export type SubRule = {
  status: GeneratorPhaseStatus;
  start: Date;
  end: Date;
};

export type Slot = {
  type: SlotType;
  start: Date;
  end: Date;
  ruleKey?: string;
  subRules?: SubRule[];
};

export type NowMode =
  | 'GRID_ON'
  | 'POWER_OFF'
  | 'GEN_RUNNING'
  | 'GEN_REST'
  | 'FUTURE_DATE'
  | 'PAST_DATE';

export type UpcomingItem = {
  label: string;
  start: Date;
  end: Date;
  type: SlotType;
  subSummary?: string;
};

export type NowState = {
  dayLabel: string;
  pattern: Pattern;
  mode: NowMode;
  nextChangeLabel: string;
  nextChangeAt: Date;
  secondsRemaining: number;
  progressRemainingPct: number;
  activeSlot?: Slot;
  activeSubRule?: SubRule;
  upcomingToday: UpcomingItem[];
  isLive: boolean;
};

type EngineOptions = {
  timeZone?: string;
  anchorDateLocal?: string;
};

type GetNowStateArgs = EngineOptions & {
  now: Date;
  selectedDateLocal: Date;
  daySchedule?: Slot[];
  lookaheadSchedule?: Slot[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildSubSummary(subRules: SubRule[] | undefined, timeZone: string): string | undefined {
  if (!subRules || subRules.length === 0) {
    return undefined;
  }

  return subRules
    .map((rule) => `${rule.status} ${formatTimeLabel(rule.start, timeZone)}-${formatTimeLabel(rule.end, timeZone)}`)
    .join(' · ');
}

function toUpcomingItem(slot: Slot, timeZone: string): UpcomingItem {
  return {
    label: slot.type === 'grid' ? 'Grid ON' : 'Outage',
    start: slot.start,
    end: slot.end,
    type: slot.type,
    subSummary: buildSubSummary(slot.subRules, timeZone),
  };
}

function findActiveSlot(slots: Slot[], now: Date): { slot: Slot; index: number } | undefined {
  for (let index = 0; index < slots.length; index += 1) {
    const slot = slots[index];
    if (now >= slot.start && now < slot.end) {
      return { slot, index };
    }
  }
  return undefined;
}

function getRemainingSeconds(now: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

function getRemainingPct(now: Date, start: Date, end: Date): number {
  const total = end.getTime() - start.getTime();
  if (total <= 0) {
    return 0;
  }

  const remaining = end.getTime() - now.getTime();
  return clamp((remaining / total) * 100, 0, 100);
}

function getGridEffectiveEnd(slots: Slot[], startIndex: number): Date {
  let end = slots[startIndex].end;

  for (let index = startIndex + 1; index < slots.length; index += 1) {
    const next = slots[index];
    if (next.type !== 'grid') {
      break;
    }

    if (next.start.getTime() > end.getTime()) {
      break;
    }

    if (next.end.getTime() > end.getTime()) {
      end = next.end;
    }
  }

  return end;
}

function buildUpcomingForToday(lookaheadSchedule: Slot[], now: Date, timeZone: string): UpcomingItem[] {
  return lookaheadSchedule
    .filter((slot) => slot.start > now)
    .slice(0, 3)
    .map((slot) => toUpcomingItem(slot, timeZone));
}

function buildPreviewUpcoming(daySchedule: Slot[], timeZone: string): UpcomingItem[] {
  return daySchedule.slice(0, 3).map((slot) => toUpcomingItem(slot, timeZone));
}

function buildSubRulesForSlot(slot: Slot, timeZone: string): SubRule[] {
  if (!slot.ruleKey) {
    return [];
  }

  const phases = GEN_RULES[slot.ruleKey] ?? [];
  const dayYmd = getYmdInZone(slot.start, timeZone);
  const nextDayYmd = addDaysYmd(dayYmd, 1);

  const results: SubRule[] = [];

  for (const phase of phases) {
    const startHm = parseTime(phase.start);
    const endHm = parseTime(phase.end);

    const candidates: Array<{ start: Date; end: Date }> = [dayYmd, nextDayYmd].map((candidateYmd) => {
      const candidateStart = zonedDateTimeToDate(candidateYmd, startHm, timeZone);
      const candidateEndYmd =
        endHm.hour * 60 + endHm.minute <= startHm.hour * 60 + startHm.minute
          ? addDaysYmd(candidateYmd, 1)
          : candidateYmd;
      const candidateEnd = zonedDateTimeToDate(candidateEndYmd, endHm, timeZone);
      return { start: candidateStart, end: candidateEnd };
    });

    const overlap = candidates.find((candidate) => candidate.end > slot.start && candidate.start < slot.end);
    if (!overlap) {
      continue;
    }

    const clampedStart = new Date(Math.max(overlap.start.getTime(), slot.start.getTime()));
    const clampedEnd = new Date(Math.min(overlap.end.getTime(), slot.end.getTime()));

    if (clampedEnd > clampedStart) {
      results.push({
        status: phase.status,
        start: clampedStart,
        end: clampedEnd,
      });
    }
  }

  return results.sort((left, right) => left.start.getTime() - right.start.getTime());
}

export function getPatternForDate(selectedDateLocal: Date, options: EngineOptions = {}): Pattern {
  const timeZone = options.timeZone ?? TIME_ZONE;
  const anchorDateLocal = options.anchorDateLocal ?? ANCHOR_DATE_LOCAL;

  const selectedYmd = getYmdInZone(selectedDateLocal, timeZone);
  const anchorYmd = parseDateKey(anchorDateLocal);
  const diffDays = Math.abs(ymdToDayNumber(selectedYmd) - ymdToDayNumber(anchorYmd));

  return diffDays % 2 === 0 ? 'A' : 'B';
}

export function buildDaySchedule(selectedDateLocal: Date, options: EngineOptions = {}): Slot[] {
  const timeZone = options.timeZone ?? TIME_ZONE;
  const pattern = getPatternForDate(selectedDateLocal, options);
  const dayYmd = getYmdInZone(selectedDateLocal, timeZone);

  return PATTERN_SLOTS[pattern]
    .map((rawSlot) => {
      const startHm = parseTime(rawSlot.start);
      const endHm = parseTime(rawSlot.end);

      const start = zonedDateTimeToDate(dayYmd, startHm, timeZone);
      const endYmd = endHm.hour * 60 + endHm.minute <= startHm.hour * 60 + startHm.minute ? addDaysYmd(dayYmd, 1) : dayYmd;
      const end = zonedDateTimeToDate(endYmd, endHm, timeZone);

      const slot: Slot = {
        type: rawSlot.type,
        start,
        end,
        ruleKey: rawSlot.ruleKey,
      };

      if (slot.type === 'outage' && slot.ruleKey) {
        const subRules = buildSubRulesForSlot(slot, timeZone);
        if (subRules.length > 0) {
          slot.subRules = subRules;
        }
      }

      return slot;
    })
    .sort((left, right) => left.start.getTime() - right.start.getTime());
}

export function buildLookaheadScheduleForNow(todayLocal: Date, options: EngineOptions = {}): Slot[] {
  const timeZone = options.timeZone ?? TIME_ZONE;
  const todayMidnight = getLocalMidnight(todayLocal, timeZone);

  const today = buildDaySchedule(todayLocal, options);
  const tomorrow = buildDaySchedule(addDaysToDateInZone(todayLocal, 1, timeZone), options);
  const yesterday = buildDaySchedule(addDaysToDateInZone(todayLocal, -1, timeZone), options);

  const spillOverFromYesterday = yesterday.filter((slot) => slot.end > todayMidnight);

  return [...spillOverFromYesterday, ...today, ...tomorrow].sort(
    (left, right) => left.start.getTime() - right.start.getTime(),
  );
}

export function getNowState(args: GetNowStateArgs): NowState {
  const {
    now,
    selectedDateLocal,
    timeZone = TIME_ZONE,
    anchorDateLocal = ANCHOR_DATE_LOCAL,
    daySchedule,
    lookaheadSchedule,
  } = args;

  const selectedPattern = getPatternForDate(selectedDateLocal, { timeZone, anchorDateLocal });
  const selectedDaySchedule = daySchedule ?? buildDaySchedule(selectedDateLocal, { timeZone, anchorDateLocal });

  const dayLabel = formatDateLabel(selectedDateLocal, timeZone);
  const selectedDayKey = getDayKeyInZone(selectedDateLocal, timeZone);
  const nowDayKey = getDayKeyInZone(now, timeZone);
  const isLive = selectedDayKey === nowDayKey;

  if (!isLive) {
    const selectedDayNumber = ymdToDayNumber(getYmdInZone(selectedDateLocal, timeZone));
    const nowDayNumber = ymdToDayNumber(getYmdInZone(now, timeZone));
    const mode: NowMode = selectedDayNumber > nowDayNumber ? 'FUTURE_DATE' : 'PAST_DATE';

    return {
      dayLabel,
      pattern: selectedPattern,
      mode,
      nextChangeLabel: 'Schedule preview (not live)',
      nextChangeAt: selectedDaySchedule[0]?.start ?? selectedDateLocal,
      secondsRemaining: 0,
      progressRemainingPct: 0,
      upcomingToday: buildPreviewUpcoming(selectedDaySchedule, timeZone),
      isLive,
    };
  }

  const lookahead = lookaheadSchedule ?? buildLookaheadScheduleForNow(now, { timeZone, anchorDateLocal });
  const active = findActiveSlot(lookahead, now);
  const upcomingToday = buildUpcomingForToday(lookahead, now, timeZone);

  if (!active) {
    const next = lookahead.find((slot) => slot.start > now) ?? lookahead[0];
    return {
      dayLabel,
      pattern: selectedPattern,
      mode: 'POWER_OFF',
      nextChangeLabel: next ? `Next slot starts at ${formatTimeLabel(next.start, timeZone)}` : 'No upcoming slots',
      nextChangeAt: next?.start ?? now,
      secondsRemaining: next ? getRemainingSeconds(now, next.start) : 0,
      progressRemainingPct: 0,
      activeSlot: next,
      upcomingToday,
      isLive,
    };
  }

  if (active.slot.type === 'grid') {
    const effectiveEnd = getGridEffectiveEnd(lookahead, active.index);
    return {
      dayLabel,
      pattern: selectedPattern,
      mode: 'GRID_ON',
      nextChangeLabel: `Power off at ${formatTimeLabel(effectiveEnd, timeZone)}`,
      nextChangeAt: effectiveEnd,
      secondsRemaining: getRemainingSeconds(now, effectiveEnd),
      progressRemainingPct: getRemainingPct(now, active.slot.start, effectiveEnd),
      activeSlot: active.slot,
      upcomingToday,
      isLive,
    };
  }

  const activeSubRule = active.slot.subRules?.find((rule) => now >= rule.start && now < rule.end);

  if (!activeSubRule) {
    return {
      dayLabel,
      pattern: selectedPattern,
      mode: 'POWER_OFF',
      nextChangeLabel: `Grid returns at ${formatTimeLabel(active.slot.end, timeZone)}`,
      nextChangeAt: active.slot.end,
      secondsRemaining: getRemainingSeconds(now, active.slot.end),
      progressRemainingPct: getRemainingPct(now, active.slot.start, active.slot.end),
      activeSlot: active.slot,
      upcomingToday,
      isLive,
    };
  }

  const currentSubRuleIndex = active.slot.subRules?.findIndex((rule) => rule === activeSubRule) ?? -1;
  const nextSubRule =
    currentSubRuleIndex >= 0 && active.slot.subRules
      ? active.slot.subRules[currentSubRuleIndex + 1]
      : undefined;

  const nextLabel = nextSubRule
    ? `Generator ${nextSubRule.status === 'Running' ? 'running' : 'resting'} at ${formatTimeLabel(activeSubRule.end, timeZone)}`
    : `Grid returns at ${formatTimeLabel(active.slot.end, timeZone)}`;

  return {
    dayLabel,
    pattern: selectedPattern,
    mode: activeSubRule.status === 'Running' ? 'GEN_RUNNING' : 'GEN_REST',
    nextChangeLabel: nextLabel,
    nextChangeAt: activeSubRule.end,
    secondsRemaining: getRemainingSeconds(now, activeSubRule.end),
    progressRemainingPct: getRemainingPct(now, activeSubRule.start, activeSubRule.end),
    activeSlot: active.slot,
    activeSubRule,
    upcomingToday,
    isLive,
  };
}
