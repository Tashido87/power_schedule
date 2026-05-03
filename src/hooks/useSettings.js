import { useEffect, useState } from 'react';

export function useSettings() {
  const [todayPattern, setTodayPattern] = useState(() => {
    return localStorage.getItem('powerSched_todayPattern') || 'A';
  });
  const [showGenerator, setShowGenerator] = useState(() => {
    return localStorage.getItem('powerSched_showGenerator') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('powerSched_todayPattern', todayPattern);
  }, [todayPattern]);

  useEffect(() => {
    localStorage.setItem('powerSched_showGenerator', String(showGenerator));
  }, [showGenerator]);

  return {
    todayPattern,
    setTodayPattern,
    showGenerator,
    setShowGenerator
  };
}
