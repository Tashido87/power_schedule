export type Pattern = 'A' | 'B';
export type SlotType = 'grid' | 'outage';
export type GeneratorPhaseStatus = 'Running' | 'Rest';

export type RawGeneratorPhase = {
  status: GeneratorPhaseStatus;
  start: string;
  end: string;
};

export type RawSlot = {
  type: SlotType;
  start: string;
  end: string;
  ruleKey?: keyof typeof GEN_RULES;
};

export const ANCHOR_DATE_LOCAL = '2025-12-09';

export const PATTERN_SLOTS: Record<Pattern, RawSlot[]> = {
  A: [
    { type: 'grid', start: '05:00', end: '09:00' },
    { type: 'outage', start: '09:00', end: '13:00', ruleKey: '09:00-13:00' },
    { type: 'grid', start: '13:00', end: '17:00' },
    { type: 'grid', start: '17:00', end: '05:00' },
  ],
  B: [
    { type: 'grid', start: '05:00', end: '07:30' },
    { type: 'outage', start: '07:30', end: '09:00', ruleKey: '07:30-09:00' },
    { type: 'grid', start: '09:00', end: '13:00' },
    { type: 'outage', start: '13:00', end: '17:00', ruleKey: '13:00-17:00' },
    { type: 'grid', start: '17:00', end: '09:00' },
  ],
};

export const GEN_RULES: Record<string, RawGeneratorPhase[]> = {
  '07:30-09:00': [{ status: 'Running', start: '07:30', end: '09:00' }],
  '09:00-13:00': [
    { status: 'Running', start: '09:00', end: '11:00' },
    { status: 'Rest', start: '11:00', end: '12:00' },
    { status: 'Running', start: '12:00', end: '13:00' },
  ],
  '13:00-17:00': [
    { status: 'Rest', start: '13:00', end: '14:00' },
    { status: 'Running', start: '14:00', end: '15:00' },
    { status: 'Rest', start: '15:00', end: '16:00' },
    { status: 'Running', start: '16:00', end: '17:00' },
  ],
};
