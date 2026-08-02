import { Variants, Transition } from 'framer-motion';

const standardTransition: Transition = {
  duration: 0.25,
  ease: 'easeOut',
};

const slowTransition: Transition = {
  duration: 0.4,
  ease: 'easeOut',
};

const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// ── Fade ──────────────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: standardTransition },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ── Fade Up ───────────────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: slowTransition,
  },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
};

// ── Fade Down ─────────────────────────────────────────────────────────────────

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: slowTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ── Scale In ──────────────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// ── Slide In From Right ───────────────────────────────────────────────────────

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: 16, transition: { duration: 0.2 } },
};

// ── Stagger Container ─────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// ── Page Transition ───────────────────────────────────────────────────────────

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.2 } },
};

// ── Modal Transition ──────────────────────────────────────────────────────────

export const modalTransition: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.2 } },
};

// ── Card Hover ────────────────────────────────────────────────────────────────

export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: { y: -3, boxShadow: '0 12px 32px -8px rgba(0,0,0,0.1)', transition: springTransition },
};

// ── Skeleton Pulse ────────────────────────────────────────────────────────────

export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

// ── Layout Shift ─────────────────────────────────────────────────────────────

export const layoutShift: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

// ── Success Flash ─────────────────────────────────────────────────────────────

export const successFlash: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: springTransition,
  },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
};

// ── Tab Indicator ─────────────────────────────────────────────────────────────

export const tabIndicator: Variants = {
  active: { width: '100%', transition: { duration: 0.2, ease: 'easeOut' } },
  inactive: { width: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

// ── Loading Spinner ───────────────────────────────────────────────────────────

export const spin = {
  animate: { rotate: 360 },
  transition: { duration: 0.8, repeat: Infinity, ease: 'linear' },
};
