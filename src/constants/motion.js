/**
 * Shared Framer Motion configuration, transitions, and orchestration variants
 * used across all Azkari pages for a unified, calm spiritual motion language.
 */

export const EASE_SPIRITUAL = [0.22, 1, 0.36, 1];

export const PAGE_TRANSITION_VARIANTS = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: EASE_SPIRITUAL },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const CONTAINER_STAGGER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const ITEM_FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: EASE_SPIRITUAL,
    },
  },
};

export const CARD_HOVER_SPRING = {
  type: 'spring',
  stiffness: 290,
  damping: 22,
};

export const MODAL_BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

export const MODAL_PANEL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 12,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export const ACCORDION_VARIANTS = {
  collapsed: { opacity: 0, height: 0, overflow: 'hidden' },
  open: {
    opacity: 1,
    height: 'auto',
    overflow: 'visible',
    transition: { duration: 0.28, ease: EASE_SPIRITUAL },
  },
};

