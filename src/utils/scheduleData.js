export const ANCHOR_DATE = new Date('2025-12-09T00:00:00Z');

export const GEN_RULES = {
  '05:00-09:00': [
    { s: '05:00', e: '07:00', status: 'Rest' },
    { s: '07:00', e: '09:00', status: 'Running' }
  ],
  '09:00-13:00': [
    { s: '09:00', e: '11:00', status: 'Running' },
    { s: '11:00', e: '12:00', status: 'Rest' },
    { s: '12:00', e: '13:00', status: 'Running' }
  ],
  '13:00-17:00': [
    { s: '13:00', e: '14:00', status: 'Rest' },
    { s: '14:00', e: '15:00', status: 'Running' },
    { s: '15:00', e: '16:00', status: 'Rest' },
    { s: '16:00', e: '17:00', status: 'Running' }
  ],
  '17:00-21:00': [
    { s: '17:00', e: '18:00', status: 'Rest' },
    { s: '18:00', e: '21:00', status: 'Running' }
  ]
};

export const SCHEDULE_PATTERNS = {
  A: [
    { s: '05:00', e: '09:00', type: 'grid' },
    { s: '09:00', e: '13:00', type: 'outage', ruleKey: '09:00-13:00' },
    { s: '13:00', e: '17:00', type: 'grid' },
    { s: '17:00', e: '21:00', type: 'outage', ruleKey: '17:00-21:00' },
    { s: '21:00', e: '05:00', type: 'grid', nextDay: true }
  ],
  B: [
    { s: '05:00', e: '09:00', type: 'outage', ruleKey: '05:00-09:00' },
    { s: '09:00', e: '13:00', type: 'grid' },
    { s: '13:00', e: '17:00', type: 'outage', ruleKey: '13:00-17:00' },
    { s: '17:00', e: '05:00', type: 'grid', nextDay: true }
  ]
};
