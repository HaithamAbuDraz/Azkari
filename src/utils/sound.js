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
   High-performance preloading pool & instant playback
───────────────────────────────────────────────────────────── */
let adhanAudio = null;
let takbeeratTimeout = null;
const audioPool = new Map();

/**
 * Preloads an audio file in the background so it plays with zero lag.
 */
export function preloadAdhanAudio(url) {
  if (typeof window === 'undefined' || !url) return;
  if (audioPool.has(url)) return;

  try {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
    audio.load();
    audioPool.set(url, audio);
  } catch {
    // Ignore preload errors
  }
}

/**
 * Plays Adhan audio with sub-second instant startup.
 * Uses pre-buffered audio pool.
 * @param {string} audioUrl
 * @param {() => void} [onEnded]
 * @param {number} [maxDurationSec]
 * @param {boolean} [allowFallback]
 */
export function playAdhanAudio(
  audioUrl = '/assets/audio/adhan.mp3',
  onEnded,
  maxDurationSec = 0,
  allowFallback = false
) {
  if (typeof window === 'undefined')
    return Promise.reject(new Error('No window'));

  // Stop active audio
  stopAdhanAudio();

  try {
    let audio = audioPool.get(audioUrl);

    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
      audio.src = audioUrl;
      audioPool.set(audioUrl, audio);
    }

    adhanAudio = audio;
    audio.currentTime = 0;

    if (onEnded) {
      const handleEnded = () => {
        audio.removeEventListener('ended', handleEnded);
        onEnded();
      };
      audio.addEventListener('ended', handleEnded, { once: true });
    }

    if (maxDurationSec > 0) {
      takbeeratTimeout = setTimeout(() => {
        stopAdhanAudio();
        if (onEnded) onEnded();
      }, maxDurationSec * 1000);
    }

    const playPromise = audio.play();

    // Only apply fallback when explicitly allowed (e.g. automatic prayer time alert)
    // and give remote CDN a reasonable 6s window so we don't hijack user previews.
    if (
      allowFallback &&
      audioUrl !== '/assets/audio/adhan.mp3' &&
      playPromise
    ) {
      const fallbackTimer = setTimeout(() => {
        if (audio.readyState < 2 && adhanAudio === audio) {
          console.warn(
            'Remote Adhan CDN lagging, switching to instant local audio'
          );
          playAdhanAudio(
            '/assets/audio/adhan.mp3',
            onEnded,
            maxDurationSec,
            false
          );
        }
      }, 6000);

      playPromise
        .then(() => clearTimeout(fallbackTimer))
        .catch(() => clearTimeout(fallbackTimer));
    }

    return playPromise;
  } catch (err) {
    if (allowFallback && audioUrl !== '/assets/audio/adhan.mp3') {
      return playAdhanAudio(
        '/assets/audio/adhan.mp3',
        onEnded,
        maxDurationSec,
        false
      );
    }
    return Promise.reject(err);
  }
}

export function stopAdhanAudio() {
  if (takbeeratTimeout) {
    clearTimeout(takbeeratTimeout);
    takbeeratTimeout = null;
  }
  if (adhanAudio) {
    try {
      adhanAudio.pause();
      adhanAudio.currentTime = 0;
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
