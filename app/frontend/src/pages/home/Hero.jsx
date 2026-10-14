import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { LineReveal, EASE } from "@/components/Motion";

const Badge = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full spin-slow" aria-hidden="true">
    <defs><path id="circ" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1 -92 0" /></defs>
    <text fill="#58111A" fontFamily="Cinzel" fontSize="10.5" letterSpacing="3.2">
      <textPath href="#circ">PURE SILK · HANDWOVEN · REAL ZARI ·</textPath>
    </text>
    <path d="M60 48l12 12-12 12-12-12z" fill="#C5A059" />
  </svg>
);

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 70, damping: 16 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 70, damping: 16 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { mx.set(0); my.set(0); };

  return (
    <section ref={ref} onMouseMove={onMove} onMouseLeave={reset} className="relative overflow-hidden silk-bg grain saree-hero" data-testid="home-hero">
      <div className="saree-flow saree-flow-one" aria-hidden="true" />
      <div className="saree-flow saree-flow-two" aria-hidden="true" />
      <div className="saree-flow saree-flow-three" aria-hidden="true" />
      <div className="saree-hero-stamp" aria-hidden="true">Vijay · 1987</div>
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 lg:pt-16 pb-16 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
        <motion.div style={{ y: textY }} className="lg:col-span-7 relative z-10 saree-hero-copy">
          <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease: EASE }} className="eyebrow flex items-center gap-3">
            <span className="w-10 h-px bg-[#C5A059]" /> Handwoven pure silk sarees
          </motion.p>
          <h1 className="font-display font-light text-[#1C1917] mt-6" data-testid="hero-heading">
            <span style={{ fontSize: "clamp(2.4rem, 10vw, 7rem)", lineHeight: 0.88, fontWeight: 600, letterSpacing: "0.01em" }} className="block text-[#58111A]">
              VIJAY HANDLOOMS
            </span>
            <span className="block text-[3.2rem] leading-[0.9] sm:text-7xl lg:text-[5.5rem] lg:leading-[0.86] tracking-[-0.02em] mt-6">
              <LineReveal delay={0.25} lines={[
                "Woven",
                <span key="b" className="pl-[12%]">by hand,</span>,
                "worn as",
                <em key="h" className="text-[#58111A] italic pl-[6%]">heirloom<span className="text-[#C5A059]">.</span></em>,
              ]} />
            </span>
          </h1>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.9 }}
            className="mt-10 grid sm:grid-cols-[1fr_auto] gap-8 items-end max-w-2xl">
            <p className="text-[15px] leading-relaxed text-[#57534E] max-w-md">
              Kanjivaram, Narayanpet and Gadwal sarees — woven thread by thread with real zari, for the moments a family remembers.
            </p>
            <div className="flex flex-wrap gap-3 saree-hero-actions">
              <Link to="/shop" data-testid="hero-shop-btn" className="group inline-flex items-center gap-3 bg-[#58111A] hover:bg-[#3F0A12] text-[#EADBB9] pl-7 pr-5 py-4 font-royal text-[11px] tracking-[0.25em] transition-colors">
                EXPLORE SILKS <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
              </Link>
              <Link to="/try-on" data-testid="hero-tryon-btn" className="inline-flex items-center px-6 py-4 border border-[#58111A]/40 text-[#58111A] font-royal text-[11px] tracking-[0.25em] hover:bg-[#58111A]/5 transition-colors">TRY IT ON</Link>
            </div>
          </motion.div>
        </motion.div>

        <div className="lg:col-span-5 relative saree-hero-portrait" style={{ perspective: 1200 }}>
          <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className="relative mx-auto w-full max-w-[440px]">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
              style={{ transform: "translateZ(-40px)" }} className="absolute -inset-4 sm:-inset-6 arch border border-[#C5A059]/60" />
            <motion.div initial={{ clipPath: "inset(100% 0% 0% 0%)" }} animate={{ clipPath: "inset(0% 0% 0% 0%)" }} transition={{ duration: 1.6, ease: EASE, delay: 0.3 }}
              className="relative arch overflow-hidden h-[64vh] max-h-[620px] min-h-[420px] shadow-[0_40px_80px_-30px_rgba(88,17,26,0.45)]">
              <motion.img style={{ y: imgY, scale: 1.15 }} src="/img/m1.jpg" alt="Model draped in a red and gold Kanjivaram silk saree" className="absolute inset-0 w-full h-full object-cover object-[50%_20%]" data-testid="hero-image" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,transparent_40%,rgba(24,11,14,0.35))]" />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: EASE, delay: 1.2 }}
              style={{ transform: "translateZ(60px)" }} className="absolute -left-6 sm:-left-12 bottom-16 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#FAF8F5]/90 backdrop-blur p-2 border border-[#C5A059]/40">
              <Badge />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 1.4 }}
              style={{ transform: "translateZ(80px)" }} className="absolute -right-2 sm:-right-8 top-24 bg-[#FAF8F5]/95 backdrop-blur border border-[#C5A059]/40 px-4 py-3">
              <Link to="/product/rajakumari-kanjivaram" data-testid="hero-product-chip" className="block">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C6A23]">Now draped</p>
                <p className="font-display text-lg leading-tight">Rajakumari Kanjivaram</p>
                <p className="text-xs text-[#57534E] mt-0.5">₹28,500 →</p>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <div className="zari-diamonds" />
    </section>
  );
}
