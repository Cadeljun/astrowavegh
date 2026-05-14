import { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const heroTextReveal: Variants = {
  hidden: { opacity: 0, letterSpacing: "0.5em" },
  show: {
    opacity: 1,
    letterSpacing: "0.02em",
    transition: { duration: 1.2, ease: "easeOut" }
  }
};

export const cardHover: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.03,
    transition: { type: "spring", stiffness: 300 }
  }
};

export const standardViewport = { once: true, amount: 0.2 };
