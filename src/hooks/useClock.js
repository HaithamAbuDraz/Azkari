import { useState, useEffect } from 'react';

function getClockData() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const timeString = `${h}:${m}:${s}`;

  const hour = now.getHours();
  let period = 'الليل';
  if (hour >= 5 && hour < 12) period = 'الصباح';
  else if (hour >= 12 && hour < 16) period = 'الظهر';
  else if (hour >= 16 && hour < 19) period = 'العصر';
  else if (hour >= 19 && hour < 20) period = 'المغرب';

  const dateStr = now.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    numberingSystem: 'latn',
  });

  return { timeString, period, dateStr };
}

export function useClock() {
  const [clock, setClock] = useState(getClockData);

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(getClockData());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return clock;
}
