import { useRef } from 'react';
// eslint-disable-next-line no-unused-vars -- `motion` is used via JSX member expressions (<motion.svg>)
import { motion, useScroll, useTransform } from 'framer-motion';

// A kettuvallam (Kerala houseboat) silhouette drifting along the bottom of a
// dark, uncluttered section — like a boat crossing the horizon at dusk on
// the backwaters. Scroll-linked, with a faint reflection and waterline.
export const HouseboatCrossing = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const x = useTransform(scrollYProgress, [0, 1], ['-15vw', '115vw']);
  const bob = useTransform(scrollYProgress, (v) => Math.sin(v * 28) * 2);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-0 bottom-10 md:bottom-14 h-20 overflow-visible z-10" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-6 h-px bg-gold/20" />
      <motion.svg
        style={{ x, y: bob }}
        width="150"
        height="90"
        viewBox="0 0 150 90"
        fill="none"
        className="absolute"
      >
        <g opacity="0.9">
          <path d="M6 52 C 30 62, 120 62, 144 52 L 136 44 C 100 50, 50 50, 14 44 Z" fill="#081511" stroke="#A97A1F" strokeWidth="0.6" />
          <path
            d="M28 44 C 30 22, 42 12, 56 12 L 56 44 Z M60 44 C 60 12, 74 10, 90 16 C 100 20, 104 30, 104 44 Z"
            fill="#C89A42"
          />
          <path d="M28 44 L 104 44" stroke="#081511" strokeWidth="1.5" />
          {[36, 44, 52, 60, 68, 76, 84, 92, 100].map((cx) => (
            <line key={cx} x1={cx} y1="14" x2={cx} y2="44" stroke="#081511" strokeWidth="0.75" opacity="0.4" />
          ))}
        </g>
        <g opacity="0.16" transform="scale(1,-1) translate(0,-104)">
          <path d="M6 52 C 30 62, 120 62, 144 52 L 136 44 C 100 50, 50 50, 14 44 Z" fill="#081511" />
          <path
            d="M28 44 C 30 22, 42 12, 56 12 L 56 44 Z M60 44 C 60 12, 74 10, 90 16 C 100 20, 104 30, 104 44 Z"
            fill="#C89A42"
          />
        </g>
      </motion.svg>
    </div>
  );
};
