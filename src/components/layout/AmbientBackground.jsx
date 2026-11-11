import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Global ambient background layer featuring softly floating gradient orbs
 * across every page of Azkari. Honors `prefers-reduced-motion` by pausing drift.
 */
export default function AmbientBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className='fixed inset-0 pointer-events-none overflow-hidden z-0'
      aria-hidden='true'>
      {/* Top-right warm gold orb */}
      <motion.div
        className='absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full'
        style={{
          background:
            'radial-gradient(circle, rgba(197,161,91,0.08) 0%, transparent 70%)',
        }}
        animate={
          shouldReduceMotion
            ? { opacity: 0.65 }
            : {
                x: [0, -24, 12, 0],
                y: [0, 18, -10, 0],
                scale: [1, 1.12, 1],
                opacity: [0.6, 0.95, 0.6],
              }
        }
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center-left sage forest orb */}
      <motion.div
        className='absolute top-1/3 -left-24 w-[400px] h-[400px] rounded-full'
        style={{
          background:
            'radial-gradient(circle, rgba(145,182,156,0.09) 0%, transparent 70%)',
        }}
        animate={
          shouldReduceMotion
            ? { opacity: 0.6 }
            : {
                x: [0, 22, -8, 0],
                y: [0, -28, 14, 0],
                scale: [1, 1.09, 1],
                opacity: [0.5, 0.9, 0.5],
              }
        }
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5,
        }}
      />

      {/* Bottom-center accent gold orb */}
      <motion.div
        className='absolute -bottom-32 left-1/2 -translate-x-1/2 w-[440px] h-[300px] rounded-full'
        style={{
          background:
            'radial-gradient(circle, rgba(197,161,91,0.06) 0%, transparent 70%)',
        }}
        animate={
          shouldReduceMotion
            ? { opacity: 0.5 }
            : {
                x: [0, -18, 18, 0],
                y: [0, -16, 8, 0],
                scale: [1, 1.14, 1],
                opacity: [0.45, 0.85, 0.45],
              }
        }
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />
    </div>
  );
}
