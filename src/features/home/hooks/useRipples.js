import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Manages radial click ripple overlays inside a button/container element
 * and cleans up pending timers safely on unmount.
 * @param {React.RefObject<HTMLElement>} containerRef
 */
export function useRipples(containerRef) {
  const [ripples, setRipples] = useState([]);
  const timersRef = useRef(new Set());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
    };
  }, []);

  const spawnRipple = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const hasClientPos = e && typeof e.clientX === 'number' && e.clientX > 0;
      const x = hasClientPos ? e.clientX - rect.left : rect.width / 2;
      const y = hasClientPos ? e.clientY - rect.top : rect.height / 2;
      const size = Math.max(rect.width, rect.height) * 0.85;
      const id = Date.now() + Math.random();

      setRipples((prev) => [
        ...prev,
        {
          id,
          style: {
            width: `${size}px`,
            height: `${size}px`,
            left: `${x - size / 2}px`,
            top: `${y - size / 2}px`,
            background: 'rgba(197, 161, 91, 0.28)',
          },
        },
      ]);

      const timeoutId = setTimeout(() => {
        timersRef.current.delete(timeoutId);
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 520);

      timersRef.current.add(timeoutId);
    },
    [containerRef]
  );

  return { ripples, spawnRipple };
}
