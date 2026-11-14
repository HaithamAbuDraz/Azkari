import React, {
  useState,
  useCallback,
  useMemo,
  useId,
  useRef,
  useEffect,
} from 'react';
import RollingNumber from './RollingNumber';

/**
 * MisbahaCounter
 *
 * An interactive, 3D glossy circular Misbaha (prayer beads) component.
 * - 33 beads looped on a natural brown string with teal divider beads (11-11-11).
 * - Authentic Minaret/Imam bead and silk tassel anchor at the bottom.
 * - Multi-stop radial gradients and specular highlights for a realistic 3D glass/amber effect.
 * - Physical bead-shifting rotation animation along the thread upon each tap.
 * - Central numerical readout with proportional auto-scaling for any size.
 * - Optimized for dark earthy backgrounds (#15221d / #101b17) and spiritual light palettes.
 */
const MisbahaCounter = React.forwardRef(function MisbahaCounter(
  {
    count = 33,
    target = 33,
    mode = 'decrement', // 'decrement' (target -> 0) or 'increment' (0 -> target)
    onDeduct,
    onReset,
    size = 84, // Pixel diameter (e.g. 84 for Azkar card, 260 for full view)
    showRatio = true,
    label,
    className = '',
    disabled = false,
  },
  ref
) {
  // Unique ID prefix for SVG gradients and filters to prevent collision across multiple instances
  const rawId = useId();
  const uid = useMemo(() => rawId.replace(/[^a-zA-Z0-9]/g, ''), [rawId]);

  // Local state for uncontrolled or standalone usage
  const [internalCount, setInternalCount] = useState(count);
  const [activeBeadIndex, setActiveBeadIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  // Sync count if externally controlled
  const currentCount = onDeduct !== undefined ? count : internalCount;
  const isCompleted =
    mode === 'decrement' ? currentCount <= 0 : currentCount >= target;

  const TOTAL_BEADS = 33;
  const DIVIDER_INDICES = [11, 22]; // Dividing 33 beads into 3 classical sets of 11

  // Track external count changes to trigger physical bead rotation & pulse
  const prevCountRef = useRef(currentCount);

  useEffect(() => {
    if (
      prevCountRef.current !== undefined &&
      prevCountRef.current !== currentCount
    ) {
      if (mode === 'decrement') {
        if (currentCount < prevCountRef.current) {
          // Decrement happened: advance rotation by one bead step
          setRotationAngle((prev) => prev + 360 / TOTAL_BEADS);
          setActiveBeadIndex((prev) => (prev + 1) % TOTAL_BEADS);
          setIsPressed(true);
          const t = setTimeout(() => setIsPressed(false), 160);
          prevCountRef.current = currentCount;
          return () => clearTimeout(t);
        } else if (currentCount >= target) {
          // Reset happened
          setRotationAngle(0);
          setActiveBeadIndex(0);
        }
      } else {
        if (currentCount > prevCountRef.current) {
          // Increment happened
          setRotationAngle((prev) => prev + 360 / TOTAL_BEADS);
          setActiveBeadIndex((prev) => (prev + 1) % TOTAL_BEADS);
          setIsPressed(true);
          const t = setTimeout(() => setIsPressed(false), 160);
          prevCountRef.current = currentCount;
          return () => clearTimeout(t);
        } else if (currentCount <= 0) {
          // Reset happened
          setRotationAngle(0);
          setActiveBeadIndex(0);
        }
      }
      prevCountRef.current = currentCount;
    }
  }, [currentCount, mode, target]);

  // Handle tap / count deduction
  const handleTap = useCallback(
    (e) => {
      if (e) {
        e.stopPropagation?.();
        // Prevent triggering if clicked directly on reset button
        if (e.target.closest('button[data-action="reset"]')) return;
      }
      if (disabled || isCompleted) return;

      if (onDeduct) {
        onDeduct(e);
      } else {
        // Uncontrolled mode
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 160);
        setRotationAngle((prev) => prev + 360 / TOTAL_BEADS);
        setActiveBeadIndex((prev) => (prev + 1) % TOTAL_BEADS);
        setInternalCount((prev) =>
          mode === 'decrement'
            ? Math.max(0, prev - 1)
            : Math.min(target, prev + 1)
        );
      }

      // Haptic vibration if supported on mobile devices
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
    },
    [disabled, isCompleted, onDeduct, mode, target]
  );

  // Handle reset
  const handleReset = useCallback(
    (e) => {
      e?.stopPropagation?.();
      if (onReset) {
        onReset(e);
      } else {
        setInternalCount(mode === 'decrement' ? target : 0);
      }
      setRotationAngle(0);
      setActiveBeadIndex(0);
    },
    [onReset, mode, target]
  );

  // Keyboard accessibility
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleTap(e);
      }
    },
    [handleTap]
  );

  // Generate bead coordinates in a circular loop
  const radius = 88;
  const centerX = 130;
  const centerY = 118;

  const beads = useMemo(() => {
    return Array.from({ length: TOTAL_BEADS }, (_, i) => {
      // Start near top and loop around clockwise
      const angleDeg = (i / TOTAL_BEADS) * 360 - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY + radius * Math.sin(angleRad);

      const isDivider = DIVIDER_INDICES.includes(i);
      const isImamJoiner = i === 0;

      return {
        index: i,
        x,
        y,
        angleDeg,
        isDivider,
        isImamJoiner,
        r: isDivider ? 8.2 : 7.2,
      };
    });
  }, [centerX, centerY, radius]);

  // Scaled dimensions
  const height = size * 1.12;

  return (
    <div
      ref={ref}
      role='button'
      tabIndex={disabled ? -1 : 0}
      data-misbaha-counter='true'
      aria-label={`المسبحة الإلكترونية. العدد: ${currentCount} من ${target}`}
      onKeyDown={handleKeyDown}
      onClick={handleTap}
      style={{ width: `${size}px`, height: `${height}px` }}
      className={`relative select-none shrink-0 flex flex-col items-center justify-center cursor-pointer outline-none group transition-transform active:scale-[0.96] ${
        disabled || isCompleted ? 'opacity-90 cursor-default' : ''
      } ${className}`}>
      {/* ── Vector SVG Canvas ── */}
      <svg
        viewBox='0 0 260 290'
        className='w-full h-full overflow-visible drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]'>
        <defs>
          {/* ── Realistic 3D Amber/Gold Bead Radial Gradient ── */}
          <radialGradient
            id={`goldBeadGrad-${uid}`}
            cx='35%'
            cy='30%'
            r='68%'>
            <stop
              offset='0%'
              stopColor='#fffdfa'
            />
            <stop
              offset='20%'
              stopColor='#fef08a'
            />
            <stop
              offset='55%'
              stopColor='#f59e0b'
            />
            <stop
              offset='85%'
              stopColor='#b45309'
            />
            <stop
              offset='100%'
              stopColor='#78350f'
            />
          </radialGradient>

          {/* ── Active Highlighted Bead Radial Gradient ── */}
          <radialGradient
            id={`activeBeadGrad-${uid}`}
            cx='35%'
            cy='30%'
            r='70%'>
            <stop
              offset='0%'
              stopColor='#ffffff'
            />
            <stop
              offset='25%'
              stopColor='#fed7aa'
            />
            <stop
              offset='60%'
              stopColor='#fb923c'
            />
            <stop
              offset='88%'
              stopColor='#ea580c'
            />
            <stop
              offset='100%'
              stopColor='#9a3412'
            />
          </radialGradient>

          {/* ── Teal Divider Bead Radial Gradient ── */}
          <radialGradient
            id={`tealBeadGrad-${uid}`}
            cx='35%'
            cy='30%'
            r='68%'>
            <stop
              offset='0%'
              stopColor='#f0fdfa'
            />
            <stop
              offset='22%'
              stopColor='#5eead4'
            />
            <stop
              offset='58%'
              stopColor='#0d9488'
            />
            <stop
              offset='85%'
              stopColor='#115e59'
            />
            <stop
              offset='100%'
              stopColor='#134e4a'
            />
          </radialGradient>

          {/* ── Cord / Thread Gradient ── */}
          <linearGradient
            id={`cordGrad-${uid}`}
            x1='0%'
            y1='0%'
            x2='100%'
            y2='100%'>
            <stop
              offset='0%'
              stopColor='#854d0e'
            />
            <stop
              offset='50%'
              stopColor='#a16207'
            />
            <stop
              offset='100%'
              stopColor='#713f12'
            />
          </linearGradient>

          {/* ── Tassel Silk Fringe Linear Gradient ── */}
          <linearGradient
            id={`tasselFringeGrad-${uid}`}
            x1='0%'
            y1='0%'
            x2='0%'
            y2='100%'>
            <stop
              offset='0%'
              stopColor='#b45309'
            />
            <stop
              offset='45%'
              stopColor='#d97706'
            />
            <stop
              offset='80%'
              stopColor='#f59e0b'
            />
            <stop
              offset='100%'
              stopColor='#92400e'
            />
          </linearGradient>

          {/* ── Inner Aura / Subtle Glass Background ── */}
          <radialGradient
            id={`centerGlassGrad-${uid}`}
            cx='50%'
            cy='50%'
            r='50%'>
            <stop
              offset='0%'
              stopColor='rgba(245, 158, 11, 0.09)'
            />
            <stop
              offset='65%'
              stopColor='rgba(245, 158, 11, 0.03)'
            />
            <stop
              offset='100%'
              stopColor='rgba(245, 158, 11, 0)'
            />
          </radialGradient>

          {/* ── Drop Shadow for 3D Depth ── */}
          <filter
            id={`beadShadow-${uid}`}
            x='-30%'
            y='-30%'
            width='170%'
            height='170%'>
            <feDropShadow
              dx='0'
              dy='2'
              stdDeviation='1.6'
              floodColor='#000000'
              floodOpacity='0.42'
            />
          </filter>

          {/* ── Active Bead Luminous Glow ── */}
          <filter
            id={`activeGlow-${uid}`}
            x='-60%'
            y='-60%'
            width='220%'
            height='220%'>
            <feDropShadow
              dx='0'
              dy='0'
              stdDeviation='3.5'
              floodColor='#f59e0b'
              floodOpacity='0.8'
            />
            <feDropShadow
              dx='0'
              dy='1.5'
              stdDeviation='2'
              floodColor='#000000'
              floodOpacity='0.5'
            />
          </filter>
        </defs>

        {/* ── Static Background Center Soft Glow Disk (Dark mode only to avoid yellow tint in Light mode) ── */}
        <circle
          cx={centerX}
          cy={centerY}
          r='72'
          fill={`url(#centerGlassGrad-${uid})`}
          className='pointer-events-none hidden dark:block'
        />

        {/* ── Static Bottom Minaret / Imam Head Bead & Tassel ── */}
        <g
          id={`misbaha-tassel-${uid}`}
          className='transition-all duration-300'>
          {/* Cord Bridge connecting the loop apex to the Imam minaret bead */}
          <line
            x1={centerX - 3}
            y1={centerY + radius - 2}
            x2={centerX - 1.5}
            y2={centerY + radius + 14}
            stroke={`url(#cordGrad-${uid})`}
            strokeWidth='2.8'
            strokeLinecap='round'
          />
          <line
            x1={centerX + 3}
            y1={centerY + radius - 2}
            x2={centerX + 1.5}
            y2={centerY + radius + 14}
            stroke={`url(#cordGrad-${uid})`}
            strokeWidth='2.8'
            strokeLinecap='round'
          />

          {/* Imam / Minaret Ornamental Top Spacer Bead */}
          <circle
            cx={centerX}
            cy={centerY + radius + 14}
            r='5.2'
            fill={`url(#tealBeadGrad-${uid})`}
            stroke='#115e59'
            strokeWidth='0.6'
            filter={`url(#beadShadow-${uid})`}
          />

          {/* Imam Main Carved Column (Minaret Body) */}
          <path
            d={`
              M ${centerX - 4.5} ${centerY + radius + 18}
              L ${centerX + 4.5} ${centerY + radius + 18}
              C ${centerX + 6.5} ${centerY + radius + 25}, ${centerX + 5.5} ${centerY + radius + 32}, ${centerX + 4} ${centerY + radius + 38}
              L ${centerX - 4} ${centerY + radius + 38}
              C ${centerX - 5.5} ${centerY + radius + 32}, ${centerX - 6.5} ${centerY + radius + 25}, ${centerX - 4.5} ${centerY + radius + 18}
              Z
            `}
            fill={`url(#goldBeadGrad-${uid})`}
            stroke='#78350f'
            strokeWidth='0.7'
            filter={`url(#beadShadow-${uid})`}
          />

          {/* Tassel Wrapping Collar Ring */}
          <rect
            x={centerX - 5.5}
            y={centerY + radius + 38}
            width='11'
            height='4.5'
            rx='2.2'
            fill={`url(#tealBeadGrad-${uid})`}
            stroke='#115e59'
            strokeWidth='0.6'
          />

          {/* Hanging Silk Fringe Threads (Fan / Tassel Tail) */}
          <path
            d={`
              M ${centerX - 4.5} ${centerY + radius + 42}
              L ${centerX - 11} ${centerY + radius + 68}
              Q ${centerX} ${centerY + radius + 74} ${centerX + 11} ${centerY + radius + 68}
              L ${centerX + 4.5} ${centerY + radius + 42}
              Z
            `}
            fill={`url(#tasselFringeGrad-${uid})`}
            opacity='0.92'
          />

          {/* Fine Silk Thread Line Details */}
          <line
            x1={centerX - 8}
            y1={centerY + radius + 68}
            x2={centerX - 3}
            y2={centerY + radius + 42}
            stroke='#78350f'
            strokeWidth='0.7'
            opacity='0.5'
          />
          <line
            x1={centerX - 3.5}
            y1={centerY + radius + 70}
            x2={centerX - 1}
            y2={centerY + radius + 42}
            stroke='#fef08a'
            strokeWidth='0.7'
            opacity='0.7'
          />
          <line
            x1={centerX}
            y1={centerY + radius + 71}
            x2={centerX}
            y2={centerY + radius + 42}
            stroke='#fef08a'
            strokeWidth='0.8'
            opacity='0.8'
          />
          <line
            x1={centerX + 3.5}
            y1={centerY + radius + 70}
            x2={centerX + 1}
            y2={centerY + radius + 42}
            stroke='#fef08a'
            strokeWidth='0.7'
            opacity='0.7'
          />
          <line
            x1={centerX + 8}
            y1={centerY + radius + 68}
            x2={centerX + 3}
            y2={centerY + radius + 42}
            stroke='#78350f'
            strokeWidth='0.7'
            opacity='0.5'
          />
        </g>

        {/* ── Rotatable Bead Loop (Rotates on each count deduction) ── */}
        <g
          id={`beads-rotatable-loop-${uid}`}
          style={{
            transformOrigin: `${centerX}px ${centerY}px`,
            transform: `rotate(${rotationAngle}deg)`,
            transition: isPressed
              ? 'transform 140ms ease-out'
              : 'transform 280ms cubic-bezier(0.34, 1.3, 0.64, 1)',
          }}>
          {/* The Circular Brown Thread strung through all beads */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill='none'
            stroke={`url(#cordGrad-${uid})`}
            strokeWidth='3.2'
            strokeLinecap='round'
            className='opacity-90'
          />

          {/* ── 33 Beads Along The Loop ── */}
          {beads.map((bead) => {
            const isActive = bead.index === activeBeadIndex;
            const gradId = isActive
              ? `url(#activeBeadGrad-${uid})`
              : bead.isDivider
                ? `url(#tealBeadGrad-${uid})`
                : `url(#goldBeadGrad-${uid})`;

            return (
              <g
                key={bead.index}
                filter={
                  isActive
                    ? `url(#activeGlow-${uid})`
                    : `url(#beadShadow-${uid})`
                }
                className='transition-transform duration-200'>
                {/* Bead Base Sphere */}
                <circle
                  cx={bead.x}
                  cy={bead.y}
                  r={isActive ? bead.r * 1.22 : bead.r}
                  fill={gradId}
                  stroke={bead.isDivider ? '#115e59' : '#78350f'}
                  strokeWidth={isActive ? '1.2' : '0.6'}
                  className='transition-all duration-200'
                />

                {/* 3D Curved Surface Glossy Specular Highlight */}
                <ellipse
                  cx={bead.x - bead.r * 0.28}
                  cy={bead.y - bead.r * 0.32}
                  rx={bead.r * 0.36}
                  ry={bead.r * 0.22}
                  fill='#ffffff'
                  opacity={isActive ? 0.95 : 0.72}
                  transform={`rotate(-25 ${bead.x - bead.r * 0.28} ${bead.y - bead.r * 0.32})`}
                  className='pointer-events-none'
                />

                {/* Micro Ambient Shadow opposite the light source */}
                <ellipse
                  cx={bead.x + bead.r * 0.24}
                  cy={bead.y + bead.r * 0.28}
                  rx={bead.r * 0.28}
                  ry={bead.r * 0.16}
                  fill='#000000'
                  opacity={0.35}
                  transform={`rotate(-25 ${bead.x + bead.r * 0.24} ${bead.y + bead.r * 0.28})`}
                  className='pointer-events-none'
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* ── Center Numerical Counter Display ── */}
      <div
        className='absolute inset-0 flex items-center justify-center pointer-events-none select-none'
        style={{ transform: `translateY(-${height * 0.09}px)` }}>
        {/* Soft background aura providing subtle contrast in both modes */}
        <div
          className='rounded-full flex items-center justify-center px-2 py-0.5 bg-black/[0.03] dark:bg-amber-500/15 backdrop-blur-[0.5px]'
          style={{
            minWidth: `${size * 0.44}px`,
            minHeight: `${size * 0.44}px`,
            maxWidth: `${size * 0.62}px`,
          }}>
          <div
            dir='ltr'
            className="flex items-baseline justify-center gap-1 font-ibm font-['IBM_Plex_Sans_Arabic'] whitespace-nowrap">
            {/* Main Count: Crisp dark in Light Mode, warm golden glow in Dark Mode */}
            <span
              className={`font-bold leading-none transition-colors ${
                isCompleted
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-stone-900 dark:text-amber-300 dark:drop-shadow-[0_2px_8px_rgba(245,158,11,0.45)]'
              }`}
              style={{
                fontSize: `${
                  target >= 100 || currentCount >= 100
                    ? Math.max(13, size * 0.14)
                    : Math.max(15, size * 0.17)
                }px`,
              }}>
              {isCompleted ? '✓' : currentCount}
            </span>

            {/* Target Count / Ratio: Muted dark slate in Light Mode, soft gold in Dark Mode */}
            {showRatio && !isCompleted && (
              <span
                className='text-stone-500 dark:text-amber-200/60 font-medium opacity-75 leading-none'
                style={{
                  fontSize: `${
                    target >= 100
                      ? Math.max(9, size * 0.065)
                      : Math.max(10, size * 0.075)
                  }px`,
                }}>
                / {target}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default MisbahaCounter;
