import { useRef } from 'react';
// eslint-disable-next-line no-unused-vars -- `motion` is used via JSX member expressions (<motion.svg>)
import { motion, useScroll, useTransform } from 'framer-motion';

// A kettuvallam (Kerala houseboat) silhouette that glides across the section
// as it scrolls through view — literal reference to the "bridging Kerala and
// Odisha" section it sits in, not abstract decoration.
export const HouseboatCrossing = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const x = useTransform(scrollYProgress, [0, 1], ['-12vw', '112vw']);
  const bob = useTransform(scrollYProgress, (v) => Math.sin(v * 28) * 3);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 overflow-visible z-30" aria-hidden="true">
      <motion.svg
        style={{ x, y: bob }}
        width="150"
        height="70"
        viewBox="0 0 150 70"
        fill="none"
        className="absolute drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
      >
        <path d="M6 52 C 30 62, 120 62, 144 52 L 136 44 C 100 50, 50 50, 14 44 Z" fill="#0E211B" />
        <path
          d="M28 44 C 30 22, 42 12, 56 12 L 56 44 Z M60 44 C 60 12, 74 10, 90 16 C 100 20, 104 30, 104 44 Z"
          fill="#C89A42"
          opacity="0.92"
        />
        <path d="M28 44 L 104 44" stroke="#0E211B" strokeWidth="1.5" />
        {[36, 44, 52, 60, 68, 76, 84, 92, 100].map((cx) => (
          <line key={cx} x1={cx} y1="14" x2={cx} y2="44" stroke="#0E211B" strokeWidth="0.75" opacity="0.35" />
        ))}
      </motion.svg>
    </div>
  );
};
