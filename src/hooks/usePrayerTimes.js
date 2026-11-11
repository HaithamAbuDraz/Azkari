import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  POPULAR_CITIES,
  PRAYER_KEYS,
  MUEZZINS,
  DEFAULT_ADHAN_URL,
  ALERT_TYPES,
  FALLBACK_TIMINGS,
  calculateQiblaDirection,
  calculateDistanceToKaaba,
  formatPrayerTime12h,
} from '../constants/prayers';
import {
  playAdhanAudio,
  preloadAdhanAudio,
  stopAdhanAudio,
  speakPrayerReminder,
  stopPrayerReminder,
  playMilestoneChime,
} from '../utils/sound';
import {
  resolveLocationByCoords,
  isUnresolvedGpsLocation,
} from '../utils/location';

const LOCATION_STORAGE_KEY = 'azkari-prayer-location';
const NOTIFICATIONS_STORAGE_KEY = 'azkari-prayer-audio-enabled';
const MUEZZIN_STORAGE_KEY = 'azkari-prayer-muezzin';
const ALERT_TYPE_STORAGE_KEY = 'azkari-prayer-alert-type';

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

  // Selected muezzin
  const [muezzinId, setMuezzinId] = useState(() => {
    if (typeof window === 'undefined') return MUEZZINS[0].id;
    try {
      const saved = localStorage.getItem(MUEZZIN_STORAGE_KEY);
      return saved || MUEZZINS[0].id;
    } catch {
      return MUEZZINS[0].id;
    }
  });

  // Selected Alert Type (Full Adhan, Short Voice Reminder, Takbeerat, Chime)
  const [alertType, setAlertType] = useState(() => {
    if (typeof window === 'undefined') return ALERT_TYPES[0].id;
    try {
      const saved = localStorage.getItem(ALERT_TYPE_STORAGE_KEY);
      return saved || ALERT_TYPES[0].id;
    } catch {
      return ALERT_TYPES[0].id;
    }
  });

  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const [playingMuezzinId, setPlayingMuezzinId] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [activeAdhanPrayer, setActiveAdhanPrayer] = useState(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Track if adhan was triggered for the current prayer
  const lastChimedPrayer = useRef(null);
  const resolvedCoordsAttempted = useRef(new Set());
  const playbackReqIdRef = useRef(0);

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

  // Save muezzin setting
  useEffect(() => {
    try {
      localStorage.setItem(MUEZZIN_STORAGE_KEY, muezzinId);
    } catch {
      // Ignore
    }
  }, [muezzinId]);

  // Save alert type setting
  useEffect(() => {
    try {
      localStorage.setItem(ALERT_TYPE_STORAGE_KEY, alertType);
    } catch {
      // Ignore
    }
  }, [alertType]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAdhanAudio();
    };
  }, []);

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

  // Backfill real city name if a legacy/unresolved GPS location was loaded from storage
  useEffect(() => {
    if (
      !location?.lat ||
      !location?.lng ||
      !isUnresolvedGpsLocation(location)
    ) {
      return;
    }

    const coordKey = `${location.lat.toFixed(3)}_${location.lng.toFixed(3)}`;
    if (resolvedCoordsAttempted.current.has(coordKey)) return;
    resolvedCoordsAttempted.current.add(coordKey);

    let cancelled = false;
    resolveLocationByCoords(location.lat, location.lng).then((resolved) => {
      if (cancelled || !resolved.label) return;
      setLocation((prev) => ({
        ...resolved,
        method: prev?.method || resolved.method,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [location]);

  // Request GPS Location and resolve real city name
  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (showToast)
        showToast('خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resolvedLoc = await resolveLocationByCoords(
            latitude,
            longitude
          );
          setLocation(resolvedLoc);

          if (showToast) {
            const locationText = resolvedLoc.label
              ? `في مدينة ${resolvedLoc.label}`
              : 'الحالي';
            showToast(
              `تم تحديد موقعك ${locationText} وتحديث مواقيت الصلاة والقبلة <i class="fas fa-check-circle text-gold"></i>`
            );
          }
        } finally {
          setGpsLoading(false);
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

  // Selected muezzin object
  const currentMuezzin = useMemo(() => {
    return MUEZZINS.find((m) => m.id === muezzinId) || MUEZZINS[0];
  }, [muezzinId]);

  // Preload only the currently selected muezzin audio cleanly in the background
  useEffect(() => {
    if (typeof window === 'undefined' || !currentMuezzin?.url) return;
    const timer = setTimeout(() => {
      preloadAdhanAudio(currentMuezzin.url);
    }, 200);
    return () => clearTimeout(timer);
  }, [currentMuezzin]);

  // Stop playing Adhan / Reminder
  const stopAdhan = useCallback(() => {
    playbackReqIdRef.current += 1;
    stopAdhanAudio();
    stopPrayerReminder();
    setIsAdhanPlaying(false);
    setPlayingMuezzinId(null);
    setIsAudioLoading(false);
    setActiveAdhanPrayer(null);
    setAutoplayBlocked(false);
  }, []);

  // Start playing Adhan or Prayer Reminder
  const startAdhan = useCallback(
    (prayerLabel = 'الصلاة') => {
      // 1. Short voice reminder ("حان الآن موعد أذان صلاة {الاسم}")
      if (alertType === 'short_reminder') {
        playbackReqIdRef.current += 1;
        setIsAudioLoading(false);
        setPlayingMuezzinId(null);
        setIsAdhanPlaying(true);
        setActiveAdhanPrayer(prayerLabel);
        setAutoplayBlocked(false);

        speakPrayerReminder(prayerLabel, () => {
          setIsAdhanPlaying(false);
          setActiveAdhanPrayer(null);
        });
        return;
      }

      // 2. Chime only
      if (alertType === 'chime') {
        playMilestoneChime();
        return;
      }

      // 3. Adhan or Takbeerat audio
      const reqId = ++playbackReqIdRef.current;
      const audioUrl =
        currentMuezzin.url || currentMuezzin.fallbackUrl || DEFAULT_ADHAN_URL;

      // Duration limit: 22s for takbeerat mode, full (0) for full adhan
      const maxDuration = alertType === 'takbeerat' ? 22 : 0;

      setPlayingMuezzinId(null);
      setIsAudioLoading(true);
      setAutoplayBlocked(false);

      playAdhanAudio(
        audioUrl,
        () => {
          if (playbackReqIdRef.current !== reqId) return;
          setIsAdhanPlaying(false);
          setIsAudioLoading(false);
          setActiveAdhanPrayer(null);
          setAutoplayBlocked(false);
        },
        maxDuration,
        true
      )
        .then(() => {
          if (playbackReqIdRef.current !== reqId) return;
          setIsAudioLoading(false);
          setIsAdhanPlaying(true);
          setActiveAdhanPrayer(prayerLabel);
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          if (playbackReqIdRef.current !== reqId) return;
          setIsAudioLoading(false);
          setIsAdhanPlaying(false);
          if (err?.name === 'AbortError') return;
          console.warn('Adhan autoplay blocked or failed:', err);
          setActiveAdhanPrayer(prayerLabel);
          setAutoplayBlocked(true);
        });
    },
    [currentMuezzin, alertType]
  );

  // Preview / Toggle Adhan test
  const toggleAdhanTest = useCallback(() => {
    if (isAdhanPlaying || isAudioLoading) {
      stopAdhan();
    } else {
      const nextLabel =
        prayerSchedule?.nextPrayer &&
        prayerSchedule.nextPrayer.key !== 'Sunrise'
          ? prayerSchedule.nextPrayer.label
          : 'الظهر';
      const label = alertType === 'short_reminder' ? nextLabel : 'تجربة الأذان';
      startAdhan(label);
    }
  }, [
    isAdhanPlaying,
    isAudioLoading,
    stopAdhan,
    startAdhan,
    alertType,
    prayerSchedule,
  ]);

  // Preview a specific alert type on demand
  const previewAlert = useCallback(
    (typeId) => {
      stopAdhan();
      const nextLabel =
        prayerSchedule?.nextPrayer &&
        prayerSchedule.nextPrayer.key !== 'Sunrise'
          ? prayerSchedule.nextPrayer.label
          : 'الظهر';

      if (typeId === 'short_reminder') {
        setIsAdhanPlaying(true);
        setActiveAdhanPrayer(nextLabel);
        setAutoplayBlocked(false);
        speakPrayerReminder(nextLabel, () => {
          setIsAdhanPlaying(false);
          setActiveAdhanPrayer(null);
        });
      } else if (typeId === 'chime') {
        playMilestoneChime();
      } else {
        const reqId = ++playbackReqIdRef.current;
        const audioUrl =
          currentMuezzin.url || currentMuezzin.fallbackUrl || DEFAULT_ADHAN_URL;
        const maxDuration = typeId === 'takbeerat' ? 22 : 0;
        setIsAudioLoading(true);
        playAdhanAudio(
          audioUrl,
          () => {
            if (playbackReqIdRef.current !== reqId) return;
            setIsAdhanPlaying(false);
            setIsAudioLoading(false);
            setActiveAdhanPrayer(null);
          },
          maxDuration,
          false
        )
          .then(() => {
            if (playbackReqIdRef.current !== reqId) return;
            setIsAudioLoading(false);
            setIsAdhanPlaying(true);
            setActiveAdhanPrayer('تجربة الأذان');
          })
          .catch((err) => {
            if (playbackReqIdRef.current !== reqId) return;
            setIsAudioLoading(false);
            setIsAdhanPlaying(false);
            if (err?.name !== 'AbortError' && showToast) {
              showToast(
                'تعذر تشغيل صوت الأذان، يرجى التحقق من الاتصال بالإنترنت'
              );
            }
          });
      }
    },
    [stopAdhan, prayerSchedule, currentMuezzin, showToast]
  );

  // Preview a specific muezzin's adhan on demand
  const previewMuezzin = useCallback(
    (targetMuezzinId) => {
      // Toggle off if currently playing or loading this same muezzin
      if (
        playingMuezzinId === targetMuezzinId &&
        (isAdhanPlaying || isAudioLoading)
      ) {
        stopAdhan();
        return;
      }

      stopAdhan();
      const reqId = ++playbackReqIdRef.current;
      setPlayingMuezzinId(targetMuezzinId);
      setIsAudioLoading(true);

      const target =
        MUEZZINS.find((m) => m.id === targetMuezzinId) || currentMuezzin;
      const audioUrl = target.url || target.fallbackUrl || DEFAULT_ADHAN_URL;

      playAdhanAudio(
        audioUrl,
        () => {
          if (playbackReqIdRef.current !== reqId) return;
          setIsAdhanPlaying(false);
          setPlayingMuezzinId(null);
          setIsAudioLoading(false);
          setActiveAdhanPrayer(null);
        },
        0,
        false
      )
        .then(() => {
          if (playbackReqIdRef.current !== reqId) return;
          setIsAudioLoading(false);
          setIsAdhanPlaying(true);
          setActiveAdhanPrayer(`أذان بصوت ${target.name}`);
        })
        .catch((err) => {
          if (playbackReqIdRef.current !== reqId) return;
          setIsAudioLoading(false);
          setIsAdhanPlaying(false);
          setPlayingMuezzinId(null);
          if (err?.name === 'AbortError') return;
          console.warn('Preview muezzin playback error:', err);
          if (showToast) {
            showToast(
              'تعذر تشغيل صوت الأذان، يرجى التحقق من الاتصال بالإنترنت'
            );
          }
        });
    },
    [
      stopAdhan,
      currentMuezzin,
      playingMuezzinId,
      isAdhanPlaying,
      isAudioLoading,
      showToast,
    ]
  );

  // Play Adhan on prayer arrival
  useEffect(() => {
    if (!audioEnabled || !prayerSchedule?.nextPrayer) return;

    if (prayerSchedule.totalRemainingSeconds === 0) {
      const key = prayerSchedule.nextPrayer.key;
      // Skip Sunrise as it is not a prayer call
      if (key === 'Sunrise') return;

      if (lastChimedPrayer.current !== key) {
        lastChimedPrayer.current = key;
        startAdhan(prayerSchedule.nextPrayer.label);
        if (showToast) {
          showToast(
            `حان الآن موعد أذان ${prayerSchedule.nextPrayer.label} <i class="fas fa-mosque text-gold"></i>`
          );
        }
      }
    }
  }, [prayerSchedule, audioEnabled, startAdhan, showToast]);

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
    // Adhan & reminder audio controls
    alertType,
    setAlertType,
    muezzinId,
    setMuezzinId,
    currentMuezzin,
    isAdhanPlaying,
    playingMuezzinId,
    isAudioLoading,
    activeAdhanPrayer,
    autoplayBlocked,
    startAdhan,
    stopAdhan,
    toggleAdhanTest,
    previewAlert,
    previewMuezzin,
  };
}
