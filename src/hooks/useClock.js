import { useState, useEffect } from 'react';

function getClockData() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const timeString = `${h}:${m}:${s}`;

  const hour = now.getHours();
  // Morning (الصباح) from 4:00 AM to 12:00 PM; Evening (المساء) from 12:00 PM to 4:00 AM
  const isMorning = hour >= 4 && hour < 12;
  const period = isMorning ? 'الصباح' : 'المساء';
  const periodEn = isMorning ? 'Morning' : 'Evening';

  const dateStr = now.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    numberingSystem: 'latn',
  });

  const dateStrEn = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return { timeString, period, periodEn, isMorning, dateStr, dateStrEn };
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
