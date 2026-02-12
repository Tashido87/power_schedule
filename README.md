# Power Schedule (React + Vite)

Mobile-first, one-screen dashboard for electricity status in `Asia/Yangon` with local-only schedule logic and smooth motion.

## Run

```bash
npm install
npm run dev
```

Optional checks:

```bash
npm run test
npm run build
```

## Pattern Parity Logic

- Anchor local date: `2025-12-09` in `Asia/Yangon`.
- Compute absolute day difference between selected date and anchor.
- If `diffDays % 2 === 0` => Pattern `A`, else Pattern `B`.
- All slots are interpreted in Yangon local time. Midnight-spanning slots (end <= start) are pushed to next local day.

## Notes

- No backend; all settings are persisted in localStorage.
- Reminder notifications use Web Notifications API when supported.
- Generator running/resting phases are resolved inside outage windows.
