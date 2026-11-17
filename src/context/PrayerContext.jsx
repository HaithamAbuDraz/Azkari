import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
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
const AUDIO_UNLOCKED_STORAGE_KEY = 'azkari-audio-unlocked';

export const PrayerContext = createContext(null);

export function PrayerProvider({ children, showToast }) {
  // ── 1. Location & Settings State ──
  const [location, setLocation] = useState(() => {
    if (typeof window === 'undefined') return POPULAR_CITIES[0];
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return POPULAR_CITIES[0];
  });

  const [timings, setTimings] = useState(FALLBACK_TIMINGS);
  const [hijriDate, setHijriDate] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const [audioEnabled, setAudioEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [muezzinId, setMuezzinId] = useState(() => {
    if (typeof window === 'undefined') return MUEZZINS[0].id;
    try {
      const saved = localStorage.getItem(MUEZZIN_STORAGE_KEY);
      return saved || MUEZZINS[0].id;
    } catch {
      return MUEZZINS[0].id;
    }
  });

  const [alertType, setAlertType] = useState(() => {
    if (typeof window === 'undefined') return ALERT_TYPES[0].id;
    try {
      const saved = localStorage.getItem(ALERT_TYPE_STORAGE_KEY);
      return saved || ALERT_TYPES[0].id;
    } catch {
      return ALERT_TYPES[0].id;
    }
  });

  // ── 2. Playback State ──
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const [playingMuezzinId, setPlayingMuezzinId] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [activeAdhanPrayer, setActiveAdhanPrayer] = useState(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // ── 3. Autoplay & Notification Permissions ──
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUDIO_UNLOCKED_STORAGE_KEY) === 'true';
  });

  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window === 'undefined' || !('Notification' in window))
      return 'default';
    return Notification.permission;
  });

  const lastChimedPrayer = useRef(null);
  const resolvedCoordsAttempted = useRef(new Set());
  const playbackReqIdRef = useRef(0);

  // ── 4. Unlocking Audio Object (Autoplay Policy Bypass) ──
  const unlockAudio = useCallback(() => {
    try {
      // Prime an HTML5 Audio object with a tiny silent data URL during user gesture
      const silentAudio = new Audio(
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
      );
      silentAudio.volume = 0.01;
      silentAudio
        .play()
        .then(() => {
          silentAudio.pause();
          silentAudio.currentTime = 0;
          setIsAudioUnlocked(true);
          try {
            localStorage.setItem(AUDIO_UNLOCKED_STORAGE_KEY, 'true');
          } catch {
            // Ignore
          }
        })
        .catch(() => {
          // Will retry on next interaction
        });
    } catch (err) {
      console.warn('Failed to unlock audio context:', err);
    }
  }, []);

  // ── 5. Requesting Notification Permission & Registering Service Worker ──
  const requestNotifications = useCallback(async () => {
    unlockAudio();

    if (typeof window === 'undefined' || !('Notification' in window)) {
      if (showToast) showToast('المتصفح لا يدعم التنبيهات الخارجية');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
        }
        if (showToast) {
          showToast(
            'تم تفعيل تنبيهات الأذان بنجاح <i class="fas fa-check text-gold"></i>'
          );
        }
      }
      return permission;
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return 'denied';
    }
  }, [unlockAudio, showToast]);

  const isInitialLocationMount = useRef(true);

  // ── 6. Persist User Settings ──
  useEffect(() => {
    if (isInitialLocationMount.current) {
      isInitialLocationMount.current = false;
      // If first-time user has no saved location, do not write default yet so onboarding modal triggers
      try {
        if (!localStorage.getItem(LOCATION_STORAGE_KEY)) {
          return;
        }
      } catch {
        // Ignore
      }
    }
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    } catch {
      // Ignore
    }
  }, [location]);

  useEffect(() => {
    try {
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(audioEnabled)
      );
      localStorage.setItem(MUEZZIN_STORAGE_KEY, muezzinId);
      localStorage.setItem(ALERT_TYPE_STORAGE_KEY, alertType);
    } catch {
      // Ignore
    }
  }, [audioEnabled, muezzinId, alertType]);

  // ── 7. Global Timer (Every second) ──
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── 8. Fetch Prayer Times from AlAdhan API with Caching ──
  const fetchPrayerTimes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const d = new Date();
    const dateStr = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    const cacheKey = `azkari-timings-${location.lat.toFixed(2)}-${location.lng.toFixed(2)}-${dateStr}-${location.method || 4}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setTimings(parsed.timings);
        setHijriDate(parsed.date?.hijri || null);
        setMeta(parsed.meta || null);
        setLoading(false);
        return;
      }
    } catch {
      // Cache miss, proceed to network
    }

    try {
      const method = location.method || 4;
      const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${location.lat}&longitude=${location.lng}&method=${method}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('تعذر جلب مواقيت الصلاة من الخادم');

      const json = await res.json();
      if (json.code === 200 && json.data) {
        setTimings(json.data.timings);
        setHijriDate(json.data.date?.hijri || null);
        setMeta(json.data.meta || null);

        try {
          localStorage.setItem(cacheKey, JSON.stringify(json.data));
        } catch {
          // Quota exceeded
        }
      } else {
        throw new Error('بيانات المواقيت غير صالحة');
      }
    } catch (err) {
      console.warn('Network fetch failed, using fallback timings:', err);
      setError('تعذر تحديث المواقيت، يتم استخدام أوقات تقديرية');
      setTimings(FALLBACK_TIMINGS);
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lng, location.method]);

  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  // Resolve City name if GPS location is unresolved
  useEffect(() => {
    if (!isUnresolvedGpsLocation(location)) return;

    const coordKey = `${location.lat.toFixed(3)},${location.lng.toFixed(3)}`;
    if (resolvedCoordsAttempted.current.has(coordKey)) return;
    resolvedCoordsAttempted.current.add(coordKey);

    let active = true;
    resolveLocationByCoords(location.lat, location.lng).then((res) => {
      if (active && res && res.resolvedCity) {
        setLocation((prev) => ({
          ...prev,
          city: res.resolvedCity,
          countryLabel: res.resolvedCountry || prev.countryLabel,
        }));
      }
    });

    return () => {
      active = false;
    };
  }, [location]);

  // ── 9. Calculate Next & Current Prayer Schedule ──
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

    let nextIndex = list.findIndex((item) => item.dateObj > now);
    let nextPrayer = null;
    let prevPrayer = null;
    let isNextTomorrow = false;

    if (nextIndex === -1) {
      isNextTomorrow = true;
      const tomorrowFajr = { ...list[0] };
      const d = new Date(list[0].dateObj);
      d.setDate(d.getDate() + 1);
      tomorrowFajr.dateObj = d;
      nextPrayer = tomorrowFajr;
      prevPrayer = list[list.length - 1];
    } else {
      nextPrayer = list[nextIndex];
      prevPrayer = nextIndex > 0 ? list[nextIndex - 1] : null;
      if (!prevPrayer) {
        const yesterdayIsha = { ...list[list.length - 1] };
        const d = new Date(list[list.length - 1].dateObj);
        d.setDate(d.getDate() - 1);
        yesterdayIsha.dateObj = d;
        prevPrayer = yesterdayIsha;
      }
    }

    const currentPrayer =
      prevPrayer && prevPrayer.key !== 'Sunrise' ? prevPrayer : list[0];
    const diffMs = Math.max(0, nextPrayer.dateObj.getTime() - now.getTime());
    const totalSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const countdownFormatted = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Interval progress calculation
    let progress = 0;
    if (prevPrayer?.dateObj && nextPrayer?.dateObj) {
      const previousTime = prevPrayer.dateObj.getTime();
      const nextTime = nextPrayer.dateObj.getTime();
      const currentTime = now.getTime();
      if (nextTime > previousTime) {
        const rawProgress =
          ((currentTime - previousTime) / (nextTime - previousTime)) * 100;
        progress = isNaN(rawProgress)
          ? 0
          : Math.max(0, Math.min(100, rawProgress));
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

  // ── 10. Selected Muezzin & Preload ──
  const currentMuezzin = useMemo(() => {
    return MUEZZINS.find((m) => m.id === muezzinId) || MUEZZINS[0];
  }, [muezzinId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !currentMuezzin?.url) return;
    const timer = setTimeout(() => {
      preloadAdhanAudio(currentMuezzin.url);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentMuezzin]);

  // ── 11. Audio Controls (Play / Stop Adhan Globally) ──
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

  const startAdhan = useCallback(
    (prayerLabel = 'الصلاة') => {
      // 1. Short voice reminder
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
          console.warn('Adhan autoplay blocked by browser policy:', err);
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

  // ── 12. Global Interval Trigger: Plays Adhan on any route when remaining time hits 0 ──
  useEffect(() => {
    if (!audioEnabled || !prayerSchedule?.nextPrayer) return;

    if (prayerSchedule.totalRemainingSeconds === 0) {
      const key = prayerSchedule.nextPrayer.key;
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

  // ── 13. Sync Prayer Times with Service Worker for Background Notifications ──
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;

    const syncWithServiceWorker = () => {
      if (!navigator.serviceWorker.controller || !prayerSchedule?.list) return;

      const futurePrayers = prayerSchedule.list
        .filter((p) => p.key !== 'Sunrise' && p.dateObj.getTime() > Date.now())
        .map((p) => ({
          key: p.key,
          label: p.label,
          timeMs: p.dateObj.getTime(),
        }));

      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_PRAYERS',
        prayers: futurePrayers,
      });
    };

    if (navigator.serviceWorker.controller) {
      syncWithServiceWorker();
    } else {
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        syncWithServiceWorker,
        { once: true }
      );
    }
  }, [prayerSchedule]);

  // ── 14. Listen for Messages from Service Worker (e.g. notificationclick PLAY_ADHAN) ──
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'PLAY_ADHAN') {
        const prayerName = event.data.prayerLabel || 'الصلاة';
        unlockAudio();
        startAdhan(prayerName);
      }
    };

    navigator.serviceWorker.addEventListener(
      'message',
      handleServiceWorkerMessage
    );
    return () => {
      navigator.serviceWorker.removeEventListener(
        'message',
        handleServiceWorkerMessage
      );
    };
  }, [unlockAudio, startAdhan]);

  // ── 15. Handle URL action when user clicks notification and opens a fresh tab ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'play_adhan') {
      const prayer = params.get('prayer') || 'الصلاة';
      const timer = setTimeout(() => {
        unlockAudio();
        startAdhan(prayer);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [unlockAudio, startAdhan]);

  // ── 16. Location and Method Setters ──
  const selectCity = useCallback((cityItem) => {
    setLocation({ ...cityItem, isGps: false });
  }, []);

  const setMethod = useCallback((methodId) => {
    setLocation((prev) => ({ ...prev, method: methodId }));
  }, []);

  const requestGpsLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      if (showToast) showToast('خاصية تحديد الموقع غير مدعومة في هذا الجهاز');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let resolvedCity = 'موقعي الحالي';
        let resolvedCountry = 'عبر GPS';

        try {
          const res = await resolveLocationByCoords(latitude, longitude);
          if (res?.resolvedCity) {
            resolvedCity = res.resolvedCity;
            resolvedCountry = res.resolvedCountry;
          }
        } catch {
          // Keep default GPS label
        }

        setLocation({
          city: resolvedCity,
          countryLabel: resolvedCountry,
          lat: latitude,
          lng: longitude,
          isGps: true,
          method: location.method || 4,
        });

        setGpsLoading(false);
        if (showToast) {
          showToast(
            `تم تحديد موقعك بدقة: ${resolvedCity} <i class="fas fa-location-crosshairs text-gold"></i>`
          );
        }
      },
      () => {
        setGpsLoading(false);
        if (showToast) {
          showToast('تعذر الوصول إلى موقعك، يرجى تفعيل إذن الموقع في المتصفح');
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  }, [location.method, showToast]);

  // Qibla calculations
  const qibla = useMemo(() => {
    const lat = location.lat ?? POPULAR_CITIES[0].lat;
    const lng = location.lng ?? POPULAR_CITIES[0].lng;
    return {
      direction: calculateQiblaDirection(lat, lng),
      distanceKm: calculateDistanceToKaaba(lat, lng),
    };
  }, [location.lat, location.lng]);

  const value = {
    location,
    timings,
    hijriDate,
    meta,
    loading,
    error,
    gpsLoading,
    prayerSchedule,
    qibla,
    audioEnabled,
    setAudioEnabled,
    muezzinId,
    setMuezzinId,
    currentMuezzin,
    alertType,
    setAlertType,
    isAdhanPlaying,
    playingMuezzinId,
    isAudioLoading,
    activeAdhanPrayer,
    autoplayBlocked,
    isAudioUnlocked,
    notificationPermission,
    startAdhan,
    stopAdhan,
    toggleAdhanTest,
    previewAlert,
    previewMuezzin,
    unlockAudio,
    requestNotifications,
    selectCity,
    setMethod,
    requestGpsLocation,
    refetch: fetchPrayerTimes,
  };

  return (
    <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>
  );
}

export function usePrayerContext() {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayerContext must be used within a PrayerProvider');
  }
  return context;
}
