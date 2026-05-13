import { SunIcon, MoonIcon, GlobeIcon } from './Icons';

export function SettingsView({
  todayPattern,
  onTodayPatternChange,
  showGenerator,
  onShowGeneratorChange,
  theme,
  onThemeToggle,
  language,
  onLanguageToggle,
  translations,
}) {
  const t = translations[language];

  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <main className="settings-view">
      <header className="settings-header">
        <p className="settings-eyebrow">{t.settings}</p>
        <h1 className="settings-title">{t.schedule_settings}</h1>
      </header>

      <section className="settings-section">
        <h2 className="section-title">{t.appearance}</h2>

        <div className="setting-row">
          <div className="setting-info">
            <h3>{t.theme}</h3>
            <p>{theme === 'dark' ? t.dark : t.light}</p>
          </div>
          <button
            className="icon-toggle"
            onClick={() => {
              vibrate();
              onThemeToggle();
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <h3>{t.language}</h3>
            <p>{language === 'en' ? 'English' : 'မြန်မာ'}</p>
          </div>
          <button
            className="icon-toggle"
            onClick={() => {
              vibrate();
              onLanguageToggle();
            }}
            aria-label="Toggle language"
          >
            <GlobeIcon />
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="section-title">{t.schedule_settings}</h2>

        <div className="setting-row column">
          <div className="setting-info full">
            <h3>{t.today_pattern}</h3>
            <p>{t.today_pattern_desc}</p>
          </div>
          <div className="segmented" role="group" aria-label="Today pattern">
            {['A', 'B'].map((p) => (
              <button
                key={p}
                className={todayPattern === p ? 'on' : ''}
                onClick={() => {
                  vibrate();
                  onTodayPatternChange(p);
                }}
              >
                Pattern {p}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <h3>{t.generator_schedule}</h3>
            <p>{t.generator_schedule_desc}</p>
          </div>
          <button
            className={`switch ${showGenerator ? 'on' : ''}`}
            role="switch"
            aria-checked={showGenerator}
            onClick={() => {
              vibrate();
              onShowGeneratorChange(!showGenerator);
            }}
          >
            <span className="switch-thumb"></span>
          </button>
        </div>
      </section>
    </main>
  );
}
