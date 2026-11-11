import { DEFAULT_ADHAN_URL } from '../constants/prayers';

// Soft, soothing procedural audio feedback for Tasbih using Web Audio API

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a gentle, organic wooden bead click sound.
 */
export function playTasbihClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Subtle pitch drop simulating a soft wooden bead tap
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.035);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays a gentle spiritual chime on reaching milestones.
 */
export function playMilestoneChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const startAt = now + idx * 0.08;

      osc.frequency.setValueAtTime(freq, startAt);
      gain.gain.setValueAtTime(0.15, startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(startAt + 0.38);
    });
  } catch {
    // Graceful fallback
  }
}

/* ─────────────────────────────────────────────────────────────
   Adhan Audio & Reminder Player
   Cache API persistence + RAM Blob pool + zero-contention streaming
───────────────────────────────────────────────────────────── */
const AUDIO_CACHE_NAME = 'azkari-audio-v2';

let adhanAudio = null;
let adhanEndedHandler = null;
let takbeeratTimeout = null;
let playbackSeq = 0;
let listPreloadController = null;

const audioPool = new Map(); // url -> HTMLAudioElement
const blobUrlPool = new Map(); // url -> blob: object URL
const inFlightPreloads = new Map(); // url -> { controller, promise }

/**
 * Checks whether an audio URL is already ready in RAM for instantaneous playback.
 */
export function isAdhanAudioReady(url) {
  if (!url) return false;
  if (blobUrlPool.has(url)) return true;
  const pooled = audioPool.get(url);
  return !!(pooled && !pooled.error && pooled.readyState >= 3);
}

/**
 * Aborts background preloads and unfinished streams for other URLs so the
 * actively requested Adhan gets 100% of available network bandwidth.
 */
export function abortOtherPreloads(keepUrl = null) {
  if (listPreloadController) {
    listPreloadController.abort();
    listPreloadController = null;
  }

  for (const [url, entry] of inFlightPreloads.entries()) {
    if (url !== keepUrl) {
      entry.controller.abort();
      inFlightPreloads.delete(url);
    }
  }

  for (const [url, audio] of audioPool.entries()) {
    if (
      url !== keepUrl &&
      audio !== adhanAudio &&
      audio.readyState < 4 &&
      !audio.src.startsWith('blob:')
    ) {
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // Ignore cleanup errors
      }
      audioPool.delete(url);
    }
  }
}

/**
 * Fetches an audio file with low priority, persists it in the browser Cache API,
 * and stores an in-memory Blob URL for instant playback on desktop and mobile.
 */
export function preloadAdhanAudio(url) {
  if (typeof window === 'undefined' || !url) return Promise.resolve(false);
  if (blobUrlPool.has(url)) return Promise.resolve(true);

  const existing = inFlightPreloads.get(url);
  if (existing) return existing.promise;

  const controller = new AbortController();

  const promise = (async () => {
    try {
      let cache = null;
      if ('caches' in window) {
        try {
          cache = await window.caches.open(AUDIO_CACHE_NAME);
          const cachedResponse = await cache.match(url);
          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            if (!controller.signal.aborted && blob.size > 0) {
              blobUrlPool.set(url, URL.createObjectURL(blob));
              return true;
            }
          }
        } catch {
          // Cache API may be unavailable in private/non-secure contexts
        }
      }

      if (controller.signal.aborted) return false;

      const response = await fetch(url, {
        signal: controller.signal,
        priority: 'low',
      });

      if (!response.ok) return false;

      if (cache) {
        try {
          await cache.put(url, response.clone());
        } catch {
          // Ignore quota errors
        }
      }

      const blob = await response.blob();
      if (!controller.signal.aborted && blob.size > 0) {
        blobUrlPool.set(url, URL.createObjectURL(blob));
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      const current = inFlightPreloads.get(url);
      if (current && current.controller === controller) {
        inFlightPreloads.delete(url);
      }
    }
  })();

  inFlightPreloads.set(url, { controller, promise });
  return promise;
}

/**
 * Sequentially warms a list of muezzin URLs in the background without
 * saturating network bandwidth. Automatically yields if user plays an Adhan.
 */
export async function preloadMuezzinList(urls = []) {
  if (typeof window === 'undefined' || !urls.length) return;

  if (listPreloadController) {
    listPreloadController.abort();
  }
  const controller = new AbortController();
  listPreloadController = controller;

  for (const url of urls) {
    if (controller.signal.aborted) break;
    if (!url || blobUrlPool.has(url)) continue;
    await preloadAdhanAudio(url);
  }

  if (listPreloadController === controller) {
    listPreloadController = null;
  }
}

/**
 * Stops the background sequential muezzin preload queue without interrupting
 * active or selected-muezzin audio caching.
 */
