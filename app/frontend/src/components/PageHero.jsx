import { motion } from "framer-motion";
import { LineReveal, Ornament, EASE } from "@/components/Motion";

export default function PageHero({ eyebrow, title, blurb, image, testid = "page-hero" }) {
  return (
    <section style={{ backgroundImage: "linear-gradient(108deg, rgba(94, 55, 5, 0.94), rgba(177, 126, 20, 0.76) 55%, rgba(63, 32, 5, 0.9)), url('/img/f3.jpg')" }} className="relative overflow-hidden silk-bg saree-page-hero border-b border-[#C5A059]/25" data-testid={testid}>
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-14 sm:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="eyebrow">{eyebrow}</motion.p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-[0.95] mt-4 text-[#1C1917]">
            <LineReveal lines={[title]} delay={0.1} />
          </h1>
          {blurb && <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.35 }} className="mt-5 max-w-xl text-[#57534E] leading-relaxed">{blurb}</motion.p>}
          <Ornament className="mt-6" />
        </div>
        {image && (
          <motion.div initial={{ clipPath: "inset(100% 0 0 0)" }} animate={{ clipPath: "inset(0% 0 0 0)" }} transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
            className="md:col-span-4 h-40 sm:h-56 md:h-64 arch overflow-hidden md:ml-auto w-full md:max-w-[280px]">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
