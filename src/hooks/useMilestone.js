import { useEffect, useRef, useState } from 'react';
import { triggerHaptic } from '../utils/haptics';

/**
 * Increments a pulse key and triggers light haptic feedback when progress
 * crosses 25%, 50%, or 75% thresholds.
 */
export function useMilestone(progressPercent) {
  const [glowKey, setGlowKey] = useState(0);
  const prevPct = useRef(progressPercent);

  useEffect(() => {
    const milestones = [25, 50, 75];
    const crossed = milestones.some(
      (m) => prevPct.current < m && progressPercent >= m
    );
    if (crossed) {
      setGlowKey((k) => k + 1);
      triggerHaptic(12);
    }
    prevPct.current = progressPercent;
  }, [progressPercent]);

  return glowKey;
}
