import { useState, useEffect } from 'react';

function getClockData() {
  const now = new Date();
  const rawHours = now.getHours();
  const hours12 = rawHours % 12 || 12;
  const h = String(hours12).padStart(2, '0');
  const h24 = String(rawHours).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ampm = rawHours >= 12 ? 'PM' : 'AM';
  const ampmAr = rawHours >= 12 ? 'م' : 'ص';

  // 12-hour format with AM/PM indicator: e.g. "02:56:51 PM"
  const timeString = `${h}:${m}:${s} ${ampm}`;
  const timeString24 = `${h24}:${m}:${s}`;
  const timeStringAr = `${h}:${m}:${s} ${ampmAr}`;

  const isMorning = rawHours >= 4 && rawHours < 12;
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

  return {
    timeString,
    timeString24,
    timeStringAr,
    ampm,
    ampmAr,
    period,
    periodEn,
    isMorning,
    dateStr,
    dateStrEn,
  };
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
