import { GEN_RULES } from './scheduleData';

export function dayDiffUTC(a, b) {
  const au = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bu = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((bu - au) / 86400000);
}

export function makeInterval(base, s, e, next) {
  const [sH, sM] = s.split(':').map(Number);
  const [eH, eM] = e.split(':').map(Number);
  const start = new Date(base);
  start.setHours(sH, sM, 0, 0);
  const end = new Date(base);
  end.setHours(eH, eM, 0, 0);
  if (next || end <= start) end.setDate(end.getDate() + 1);
  return { start, end };
}

export function isSameDay(d1, d2) {
  return d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
}

export function buildScheduleObjects(pattern, date) {
  return pattern.map(slot => {
    const { start, end } = makeInterval(date, slot.s, slot.e, slot.nextDay);
    let subRules = [];
    if (slot.ruleKey && GEN_RULES[slot.ruleKey]) {
      subRules = GEN_RULES[slot.ruleKey].map(r => {
        const rInt = makeInterval(start, r.s, r.e, false);
        return { ...r, start: rInt.start, end: rInt.end };
      });
    }
    return { ...slot, start, end, subRules };
  });
}

export function getProgressPct(now, start, end) {
  const total = end - start;
  const elapsed = now - start;
  const pct = (elapsed / total) * 100;
  return Math.max(0, Math.min(100, 100 - pct));
}

export function formatDate(date, lang, translations) {
  const t = translations[lang];
  const day = date.getDate();
  const month = t.months[date.getMonth()];
  const weekday = new Intl.DateTimeFormat(
    lang === 'mm' ? 'my-MM' : 'en-US',
    { weekday: 'short' }
  ).format(date);

  return lang === 'mm'
    ? `${weekday}၊ ${month} ${toBurmeseNum(day)}`
    : `${weekday}, ${month} ${day}`;
}

export function formatTime(d, lang) {
  let h = d.getHours();
  let m = d.getMinutes();

  let period = h >= 12 ? 'PM' : 'AM';
  if (lang === 'mm') {
    if (h >= 5 && h < 12) period = 'မနက်';
    else if (h >= 12 && h < 17) period = 'နေ့လည်';
    else if (h >= 17 && h < 22) period = 'ညနေ';
    else period = 'ည';
  }

  let dh = h % 12 || 12;
  if (lang === 'mm') {
    return `${period} ${toBurmeseNum(dh)}${m > 0 ? ':' + toBurmeseNum(m) : ''}`;
  }
  return `${dh}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatCountdown(mins, label, lang, translations) {
  const t = translations[lang];

  if (lang === 'mm') {
    let timeStr = '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) timeStr += `${toBurmeseNum(h)} နာရီ`;
    if (m > 0) timeStr += ` ${toBurmeseNum(m)} မိနစ်`;
    if (h === 0 && m === 0) return 'အခုပြောင်းမယ်';
    if (timeStr === '') timeStr = `${toBurmeseNum(mins)} မိနစ်`;
    return `နောက် ${timeStr} တွင် ${label}မည်`;
  }

  let timeStr = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} hr ${mins % 60} min`;
  return `${t.next_change}: ${label} ${t.in} ${timeStr}`;
}

function toBurmeseNum(n) {
  const BURMESE_NUMS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  return n.toString().split('').map(c => BURMESE_NUMS[parseInt(c)] || c).join('');
}
