// eslint-disable-next-line no-unused-vars -- `motion` is used via JSX member expressions (<motion.svg>, <motion.path>)
import { motion } from 'framer-motion';

// A single continuous-line rendering of a nilavilakku (traditional Kerala
// bell-metal lamp) in the flowing style of Kerala mural line-work. Draws
// itself once, the moment it enters view — the page's one deliberate reveal.
export const MuralLineArt = ({ className = '' }) => {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { pathLength: { duration: 2.2, ease: 'easeInOut' }, opacity: { duration: 0.4 } },
    },
  };

  return (
    <motion.svg
      viewBox="0 0 200 260"
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      aria-hidden="true"
    >
      <motion.path
        d="M100 12
           C 78 12 62 28 62 48
           C 62 64 74 74 88 78
           C 60 86 40 104 40 130
           C 40 150 54 164 74 170
           C 56 178 44 194 44 212
           C 44 228 58 240 78 242
           L 122 242
           C 142 240 156 228 156 212
           C 156 194 144 178 126 170
           C 146 164 160 150 160 130
           C 160 104 140 86 112 78
           C 126 74 138 64 138 48
           C 138 28 122 12 100 12 Z"
        fill="none"
        stroke="#A97A1F"
        strokeWidth="1.75"
        strokeLinecap="round"
        variants={draw}
      />
      <motion.path
        d="M100 208 C 92 194 92 182 100 168 C 108 182 108 194 100 208 Z"
        fill="none"
        stroke="#8B3423"
        strokeWidth="1.75"
        strokeLinecap="round"
        variants={draw}
      />
      <motion.circle cx="100" cy="128" r="3" fill="#A97A1F" variants={draw} />
    </motion.svg>
  );
};
