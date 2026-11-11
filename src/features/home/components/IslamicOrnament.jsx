import React from 'react';
import { cn } from '../../../utils/cn';

/**
 * Creates a FontAwesome icon component adapter that respects Lucide-style width
 * sizing classes (w-3.5, w-4, w-5) for consistent layout across all portals.
 * @param {string} faClass
 */
export function createFaIcon(faClass) {
  function FaPortalIcon({ className = '', ...props }) {
    const iconSizeClass = className.includes('w-5')
      ? 'text-[17px]'
      : className.includes('w-3.5')
        ? 'text-[12px]'
        : 'text-[14px]';

    return (
      <span
        aria-hidden='true'
        className={cn(
          'inline-flex items-center justify-center leading-none',
          className
        )}
        {...props}>
        <i className={cn(faClass, 'leading-none', iconSizeClass)} />
      </span>
    );
  }
  FaPortalIcon.displayName = `FaIcon(${faClass})`;
  return FaPortalIcon;
}

export const KaabaIcon = createFaIcon('fas fa-kaaba');

/**
 * 12-fold Girih Islamic geometric mandala rendered in crisp architectural hairlines.
 */
export function GirihMandala({ className = '' }) {
  return (
    <svg
      viewBox='0 0 400 400'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      className={className}>
      {/* Outer sacred geometry rings */}
      <circle
        cx='200'
        cy='200'
        r='192'
        stroke='currentColor'
        strokeWidth='0.6'
        strokeDasharray='4 6'
        opacity='0.45'
      />
      <circle
        cx='200'
        cy='200'
        r='172'
        stroke='currentColor'
        strokeWidth='0.8'
        opacity='0.35'
      />
      <circle
        cx='200'
        cy='200'
        r='128'
        stroke='currentColor'
        strokeWidth='0.6'
        opacity='0.28'
      />

      {/* Overlapping rotated squares forming 8-fold Rub el Hizb */}
      <g
        stroke='currentColor'
        strokeWidth='0.9'
        opacity='0.32'>
        <rect
          x='72'
          y='72'
          width='256'
          height='256'
          rx='4'
        />
        <rect
          x='72'
          y='72'
          width='256'
          height='256'
          rx='4'
          transform='rotate(45 200 200)'
        />
        <rect
          x='102'
          y='102'
          width='196'
          height='196'
          rx='3'
          transform='rotate(22.5 200 200)'
        />
        <rect
          x='102'
          y='102'
          width='196'
          height='196'
          rx='3'
          transform='rotate(67.5 200 200)'
        />
      </g>

      {/* 12-petal architectural star rays */}
      <g
        stroke='currentColor'
        strokeWidth='0.65'
        opacity='0.26'>
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d='M200 28 L218 140 L200 200 L182 140 Z'
            transform={`rotate(${i * 30} 200 200)`}
          />
        ))}
      </g>

      {/* Inner Khatam Rosette */}
      <g
        stroke='currentColor'
        strokeWidth='1'
        opacity='0.4'>
        <path d='M200 112 L218 156 L262 138 L244 182 L288 200 L244 218 L262 262 L218 244 L200 288 L182 244 L138 262 L156 218 L112 200 L156 182 L138 138 L182 156 Z' />
        <circle
          cx='200'
          cy='200'
          r='18'
        />
      </g>
    </svg>
  );
}

/**
 * Architectural horizontal chapter divider with centered 8-point Khatam emblem.
 */
export function KhatamDivider({ label, className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 sm:gap-5 ${className}`}
      aria-hidden={!label}>
      <span className='h-px flex-1 max-w-28 sm:max-w-44 bg-gradient-to-l from-[var(--gold)]/55 via-[var(--gold)]/25 to-transparent' />
      <div className='flex items-center gap-2.5 text-[var(--gold-text)]'>
        <svg
          className='w-4 h-4 sm:w-5 sm:h-5 shrink-0'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'>
          <path d='M12 2l2.4 4.8 5.3-2.1-2.1 5.3 4.8 2.4-4.8 2.4 2.1 5.3-5.3-2.1-2.4 4.8-2.4-4.8-5.3 2.1 2.1-5.3-4.8-2.4 4.8-2.4-2.1-5.3 5.3 2.1z' />
          <circle
            cx='12'
            cy='12'
            r='2.2'
            fill='currentColor'
          />
        </svg>
        {label && (
          <span className='text-xs sm:text-sm font-bold tracking-wide text-[var(--gold-text)] font-tajawal'>
            {label}
          </span>
        )}
      </div>
      <span className='h-px flex-1 max-w-28 sm:max-w-44 bg-gradient-to-r from-[var(--gold)]/55 via-[var(--gold)]/25 to-transparent' />
    </div>
  );
}

/**
 * Corner Arabesque filigree marks for illuminated manuscript frames.
 */
export function ManuscriptCorners() {
  const cornerSvg = (
    <svg
      className='w-6 h-6 text-gold/50 pointer-events-none'
      viewBox='0 0 32 32'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.2'
      aria-hidden='true'>
      <path d='M2 24 V8 Q2 2 8 2 H24' />
      <path
        d='M6 20 V10 Q6 6 10 6 H20'
        opacity='0.55'
      />
      <circle
        cx='6'
        cy='6'
        r='1.5'
        fill='currentColor'
      />
    </svg>
  );

  return (
    <>
      <span className='absolute top-3 right-3 pointer-events-none'>
        {cornerSvg}
      </span>
      <span className='absolute top-3 left-3 -scale-x-100 pointer-events-none'>
        {cornerSvg}
      </span>
      <span className='absolute bottom-3 right-3 -scale-y-100 pointer-events-none'>
        {cornerSvg}
      </span>
      <span className='absolute bottom-3 left-3 scale-[-1] pointer-events-none'>
        {cornerSvg}
      </span>
    </>
  );
}
