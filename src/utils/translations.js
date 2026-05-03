export const TRANSLATIONS = {
  en: {
    grid_on: "GRID ON",
    power_off: "GRID OFF",
    gen_running: "Generator ON",
    gen_rest: "Generator Rest",
    elec_avail: "Electricity Available",
    next_day: "(Next Day)",
    elevatorLabel: "Elevator:",
    elevatorFee: "10,000 MMK fee",
    today: "Today",
    next_change: "Next change",
    in: "in",
    back_today: "Back to Today",
    settings: "Settings",
    schedule_settings: "Schedule Control",
    today_pattern: "Today is",
    today_pattern_desc: "Choose whether today follows Pattern A or Pattern B. Future days will alternate automatically.",
    generator_schedule: "Generator schedule",
    generator_schedule_desc: "Show generator running/rest periods inside outage cards.",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  mm: {
    grid_on: "မီးလာ",
    power_off: "မီးပျက်",
    gen_running: "မီးစက်မောင်း",
    gen_rest: "မီးစက်နား",
    elec_avail: "မီးလာ (EPC)",
    next_day: "(နောက်နေ့)",
    elevatorLabel: "ဓာတ်လှေကား:",
    elevatorFee: "၁၀,၀၀၀ ကျပ်",
    today: "ဒီနေ့",
    next_change: "နောက်အပြောင်းအလဲ",
    in: "နောက်",
    back_today: "ဒီနေ့ပြန်သွား",
    settings: "ဆက်တင်",
    schedule_settings: "အချိန်ဇယားထိန်းချုပ်မှု",
    today_pattern: "ဒီနေ့ ပုံစံ",
    today_pattern_desc: "ဒီနေ့ Pattern A လား Pattern B လားရွေးပါ။ နောက်နေ့များကို အလိုအလျောက်ပြောင်းတွက်ပါမည်။",
    generator_schedule: "မီးစက်အချိန်ဇယား",
    generator_schedule_desc: "မီးပျက်ချိန်အတွင်း မီးစက်မောင်း/နားချိန်များကို ပြပါ။",
    months: ["ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", "ဇူလိုင်", "သြဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ"]
  }
};

export const BURMESE_NUMS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];

export function toBurmeseNum(n) {
  return n.toString().split('').map(c => BURMESE_NUMS[parseInt(c)] || c).join('');
}
