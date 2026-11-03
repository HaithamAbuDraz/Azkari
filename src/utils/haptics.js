/**
 * Triggers device vibration if supported.
 * @param {number|number[]} pattern - Vibration duration in ms or pattern array
 */
export function triggerHaptic(pattern = 20) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if device or permissions disallow
    }
  }
}
