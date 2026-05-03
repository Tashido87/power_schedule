import { useState, useEffect } from 'react';

export function useLanguage() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('powerSched_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('powerSched_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'mm' : 'en');
  };

  return { language, toggleLanguage };
}
