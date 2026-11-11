import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';

export default function TasbihRing({
  count,
  target,
  laps,
  isBumping,
  strokeDashoffset,
  tapBtnRef,
  onIncrement,
  ripples,
  totalCount,
}) {
  const pct =
    target > 0 ? Math.min(Math.round((count / target) * 100), 100) : 0;

  return (
    <div
      className='flex flex-col items-center justify-center my-4 sm:my-6 select-none'
      aria-label='عداد التسبيح التفاعلي'>
      {/* Central Circular Counter Unit */}
      <div className='relative w-72 h-72 sm:w-80 sm:h-80 md:w-88 md:h-88 flex items-center justify-center'>
        {/* Ambient glow container */}
        <div
          className='absolute inset-2 rounded-full tasbih-glow-aura pointer-events-none opacity-45 dark:opacity-80 transition-opacity'
          aria-hidden='true'></div>

        {/* SVG Circular Progress Bar */}
        <svg
          className='absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none z-10'
          viewBox='0 0 260 260'>
          <defs>
            <linearGradient
              id='tasbihRingGrad'
              x1='0%'
              y1='0%'
              x2='100%'
              y2='100%'>
              <stop
                offset='0%'
                stopColor='var(--gold)'
              />
              <stop
                offset='60%'
                stopColor='var(--primary)'
              />
              <stop
                offset='100%'
                stopColor='var(--gold-dim)'
              />
            </linearGradient>
            <filter
              id='glowFilter'
              x='-20%'
              y='-20%'
              width='140%'
              height='140%'>
              <feGaussianBlur
                stdDeviation='3'
                result='blur'
              />
              <feComposite
                in='SourceGraphic'
                in2='blur'
                operator='over'
              />
            </filter>
          </defs>

          {/* Background circle track */}
          <circle
            cx='130'
            cy='130'
            r='115'
            fill='none'
            stroke='currentColor'
            strokeWidth='8'
            className='text-border-theme/40'
          />

          {/* Animated Progress Circle */}
          <motion.circle
            cx='130'
            cy='130'
            r='115'
            fill='none'
            stroke='url(#tasbihRingGrad)'
            strokeWidth='9'
            strokeLinecap='round'
            filter='url(#glowFilter)'
            style={{ strokeDasharray: 722 }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>

        {/* Main Tactile Counter Button */}
        <motion.button
          ref={tapBtnRef}
          type='button'
          onClick={onIncrement}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.95 }}
          animate={isBumping ? { scale: [1, 1.045, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 20 }}
          aria-label={`اضغط للتسبيح. العدد الحالي ${count} من ${target}`}
          className='relative z-20 w-[84%] h-[84%] rounded-full overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 border-4 border-gold/30 hover:border-gold/60 bg-gradient-to-b from-bg-card via-bg-elevated to-bg-card shadow-xl group'>
          {/* Top Lap / Progress Info */}
          <div className='flex items-center gap-2 mb-1'>
            <AnimatePresence
              mode='popLayout'
              initial={false}>
              <motion.span
                key={laps}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className='text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20'>
                {laps > 0 ? `الدورة ${laps + 1}` : 'الدورة 1'}
              </motion.span>
            </AnimatePresence>
            <span className='text-[11px] font-mono text-text-muted font-bold'>
              {pct}%
            </span>
          </div>

          {/* Rolling Current Count */}
          <div
            className='h-16 sm:h-20 flex items-center justify-center overflow-hidden my-1'
            aria-live='polite'>
            <AnimatePresence
              mode='popLayout'
              initial={false}>
              <motion.div
                key={count}
                initial={{ opacity: 0, y: -22, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 22, scale: 0.85 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className='text-6xl sm:text-7xl font-extrabold font-mono text-gold tracking-tight leading-none'>
                {count}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Target Goal Display */}
          <div className='text-xs sm:text-sm text-text-muted font-medium mb-2.5'>
            من{' '}
            <strong className='font-mono text-text-main font-bold'>
              {target}
            </strong>
            {totalCount > count && (
              <span className='text-[11px] text-text-muted mr-1.5 font-mono'>
                (المجموع: {totalCount})
              </span>
            )}
          </div>

          {/* CTA: اضغط / أو اضغط Space */}
          <div className='flex flex-col items-center justify-center pt-1 border-t border-border-theme/50 w-36'>
            <div className='flex items-center gap-1.5 text-base sm:text-lg font-bold text-text-main group-hover:text-gold transition-colors'>
              <Fingerprint className='w-4 h-4 text-gold' />
              <span className='font-tajawal'>اضغط</span>
            </div>
            <span className='text-[11px] text-text-muted font-normal mt-0.5 flex items-center gap-1'>
              <span>أو اضغط</span>
              <kbd className='px-1.5 py-0.5 rounded-md bg-bg-deep border border-border-theme text-[10px] font-mono font-bold text-text-main shadow-2xs'>
                Space
              </kbd>
            </span>
          </div>

          {/* Dynamic Ripples */}
          {ripples.map((rip) => (
            <span
              key={rip.id}
              className='ripple'
              style={rip.style}
            />
          ))}
        </motion.button>
      </div>
    </div>
  );
}