export function stopMuezzinListPreload() {
  if (listPreloadController) {
    listPreloadController.abort();
    listPreloadController = null;
  }
}

/**
 * Hydrates the user's saved muezzin audio from Cache API / network during idle time.
 */
export function warmSavedAdhanAudio(
  muezzinList = [],
  storageKey = 'azkari-prayer-muezzin'
) {
  if (typeof window === 'undefined' || !muezzinList.length) return;

  let savedId = muezzinList[0].id;
  try {
    savedId = localStorage.getItem(storageKey) || muezzinList[0].id;
  } catch {
    // Ignore storage read error
  }

  const target = muezzinList.find((m) => m.id === savedId) || muezzinList[0];
  if (target?.url) {
    preloadAdhanAudio(target.url);
  }
}

/**
 * Plays Adhan audio immediately.
 * Uses in-memory Blob URL when cached, or progressive HTTP streaming with zero
 * competing downloads on first play (keeping synchronous user activation).
 * @param {string} audioUrl
 * @param {() => void} [onEnded]
 * @param {number} [maxDurationSec]
 * @param {boolean} [allowFallback]
 */
export function playAdhanAudio(
  audioUrl = DEFAULT_ADHAN_URL,
  onEnded,
  maxDurationSec = 0,
  allowFallback = false
) {
  if (typeof window === 'undefined')
    return Promise.reject(new Error('No window'));

  stopAdhanAudio();
  const currentSeq = ++playbackSeq;
  const cachedBlobUrl = blobUrlPool.get(audioUrl);
  // If not yet in RAM, cancel all background fetches (including for this URL)
  // so progressive <audio> streaming gets 100% of bandwidth without duplicate requests.
  abortOtherPreloads(cachedBlobUrl ? audioUrl : null);

  try {
    let audio = audioPool.get(audioUrl);

    if (audio && audio.error) {
      audioPool.delete(audioUrl);
      audio = null;
    }

    if (audio && cachedBlobUrl && !audio.src.startsWith('blob:')) {
      audio.src = cachedBlobUrl;
    }

    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
      audio.src = cachedBlobUrl || audioUrl;
      audioPool.set(audioUrl, audio);
    }

    adhanAudio = audio;

    // Reset position only when metadata exists to avoid stalling cold streams
    if (audio.readyState > 0 && audio.currentTime !== 0) {
      audio.currentTime = 0;
    }

    if (onEnded) {
      adhanEndedHandler = () => {
        if (currentSeq !== playbackSeq) return;
        audio.removeEventListener('ended', adhanEndedHandler);
        adhanEndedHandler = null;
        adhanAudio = null;
        onEnded();
      };
      audio.addEventListener('ended', adhanEndedHandler, { once: true });
    }

    // Store in Cache API once the browser finishes buffering this stream cleanly
    if (!cachedBlobUrl && !inFlightPreloads.has(audioUrl)) {
      const handleBuffered = () => {
        if (
          !blobUrlPool.has(audioUrl) &&
          !inFlightPreloads.has(audioUrl) &&
          (currentSeq === playbackSeq || audio.readyState >= 4)
        ) {
          preloadAdhanAudio(audioUrl);
        }
      };
      audio.addEventListener('canplaythrough', handleBuffered, { once: true });
    }

    const rawPlayPromise = audio.play();

    const playPromise = Promise.resolve(rawPlayPromise).then(() => {
      if (currentSeq !== playbackSeq) {
        if (audio !== adhanAudio) {
          try {
            audio.pause();
          } catch {
            // Ignore
          }
        }
        return;
      }
      if (maxDurationSec > 0) {
        takbeeratTimeout = setTimeout(() => {
          if (currentSeq !== playbackSeq) return;
          stopAdhanAudio();
          if (onEnded) onEnded();
        }, maxDurationSec * 1000);
      }
    });

    if (allowFallback && audioUrl !== DEFAULT_ADHAN_URL) {
      const fallbackTimer = setTimeout(() => {
        if (
          currentSeq === playbackSeq &&
          audio.readyState < 2 &&
          adhanAudio === audio
        ) {
          console.warn('Adhan audio lagging, switching to default local audio');
          playAdhanAudio(DEFAULT_ADHAN_URL, onEnded, maxDurationSec, false);
        }
      }, 4000);

      playPromise
        .then(() => clearTimeout(fallbackTimer))
        .catch(() => clearTimeout(fallbackTimer));
    }

    return playPromise.catch((err) => {
      if (
        allowFallback &&
        err?.name !== 'AbortError' &&
        err?.name !== 'NotAllowedError' &&
        audioUrl !== DEFAULT_ADHAN_URL &&
        currentSeq === playbackSeq
      ) {
        return playAdhanAudio(
          DEFAULT_ADHAN_URL,
          onEnded,
          maxDurationSec,
          false
        );
      }
      throw err;
    });
  } catch (err) {
    if (allowFallback && audioUrl !== DEFAULT_ADHAN_URL) {
      return playAdhanAudio(DEFAULT_ADHAN_URL, onEnded, maxDurationSec, false);
    }
    return Promise.reject(err);
  }
}

