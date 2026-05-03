import { useState } from 'react';
import { Header } from './components/Header';
import { HeroStatus } from './components/HeroStatus';
import { Timeline } from './components/Timeline';
import { SettingsPanel } from './components/SettingsPanel';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { useSchedule } from './hooks/useSchedule';
import { useSettings } from './hooks/useSettings';
import { TRANSLATIONS } from './utils/translations';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { todayPattern, setTodayPattern, showGenerator, setShowGenerator } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { schedule, pattern } = useSchedule(currentDate, todayPattern);

  return (
    <>
      <div className="app-background"></div>
      
      <div className="main-layout">
        <header className="status-header">
          <Header
            pattern={pattern}
            language={language}
            onLanguageToggle={toggleLanguage}
            theme={theme}
            onThemeToggle={toggleTheme}
            onSettingsOpen={() => setSettingsOpen(true)}
          />

          <HeroStatus
            schedule={schedule}
            currentDate={currentDate}
            language={language}
            translations={TRANSLATIONS}
            todayPattern={todayPattern}
            showGenerator={showGenerator}
          />
        </header>

        <Timeline
          schedule={schedule}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          language={language}
          translations={TRANSLATIONS}
          showGenerator={showGenerator}
        />

        <SettingsPanel
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          todayPattern={todayPattern}
          onTodayPatternChange={setTodayPattern}
          showGenerator={showGenerator}
          onShowGeneratorChange={setShowGenerator}
          language={language}
          translations={TRANSLATIONS}
        />
      </div>
    </>
  );
}

export default App;
