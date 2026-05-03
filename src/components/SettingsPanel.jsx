export function SettingsPanel({ isOpen, onClose, todayPattern, onTodayPatternChange, showGenerator, onShowGeneratorChange, language, translations }) {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <section className="settings-panel" onClick={(event) => event.stopPropagation()}>
        <div className="settings-panel-header">
          <div>
            <span className="eyebrow">{t.settings}</span>
            <h2>{t.schedule_settings}</h2>
          </div>
          <button className="settings-close" aria-label="Close settings" onClick={onClose}>×</button>
        </div>

        <div className="setting-card">
          <div className="setting-copy">
            <h3>{t.today_pattern}</h3>
            <p>{t.today_pattern_desc}</p>
          </div>
          <div className="segmented-control" role="group" aria-label="Today pattern">
            {['A', 'B'].map((pattern) => (
              <button
                key={pattern}
                className={todayPattern === pattern ? 'selected' : ''}
                onClick={() => onTodayPatternChange(pattern)}
              >
                Pattern {pattern}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-card setting-card-row">
          <div className="setting-copy">
            <h3>{t.generator_schedule}</h3>
            <p>{t.generator_schedule_desc}</p>
          </div>
          <button
            className={`premium-switch ${showGenerator ? 'on' : ''}`}
            role="switch"
            aria-checked={showGenerator}
            onClick={() => onShowGeneratorChange(!showGenerator)}
          >
            <span></span>
          </button>
        </div>
      </section>
    </div>
  );
}
