import { motion } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

export const Reveal = ({ children, delay = 0, y = 28, className = "", ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.9, ease: EASE, delay }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);

export const LineReveal = ({ lines, className = "", delay = 0.2, inView = false }) => (
  <span className={className}>
    {lines.map((l, i) => (
      <span key={i} className="block overflow-hidden pb-[0.08em]">
        <motion.span
          className="block will-change-transform"
          initial={{ y: "105%" }}
          {...(inView ? { whileInView: { y: 0 }, viewport: { once: true } } : { animate: { y: 0 } })}
          transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.12 }}
        >
          {l}
        </motion.span>
      </span>
    ))}
  </span>
);

export const Ornament = ({ className = "" }) => (
  <svg viewBox="0 0 120 12" className={`h-3 w-28 ${className}`} aria-hidden="true">
    <path d="M0 6h48M72 6h48" stroke="#C5A059" strokeWidth="0.8" />
    <path d="M60 0l6 6-6 6-6-6z" fill="none" stroke="#C5A059" />
    <circle cx="60" cy="6" r="1.6" fill="#C5A059" />
    <circle cx="51" cy="6" r="1.2" fill="#C5A059" />
    <circle cx="69" cy="6" r="1.2" fill="#C5A059" />
  </svg>
);

export const SectionHead = ({ eyebrow, title, children, light = false, testid }) => (
  <div className="max-w-2xl" data-testid={testid}>
    <Reveal><p className={`eyebrow ${light ? "!text-[#C5A059]" : ""}`}>{eyebrow}</p></Reveal>
    <h2 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.02] mt-4 ${light ? "text-[#FAF8F5]" : "text-[#1C1917]"}`}>
      <LineReveal lines={Array.isArray(title) ? title : [title]} inView delay={0} />
    </h2>
    {children && <Reveal delay={0.15}><p className={`mt-5 text-base leading-relaxed ${light ? "text-stone-300" : "text-[#57534E]"}`}>{children}</p></Reveal>}
  </div>
);
