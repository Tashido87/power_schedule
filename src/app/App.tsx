import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CountdownBar } from '../components/CountdownBar';
import { DateSwiper } from '../components/DateSwiper';
import { DetailsSheet } from '../components/DetailsSheet';
import { NextUpList } from '../components/NextUpList';
import { NowCard } from '../components/NowCard';
import { SettingsSheet } from '../components/SettingsSheet';
import { TodayStrip } from '../components/TodayStrip';
import { useNowTicker } from '../hooks/useNowTicker';
import { usePersistedState } from '../hooks/usePersistedState';
import { useSchedule } from '../hooks/useSchedule';
import type { Slot } from '../logic/scheduleEngine';
import { TIME_ZONE, addDaysToDateInZone, formatTimer, getDayKeyInZone } from '../logic/time';

type ThemeMode = 'light' | 'dark';

type AppSettings = {
  theme: ThemeMode;
  anchorDateLocal: string;
  remindersEnabled: boolean;
  reminderMinutes: number;
};

const STORAGE_KEY = 'power-schedule:settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  anchorDateLocal: '2025-12-09',
  remindersEnabled: false,
  reminderMinutes: 10,
};

function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(12);
  }
}

export default function App() {
  const now = useNowTicker(true);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [settings, setSettings] = usePersistedState<AppSettings>(STORAGE_KEY, DEFAULT_SETTINGS);
  const [detailsSlot, setDetailsSlot] = useState<Slot | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  const prefersReducedMotion = useReducedMotion();
  const notificationSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | 'unsupported'>(
      notificationSupported ? Notification.permission : 'unsupported',
    );
  const reminderSentRef = useRef<string>('');

  const { daySchedule, nowState, isToday } = useSchedule({
    selectedDate,
    now,
    anchorDateLocal: settings.anchorDateLocal,
  });

  const selectedDayKey = getDayKeyInZone(selectedDate, TIME_ZONE);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    if (!notificationSupported) {
      return;
    }
    setNotificationPermission(Notification.permission);
  }, [notificationSupported]);

  useEffect(() => {
    setDetailsSlot(null);
  }, [selectedDayKey]);

  useEffect(() => {
    if (!notificationSupported || notificationPermission !== 'granted' || !settings.remindersEnabled || !nowState.isLive) {
      return;
    }

    const thresholdMs = settings.reminderMinutes * 60 * 1000;
    const msUntilChange = nowState.nextChangeAt.getTime() - now.getTime();
    const key = `${nowState.nextChangeAt.getTime()}-${settings.reminderMinutes}`;

    if (msUntilChange <= thresholdMs && msUntilChange > thresholdMs - 1000 && reminderSentRef.current !== key) {
      const title = 'Power Schedule Reminder';
      const body = `${nowState.nextChangeLabel} (${settings.reminderMinutes} min left)`;
      new Notification(title, { body, tag: key });
      reminderSentRef.current = key;
    }
  }, [
    notificationPermission,
    notificationSupported,
    now,
    nowState.isLive,
    nowState.nextChangeAt,
    nowState.nextChangeLabel,
    settings.reminderMinutes,
    settings.remindersEnabled,
  ]);

  const handleDayShift = useCallback((delta: number) => {
    setDirection(delta);
    setSelectedDate((current) => addDaysToDateInZone(current, delta, TIME_ZONE));
    triggerHaptic();
  }, []);

  const handleToday = useCallback(() => {
    setDirection(0);
    setSelectedDate(new Date());
    triggerHaptic();
  }, []);

  const handleThemeChange = useCallback((theme: ThemeMode) => {
    setSettings((previous) => ({ ...previous, theme }));
    triggerHaptic();
  }, [setSettings]);

  const handleAnchorDateChange = useCallback((anchorDateLocal: string) => {
    setSettings((previous) => ({ ...previous, anchorDateLocal }));
  }, [setSettings]);

  const handleRemindersEnabledChange = useCallback(
    async (enabled: boolean) => {
      let nextEnabled = enabled;

      if (enabled && notificationSupported && Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission !== 'granted') {
          nextEnabled = false;
        }
      }

      setSettings((previous) => ({ ...previous, remindersEnabled: nextEnabled }));
      triggerHaptic();
    },
    [notificationSupported, setSettings],
  );

  const handleReminderMinutesChange = useCallback((minutes: number) => {
    setSettings((previous) => ({ ...previous, reminderMinutes: minutes }));
  }, [setSettings]);

  const countdownText = useMemo(() => formatTimer(nowState.secondsRemaining), [nowState.secondsRemaining]);

  return (
    <>
      <div className="app-shell">
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={selectedDayKey}
            className="dashboard"
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : direction >= 0 ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: prefersReducedMotion ? 0 : direction >= 0 ? -24 : 24 }}
            transition={{ duration: prefersReducedMotion ? 0.16 : 0.24 }}
          >
            <DateSwiper
              selectedDate={selectedDate}
              isToday={isToday}
              onShiftDay={handleDayShift}
              onToday={handleToday}
              onOpenSettings={() => {
                setSettingsOpen(true);
                triggerHaptic();
              }}
            />

            <NowCard
              mode={nowState.mode}
              pattern={nowState.pattern}
              dayLabel={nowState.dayLabel}
              timer={countdownText}
              nextChangeLabel={nowState.nextChangeLabel}
              nextChangeAt={nowState.nextChangeAt}
              isLive={nowState.isLive}
            />

            <section className="panel countdown-panel">
              <div className="panel-header compact">
                <h2>{nowState.isLive ? 'Remaining Window' : 'Preview Mode'}</h2>
                <span>{nowState.isLive ? `${Math.round(nowState.progressRemainingPct)}% left` : 'Not live'}</span>
              </div>
              <CountdownBar remainingPct={nowState.isLive ? nowState.progressRemainingPct : 0} isLive={nowState.isLive} />
            </section>

            <TodayStrip
              slots={daySchedule}
              now={now}
              isLive={nowState.isLive}
              onSelectSlot={(slot) => {
                setDetailsSlot(slot);
                triggerHaptic();
              }}
            />

            <NextUpList items={nowState.upcomingToday} />
          </motion.main>
        </AnimatePresence>
      </div>

      <DetailsSheet
        slot={detailsSlot}
        onClose={() => {
          setDetailsSlot(null);
          triggerHaptic();
        }}
      />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          triggerHaptic();
        }}
        theme={settings.theme}
        onThemeChange={handleThemeChange}
        anchorDateLocal={settings.anchorDateLocal}
        onAnchorDateChange={handleAnchorDateChange}
        notificationsSupported={notificationSupported}
        notificationPermission={notificationPermission}
        remindersEnabled={settings.remindersEnabled}
        onRemindersEnabledChange={handleRemindersEnabledChange}
        reminderMinutes={settings.reminderMinutes}
        onReminderMinutesChange={handleReminderMinutesChange}
      />
    </>
  );
}
