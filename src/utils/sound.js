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
   IDM-Safe Blob Fetching + Object URL Session Caching + Fallback
───────────────────────────────────────────────────────────── */

let adhanAudio = null;
let adhanEndedHandler = null;
let takbeeratTimeout = null;
let playbackSeq = 0;
let listPreloadController = null;

// Session Cache: Maps direct audio URL to cached Blob Object URL (blob:...)
// Prevents IDM / download managers from intercepting requests repeatedly
const cachedBlobUrls = new Map();
const inFlightFetches = new Map(); // url -> Promise<string>

/**
 * Checks whether an audio URL is already ready in RAM for instantaneous playback.
 */
export function isAdhanAudioReady(url) {
  if (!url) return false;
  return cachedBlobUrls.has(url);
}

/**
 * Aborts background preloads for other URLs so the active one gets full priority.
 */
export function abortOtherPreloads(keepUrl = null) {
  if (listPreloadController) {
    listPreloadController.abort();
    listPreloadController = null;
  }
  for (const [url, controller] of inFlightFetches.entries()) {
    if (url !== keepUrl && controller?.abort) {
      controller.abort();
      inFlightFetches.delete(url);
    }
  }
}

/**
 * Preloads Adhan audio via fetch(), converts response to a Blob,
 * and creates an internal Object URL (blob:...) stored in a session cache.
 *
 * This completely prevents Internet Download Manager (IDM) and other
 * extensions from hooking into .mp3 media tags and opening download dialogs.
 *
 * @param {string} url - Direct audio URL (e.g. /assets/audio/adhan.mp3)
 * @returns {Promise<string>} - Resolves to the cached blob: URL (or raw url on fallback)
 */
export async function preloadAdhanAudio(url) {
  if (typeof window === 'undefined' || !url) return null;

  // 1. Check if already cached in session
  if (cachedBlobUrls.has(url)) {
    return cachedBlobUrls.get(url);
  }

  // 2. Return existing in-flight request if currently fetching
  if (inFlightFetches.has(url)) {
    return inFlightFetches.get(url);
  }

  const controller = new AbortController();

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'audio/*, application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} fetching audio`);
      }

      // Convert response to Blob
      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Empty audio blob received');
      }

      // Create an internal memory Object URL (blob:...)
      const audioBlob = blob.type.startsWith('audio')
        ? blob
        : new Blob([blob], { type: 'audio/mpeg' });
      const objectUrl = URL.createObjectURL(audioBlob);

      // Cache the Object URL for this session
      cachedBlobUrls.set(url, objectUrl);
      return objectUrl;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      console.warn(
        `[Audio] Fetch as Blob failed for ${url}, fallback to direct audio:`,
        err
      );
      return url; // Fallback to raw URL
    } finally {
      inFlightFetches.delete(url);
    }
  })();

  fetchPromise.abort = () => controller.abort();
  inFlightFetches.set(url, fetchPromise);
  return fetchPromise;
}

/**
 * Sequentially warms a list of muezzin URLs in the background.
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
    if (!url || cachedBlobUrls.has(url)) continue;
    try {
      await preloadAdhanAudio(url);
    } catch {
      // Continue next
    }
  }

  if (listPreloadController === controller) {
    listPreloadController = null;
  }
}

/**
 * Stops background muezzin preload queue.
 */
export function stopMuezzinListPreload() {
  if (listPreloadController) {
    listPreloadController.abort();
    listPreloadController = null;
  }
}

/**
 * Hydrates saved muezzin audio from cache during idle time.
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
    // Ignore
  }

  const target = muezzinList.find((m) => m.id === savedId) || muezzinList[0];
  if (target?.url) {
    preloadAdhanAudio(target.url);
  }
}

/**
 * Plays Adhan audio from the cached Blob Object URL instead of direct .mp3 path.
 * If not preloaded, fetches as Blob first; falls back to standard new Audio(url) if fetch fails.
 *
 * @param {string} audioUrl
 * @param {() => void} [onEnded]
 * @param {number} [maxDurationSec]
 * @param {boolean} [allowFallback]
 */
export async function playAdhanAudio(
  audioUrl = DEFAULT_ADHAN_URL,
  onEnded,
  maxDurationSec = 0,
  allowFallback = false
) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('No window'));
  }

  stopAdhanAudio();
  const currentSeq = ++playbackSeq;

  // 1. Retrieve cached Blob URL, or fetch as Blob on-the-fly to bypass IDM
  let playableSrc = cachedBlobUrls.get(audioUrl);

  if (!playableSrc) {
    try {
      playableSrc = await preloadAdhanAudio(audioUrl);
    } catch {
      playableSrc = audioUrl; // Fallback
    }
  }

  if (currentSeq !== playbackSeq) {
    return;
  }

  const resolvedSource = playableSrc || audioUrl;

  try {
    let audio = new Audio(resolvedSource);
    audio.preload = 'auto';
    adhanAudio = audio;

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

    const rawPlayPromise = audio.play();

    const playPromise = Promise.resolve(rawPlayPromise).then(() => {
      if (currentSeq !== playbackSeq) {
        try {
          audio.pause();
        } catch {
          // Ignore
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

    return playPromise.catch((err) => {
      // 4. Graceful Fallback: if playing blob failed, try standard Audio(audioUrl)
      if (resolvedSource !== audioUrl && currentSeq === playbackSeq) {
        console.warn(
          '[Audio] Playing from Blob failed, falling back to standard Audio(url):',
          err
        );
        return playDirectAudioFallback(
          audioUrl,
          onEnded,
          maxDurationSec,
          currentSeq
        );
      }
      throw err;
    });
  } catch (err) {
    if (resolvedSource !== audioUrl && currentSeq === playbackSeq) {
      return playDirectAudioFallback(
        audioUrl,
        onEnded,
        maxDurationSec,
        currentSeq
      );
    }
    return Promise.reject(err);
  }
}

/**
 * Standard Audio fallback helper if Blob creation/playback encounters an unexpected error.
 */
function playDirectAudioFallback(audioUrl, onEnded, maxDurationSec, seq) {
  try {
    const audio = new Audio(audioUrl);
    adhanAudio = audio;

    if (onEnded) {
      adhanEndedHandler = () => {
        if (seq !== playbackSeq) return;
        audio.removeEventListener('ended', adhanEndedHandler);
        adhanEndedHandler = null;
        adhanAudio = null;
        onEnded();
      };
      audio.addEventListener('ended', adhanEndedHandler, { once: true });
    }

    return audio.play().then(() => {
      if (seq !== playbackSeq) {
        try {
          audio.pause();
        } catch {
          // Ignore
        }
        return;
      }
      if (maxDurationSec > 0) {
        takbeeratTimeout = setTimeout(() => {
          if (seq !== playbackSeq) return;
          stopAdhanAudio();
          if (onEnded) onEnded();
        }, maxDurationSec * 1000);
      }
    });
  } catch (err) {
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
