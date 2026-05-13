import { useState } from 'react';
import { Timeline } from './components/Timeline';
import { WeekStrip } from './components/WeekStrip';
import { BottomTabs } from './components/BottomTabs';
import { SettingsView } from './components/SettingsView';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { useSchedule } from './hooks/useSchedule';
import { useSettings } from './hooks/useSettings';
import { TRANSLATIONS } from './utils/translations';
import { isSameDay } from './utils/dateUtils';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { todayPattern, setTodayPattern, showGenerator, setShowGenerator } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('home');
  const { schedule, pattern } = useSchedule(currentDate, todayPattern);
  const t = TRANSLATIONS[language];

  const today = new Date();
  const isToday = isSameDay(currentDate, today);
  const monthName = t.months[currentDate.getMonth()];
  const dayNum = currentDate.getDate();
  const yearNum = currentDate.getFullYear();
  const dateLabel = `${monthName} ${dayNum}, ${yearNum}`;
  const fullWeekday = new Intl.DateTimeFormat(
    language === 'mm' ? 'my-MM' : 'en-US',
    { weekday: 'long' }
  ).format(currentDate);
  const titleLabel = isToday ? t.today : fullWeekday;

  return (
    <div className="app-shell">
      {activeTab === 'home' ? (
        <>
          <div className="app-top">
            <header className="home-header">
              <div className="home-heading">
                <p className="home-date">{dateLabel}</p>
                <h1 className="home-title">{titleLabel}</h1>
              </div>
              <span className="pattern-chip" title="Schedule pattern">
                <span className="pattern-chip-dot"></span>
                Pattern {pattern}
              </span>
            </header>

            <WeekStrip
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              language={language}
            />
          </div>

          <main className="app-scroll">
            <Timeline
              schedule={schedule}
              currentDate={currentDate}
              language={language}
              translations={TRANSLATIONS}
              showGenerator={showGenerator}
            />
          </main>
        </>
      ) : (
        <main className="app-scroll settings-scroll">
          <SettingsView
            todayPattern={todayPattern}
            onTodayPatternChange={setTodayPattern}
            showGenerator={showGenerator}
            onShowGeneratorChange={setShowGenerator}
            theme={theme}
            onThemeToggle={toggleTheme}
            language={language}
            onLanguageToggle={toggleLanguage}
            translations={TRANSLATIONS}
          />
        </main>
      )}

      <BottomTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        translations={TRANSLATIONS}
        language={language}
      />
    </div>
  );
}

export default App;
