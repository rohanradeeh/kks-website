// eslint-disable-next-line no-unused-vars -- `motion` is used via JSX member expression (<motion.div>)
import { motion, useScroll, useSpring } from 'framer-motion';

// A thin gold "zari" (thread-border) line that fills with scroll progress —
// the kasavu saree's gold border, reused as a functional scroll indicator
// rather than pure decoration.
export const ZariProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[200]"
      style={{
        scaleX,
        background: 'repeating-linear-gradient(90deg, #7E5A14 0px, #C89A42 3px, #A97A1F 6px)',
      }}
      aria-hidden="true"
    />
  );
};
