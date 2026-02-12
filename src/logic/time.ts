export const TIME_ZONE = 'Asia/Yangon';
const MS_PER_DAY = 86_400_000;

export type Ymd = {
  year: number;
  month: number;
  day: number;
};

export type Hm = {
  hour: number;
  minute: number;
};

type ZonedParts = Ymd & {
  hour: number;
  minute: number;
  second: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  const key = `parts:${timeZone}`;
  const cached = formatterCache.get(key);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  formatterCache.set(key, formatter);
  return formatter;
}

function parseParts(date: Date, timeZone: string): ZonedParts {
  const parts = getPartsFormatter(timeZone).formatToParts(date);
  const values: Record<string, number> = {};

  for (const part of parts) {
    if (part.type === 'literal') {
      continue;
    }
    values[part.type] = Number(part.value);
  }

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

export function parseDateKey(dateKey: string): Ymd {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
}

export function parseTime(time: string): Hm {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

export function toDateKey(ymd: Ymd): string {
  const y = String(ymd.year);
  const m = String(ymd.month).padStart(2, '0');
  const d = String(ymd.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYmdInZone(date: Date, timeZone = TIME_ZONE): Ymd {
  const { year, month, day } = parseParts(date, timeZone);
  return { year, month, day };
}

export function getDayKeyInZone(date: Date, timeZone = TIME_ZONE): string {
  return toDateKey(getYmdInZone(date, timeZone));
}

function getTimeZoneOffsetMillis(date: Date, timeZone: string): number {
  const parts = parseParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - date.getTime();
}

export function zonedDateTimeToDate(ymd: Ymd, hm: Hm, timeZone = TIME_ZONE): Date {
  const utcGuess = Date.UTC(ymd.year, ymd.month - 1, ymd.day, hm.hour, hm.minute, 0, 0);
  const offset = getTimeZoneOffsetMillis(new Date(utcGuess), timeZone);
  return new Date(utcGuess - offset);
}

export function getLocalMidnight(date: Date, timeZone = TIME_ZONE): Date {
  return zonedDateTimeToDate(getYmdInZone(date, timeZone), { hour: 0, minute: 0 }, timeZone);
}

export function ymdToDayNumber(ymd: Ymd): number {
  return Math.floor(Date.UTC(ymd.year, ymd.month - 1, ymd.day) / MS_PER_DAY);
}

export function addDaysYmd(ymd: Ymd, days: number): Ymd {
  const next = new Date((ymdToDayNumber(ymd) + days) * MS_PER_DAY);
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

export function addDaysToDateInZone(date: Date, days: number, timeZone = TIME_ZONE): Date {
  const ymd = getYmdInZone(date, timeZone);
  return zonedDateTimeToDate(addDaysYmd(ymd, days), { hour: 0, minute: 0 }, timeZone);
}

export function isSameDayInZone(left: Date, right: Date, timeZone = TIME_ZONE): boolean {
  return getDayKeyInZone(left, timeZone) === getDayKeyInZone(right, timeZone);
}

export function formatDateLabel(date: Date, timeZone = TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatTimeLabel(date: Date, timeZone = TIME_ZONE, withSeconds = false): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hourCycle: 'h23',
  }).format(date);
}

export function formatTimer(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainingSeconds = safe % 60;

  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, '0')).join(':');
}
