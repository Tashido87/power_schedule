import { SunIcon, MoonIcon, SettingsIcon } from './Icons';

export function Header({ pattern, language, onLanguageToggle, theme, onThemeToggle, onSettingsOpen }) {
  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleThemeToggle = () => {
    vibrate();
    onThemeToggle();
  };

  const handleLanguageToggle = () => {
    vibrate();
    onLanguageToggle();
  };

  return (
    <div className="top-nav">
      <div className="brand-pill">
        <span className="dot"></span>
        <span>Pattern {pattern}</span>
      </div>
      <div className="top-nav-actions">
        <button
          className="glass-btn"
          aria-label="Open Settings"
          onClick={onSettingsOpen}
        >
          <SettingsIcon />
        </button>
        <button 
          className="glass-btn" 
          aria-label="Toggle Theme"
          onClick={handleThemeToggle}
        >
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </button>
        <button 
          className="glass-btn"
          onClick={handleLanguageToggle}
        >
          <span className="flag">{language === 'en' ? '🇺🇸' : '🇲🇲'}</span>
        </button>
      </div>
    </div>
  );
}
