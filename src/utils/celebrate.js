import confetti from 'canvas-confetti';

const SANCTUARY_COLORS = ['#c5a15b', '#91b69c', '#245b46', '#fafbf6'];

/**
 * Triggers a gentle, celebratory gold-and-emerald confetti burst while
 * automatically respecting the user's reduced-motion OS setting.
 * @param {{ x?: number, y?: number }} [origin]
 */
export function fireSpiritualConfetti(origin = { y: 0.72 }) {
  try {
    confetti({
      particleCount: 42,
      spread: 62,
      startVelocity: 28,
      ticks: 160,
      origin,
      colors: SANCTUARY_COLORS,
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful no-op in non-browser or restricted environments
  }
}

/**
 * Copies text to clipboard and optionally displays a toast confirmation.
 * @param {string} text
 * @param {(msg: string) => void} [onShowToast]
 * @param {string} [toastMessage]
 * @returns {Promise<boolean>}
 */
export async function copyTextWithToast(
  text,
  onShowToast,
  toastMessage = 'تم النسخ إلى الحافظة <i class="fas fa-check text-gold"></i>'
) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      if (onShowToast) onShowToast(toastMessage);
      return true;
    }
  } catch {
    // Clipboard access failed silently
  }
  return false;
}

/**
 * Shares content via the Web Share API when available, falling back cleanly
 * to clipboard copy with toast confirmation.
 * @param {{ title: string, text: string, url?: string }} payload
 * @param {(msg: string) => void} [onShowToast]
 * @param {string} [fallbackToast]
 */
export async function shareWithFallback(payload, onShowToast, fallbackToast) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  const combined = payload.url
    ? `${payload.text}\n\n${payload.url}`
    : payload.text;
  await copyTextWithToast(
    combined,
    onShowToast,
    fallbackToast ||
      'تم نسخ الذكر لمشاركته، الدالّ على الخير كفاعله! <i class="fas fa-share-nodes text-gold"></i>'
  );
}
