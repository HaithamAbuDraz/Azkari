import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  POPULAR_CITIES,
  PRAYER_KEYS,
  FALLBACK_TIMINGS,
  calculateQiblaDirection,
  calculateDistanceToKaaba,
  formatPrayerTime12h,
} from '../constants/prayers';
import { playMilestoneChime } from '../utils/sound';

const LOCATION_STORAGE_KEY = 'azkari-prayer-location';
const NOTIFICATIONS_STORAGE_KEY = 'azkari-prayer-audio-enabled';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function usePrayerTimes(showToast) {
  // Load initial location
  const [location, setLocation] = useState(() => {
    if (typeof window === 'undefined') return POPULAR_CITIES[0];
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return POPULAR_CITIES[0]; // Makkah default
  });

  const [timings, setTimings] = useState(FALLBACK_TIMINGS);
  const [hijriDate, setHijriDate] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Audio / notification toggle
  const [audioEnabled, setAudioEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Track if adhan chime was played for the current prayer
  const lastChimedPrayer = useRef(null);

  // Keep live time ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save location changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    } catch {
      // Ignore
    }
  }, [location]);

  // Save audio setting
  useEffect(() => {
    try {
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(audioEnabled)
      );
    } catch {
      // Ignore
    }
  }, [audioEnabled]);

  // Fetch Prayer Times
  const fetchTimings = useCallback(async (loc) => {
    setLoading(true);
    setError(null);

    const todayStr = getTodayKey();
    const locId =
      loc.lat && loc.lng
        ? `${loc.lat.toFixed(2)}_${loc.lng.toFixed(2)}`
        : loc.city;
    const cacheKey = `azkari-timings-cache-${todayStr}-${locId}-${loc.method || 4}`;

    // Check cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.timings && parsed?.date?.hijri) {
          setTimings(parsed.timings);
          setHijriDate(parsed.date.hijri);
          setMeta(parsed.meta);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore cache error
    }

    try {
      let url = '';
      const method = loc.method || 4;

      if (loc.lat && loc.lng) {
        url = `https://api.aladhan.com/v1/timings?latitude=${loc.lat}&longitude=${loc.lng}&method=${method}`;
      } else {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
          loc.city || 'Makkah'
        )}&country=${encodeURIComponent(loc.country || 'Saudi Arabia')}&method=${method}`;
      }

      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error('تعذر جلب المواقيت من الخادم');

      const json = await res.json();
      if (json?.code === 200 && json?.data?.timings) {
        setTimings(json.data.timings);
        setHijriDate(json.data.date?.hijri || null);
        setMeta(json.data.meta || null);

        // Cache for today
        try {
          localStorage.setItem(cacheKey, JSON.stringify(json.data));
        } catch {
          // Ignore
        }
      } else {
        throw new Error('بيانات غير صالحة');
      }
    } catch (err) {
      console.warn('Aladhan fetch failed, using fallback / cache:', err);
      setError('تعذر تحديث المواقيت عبر الإنترنت. يتم عرض المواقيت المحفوظة.');
      // Keep existing timings or fallback
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when location or method changes
  useEffect(() => {
    fetchTimings(location);
  }, [location, fetchTimings]);

  // Request GPS Location
  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (showToast)
        showToast('خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLoc = {
          city: 'موقعي الحالي',
          label: 'موقعي الحالي (GPS)',
          country: '',
          countryLabel: 'تحديد تلقائي',
          lat: latitude,
          lng: longitude,
          method: 4,
          isGps: true,
        };
        setLocation(newLoc);
        setGpsLoading(false);
        if (showToast) {
          showToast(
            'تم تحديد موقعك بنجاح وتحديث مواقيت الصلاة والقبلة <i class="fas fa-check-circle text-gold"></i>'
          );
        }
      },
      (err) => {
        setGpsLoading(false);
        let msg = 'تعذر الوصول لموقعك الجغرافي';
        if (err.code === 1) msg = 'تم رفض الإذن للوصول إلى الموقع الجغرافي';
        else if (err.code === 2) msg = 'الموقع غير متوفر حالياً';
        if (showToast) showToast(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [showToast]);

  // Select a preset city
  const selectCity = useCallback((cityItem) => {
    setLocation({
      ...cityItem,
      isGps: false,
    });
  }, []);

  // Change calculation method
  const setMethod = useCallback((methodId) => {
    setLocation((prev) => ({ ...prev, method: methodId }));
  }, []);

  // Calculate Next & Current Prayer Info
  const prayerSchedule = useMemo(() => {
    if (!timings) return null;

    const list = PRAYER_KEYS.map(({ key, label, icon, desc }) => {
      const rawTime = timings[key] || '12:00';
      const cleanTime = rawTime.split(' ')[0];
      const [h, m] = cleanTime.split(':').map(Number);

      const d = new Date(now);
      d.setHours(h, m, 0, 0);

      return {
        key,
        label,
        icon,
        desc,
        time24: cleanTime,
        time12: formatPrayerTime12h(rawTime),
        dateObj: d,
      };
    });

    // Find next prayer
    let nextIndex = list.findIndex((item) => item.dateObj > now);
    let nextPrayer = null;
    let prevPrayer = null;
    let isNextTomorrow = false;

    if (nextIndex === -1) {
      // All prayers today have passed -> Next prayer is Fajr tomorrow
      isNextTomorrow = true;
      const tomorrowFajr = { ...list[0] };
      const d = new Date(list[0].dateObj);
      d.setDate(d.getDate() + 1);
      tomorrowFajr.dateObj = d;
      nextPrayer = tomorrowFajr;
      prevPrayer = list[list.length - 1]; // Isha today
    } else {
      nextPrayer = list[nextIndex];
      prevPrayer = nextIndex > 0 ? list[nextIndex - 1] : null;
      if (!prevPrayer) {
        // Between midnight and Fajr: prev prayer was Isha yesterday
        const yesterdayIsha = { ...list[list.length - 1] };
        const d = new Date(list[list.length - 1].dateObj);
        d.setDate(d.getDate() - 1);
        yesterdayIsha.dateObj = d;
        prevPrayer = yesterdayIsha;
      }
    }

    // Current prayer is prevPrayer (unless it's Sunrise which is a non-prayer boundary)
    const currentPrayer =
      prevPrayer && prevPrayer.key !== 'Sunrise' ? prevPrayer : list[0];

    // Compute Countdown to next prayer
    const diffMs = Math.max(0, nextPrayer.dateObj.getTime() - now.getTime());
    const totalSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const countdownFormatted = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Interval progress
    let progress = 0;
    if (prevPrayer) {
      const intervalMs =
        nextPrayer.dateObj.getTime() - prevPrayer.dateObj.getTime();
      const elapsedMs = now.getTime() - prevPrayer.dateObj.getTime();
      if (intervalMs > 0) {
        progress = Math.min(1, Math.max(0, elapsedMs / intervalMs));
      }
    }

    return {
      list,
      nextPrayer,
      prevPrayer,
      currentPrayer,
      isNextTomorrow,
      countdownFormatted,
      countdownParts: { hours, minutes, seconds },
      totalRemainingSeconds: totalSec,
      progress,
    };
  }, [timings, now]);

  // Audio chime on prayer arrival
  useEffect(() => {
    if (!audioEnabled || !prayerSchedule?.nextPrayer) return;

    if (prayerSchedule.totalRemainingSeconds === 0) {
      const key = prayerSchedule.nextPrayer.key;
      if (lastChimedPrayer.current !== key) {
        lastChimedPrayer.current = key;
        playMilestoneChime();
        if (showToast) {
          showToast(`حان الآن موعد أذان ${prayerSchedule.nextPrayer.label}`);
        }
      }
    }
  }, [prayerSchedule, audioEnabled, showToast]);

  // Qibla calculations
  const qibla = useMemo(() => {
    const lat = location.lat ?? POPULAR_CITIES[0].lat;
    const lng = location.lng ?? POPULAR_CITIES[0].lng;
    const direction = calculateQiblaDirection(lat, lng);
    const distanceKm = calculateDistanceToKaaba(lat, lng);

    return {
      direction, // 0-360 degrees from North
      distanceKm,
    };
  }, [location.lat, location.lng]);

  return {
    location,
    timings,
    hijriDate,
    meta,
    loading,
    error,
    gpsLoading,
    now,
    audioEnabled,
    setAudioEnabled,
    requestGpsLocation,
    selectCity,
    setMethod,
    refetch: () => fetchTimings(location),
    prayerSchedule,
    qibla,
  };
}
