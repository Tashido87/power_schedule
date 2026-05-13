import { ClockIcon, GearIcon } from './Icons';

export function BottomTabs({ activeTab, onTabChange, translations, language }) {
  const t = translations[language];

  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const tabs = [
    { id: 'home', label: t.tab_home, Icon: ClockIcon },
    { id: 'settings', label: t.tab_settings, Icon: GearIcon },
  ];

  return (
    <nav className="bottom-tabs" aria-label="Main navigation">
      {tabs.map((tab) => {
        const { Icon } = tab;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`tab-btn ${active ? 'active' : ''}`}
            onClick={() => {
              vibrate();
              onTabChange(tab.id);
            }}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="tab-pill">
              <Icon />
            </span>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
