import { AnimatePresence, motion } from 'framer-motion';

type ThemeMode = 'light' | 'dark';

type SettingsSheetProps = {
  open: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  anchorDateLocal: string;
  onAnchorDateChange: (value: string) => void;
  notificationsSupported: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  remindersEnabled: boolean;
  onRemindersEnabledChange: (enabled: boolean) => void;
  reminderMinutes: number;
  onReminderMinutesChange: (minutes: number) => void;
};

export function SettingsSheet({
  open,
  onClose,
  theme,
  onThemeChange,
  anchorDateLocal,
  onAnchorDateChange,
  notificationsSupported,
  notificationPermission,
  remindersEnabled,
  onRemindersEnabledChange,
  reminderMinutes,
  onReminderMinutesChange,
}: SettingsSheetProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close settings"
          />

          <motion.section
            className="sheet settings-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 130, damping: 18 }}
            aria-label="Settings"
          >
            <div className="sheet-handle" />
            <h3>Settings</h3>

            <div className="settings-row">
              <div>
                <strong>Theme</strong>
                <p>Switch between light and dark palette.</p>
              </div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={theme === 'light' ? 'active' : ''}
                  onClick={() => onThemeChange('light')}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={theme === 'dark' ? 'active' : ''}
                  onClick={() => onThemeChange('dark')}
                >
                  Dark
                </button>
              </div>
            </div>

            {notificationsSupported ? (
              <>
                <div className="settings-row">
                  <div>
                    <strong>Reminders</strong>
                    <p>Alert before the next power state change.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={remindersEnabled}
                      onChange={(event) => onRemindersEnabledChange(event.target.checked)}
                    />
                    <span />
                  </label>
                </div>

                <div className="settings-row">
                  <div>
                    <strong>Lead Time</strong>
                    <p>Notify this many minutes before change.</p>
                  </div>
                  <select
                    value={reminderMinutes}
                    onChange={(event) => onReminderMinutesChange(Number(event.target.value))}
                    disabled={!remindersEnabled}
                  >
                    <option value={5}>5 min</option>
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                  </select>
                </div>

                <p className="permission-note">Permission: {notificationPermission}</p>
              </>
            ) : null}

            <details className="advanced-settings">
              <summary>Advanced</summary>
              <div className="settings-row">
                <div>
                  <strong>Anchor Date</strong>
                  <p>Pattern parity baseline in Asia/Yangon.</p>
                </div>
                <input
                  type="date"
                  value={anchorDateLocal}
                  onChange={(event) => onAnchorDateChange(event.target.value)}
                />
              </div>
            </details>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