export function stopAdhanAudio() {
  playbackSeq += 1;
  if (takbeeratTimeout) {
    clearTimeout(takbeeratTimeout);
    takbeeratTimeout = null;
  }
  if (adhanAudio) {
    if (adhanEndedHandler) {
      adhanAudio.removeEventListener('ended', adhanEndedHandler);
      adhanEndedHandler = null;
    }
    try {
      adhanAudio.pause();
      if (adhanAudio.readyState > 0) {
        adhanAudio.currentTime = 0;
      }
    } catch {
      // Ignore pause error
    }
    adhanAudio = null;
  }
  stopPrayerReminder();
}

export function isAdhanAudioPlaying() {
  return !!(adhanAudio && !adhanAudio.paused && !adhanAudio.ended);
}

// Pronunciation mapping with diacritics for natural, accurate Arabic TTS
const PRAYER_PRONUNCIATION = {
  الفجر: 'الْفَجْر',
  Fajr: 'الْفَجْر',
  الشروق: 'الشُّرُوق',
  Sunrise: 'الشُّرُوق',
  الظهر: 'الظُّهْر',
  Dhuhr: 'الظُّهْر',
  العصر: 'الْعَصْر',
  Asr: 'الْعَصْر',
  المغرب: 'الْمَغْرِب',
  Maghrib: 'الْمَغْرِب',
  العشاء: 'الْعِشَاء',
  Isha: 'الْعِشَاء',
};

let activeUtterance = null;
let reminderTimer = null;
let cachedVoices = [];

function refreshVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch {
      // Ignore
    }
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }
}

/**
 * Speaks the Arabic prayer reminder:
 * "حَانَ الآنَ مَوْعِدُ أَذَانِ صَلَاةِ {اسم الصلاة}"
 * Accompanied by a soft spiritual chime and auto-dismiss handler.
 */
export function speakPrayerReminder(prayerLabel = 'الصلاة', onEnded) {
  if (typeof window === 'undefined') return;

  stopPrayerReminder();

  // Play gentle spiritual chime
  try {
    playMilestoneChime();
  } catch {
    // Ignore chime error
  }

  const cleanPrayer = (prayerLabel || '').replace(/^صلاة\s+/, '').trim();
  const prayerTashkeel = PRAYER_PRONUNCIATION[cleanPrayer] || cleanPrayer;
  const diacriticsText =
    prayerTashkeel && prayerTashkeel !== 'الصلاة'
      ? `حَانَ الآنَ مَوْعِدُ أَذَانِ صَلَاةِ ${prayerTashkeel}`
      : 'حَانَ الآنَ مَوْعِدُ أَذَانِ الصَّلَاة';

  if (!('speechSynthesis' in window)) {
    if (onEnded) setTimeout(onEnded, 3000);
    return;
  }

  try {
    // Resume audio context/speech queue if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(diacriticsText);
    activeUtterance = utterance; // Prevent Chromium Garbage Collection bug

    utterance.lang = 'ar-SA';
    utterance.rate = 0.88; // Clear, dignified recitation speed
    utterance.pitch = 1.0;

    // Detect best Arabic voice (Saudi, Egyptian, Arab, or generic Arabic)
    const voices = cachedVoices.length
      ? cachedVoices
      : window.speechSynthesis.getVoices() || [];

    const arabicVoice =
      voices.find((v) => v.lang === 'ar-SA') ||
      voices.find(
        (v) =>
          v.lang &&
          (v.lang.toLowerCase().startsWith('ar') ||
            v.lang.toLowerCase().includes('ar'))
      ) ||
      voices.find(
        (v) =>
          /arabic/i.test(v.name) ||
          /hoda/i.test(v.name) ||
          /naayf/i.test(v.name) ||
          /maged/i.test(v.name) ||
          /tarik/i.test(v.name) ||
          /salma/i.test(v.name)
      );

    if (arabicVoice) {
      utterance.voice = arabicVoice;
      utterance.lang = arabicVoice.lang;
    }

    let isFinished = false;
    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      activeUtterance = null;
      if (reminderTimer) {
        clearTimeout(reminderTimer);
        reminderTimer = null;
      }
      if (onEnded) onEnded();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    // Safety timeout: auto-dismiss after 4.5 seconds so UI never gets stuck
    reminderTimer = setTimeout(finish, 4500);

    // Speak within active user interaction
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    activeUtterance = null;
    if (onEnded) onEnded();
  }
}

export function stopPrayerReminder() {
  if (reminderTimer) {
    clearTimeout(reminderTimer);
    reminderTimer = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      activeUtterance = null;
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
