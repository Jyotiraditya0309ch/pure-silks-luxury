import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles, Truck, ShieldCheck, PackageSearch, Gem } from "lucide-react";
import { Reveal, SectionHead, LineReveal, EASE } from "@/components/Motion";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";

const BENTO = [
  { to: "/collections/wedding", t: "Wedding", s: "Heirloom bridal silks", img: "/img/m6.jpg", cls: "md:col-span-7 md:row-span-2", big: true },
  { to: "/collections/pure-silks", t: "Pure Silks", s: "Handwoven & real zari", img: "/img/f3.jpg", cls: "md:col-span-5" },
  { to: "/collections/festive", t: "Festive", s: "For every celebration", img: "/img/m4.jpg", cls: "md:col-span-5" },
  { to: "/collections/handlooms", t: "Handlooms", s: "Made on the pit loom", img: "/img/l1.jpg", cls: "md:col-span-4" },
  { to: "/collections/designer", t: "Designer", s: "The atelier edit", img: "/img/m3.jpg", cls: "md:col-span-4" },
];

const BentoTile = ({ b, i }) => (
  <Reveal delay={i * 0.06} className={`${b.cls} h-[340px] ${b.big ? "md:h-auto" : "md:h-[300px]"}`}>
    <Link to={b.to} data-testid={`bento-${b.t.toLowerCase()}`} className="group relative block w-full h-full overflow-hidden bg-[#180B0E]">
      <img src={b.img} alt={b.t} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-[1600ms] ease-out group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#180B0E]/85 via-[#180B0E]/10 to-transparent" />
      <span className="absolute inset-4 border border-[#EADBB9]/0 group-hover:border-[#EADBB9]/50 transition-colors duration-700" />
      <div className="absolute left-6 right-6 bottom-6 flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#EADBB9]/90">{b.s}</p>
          <p className={`font-display text-[#FAF8F5] font-light leading-none mt-2 ${b.big ? "text-5xl sm:text-7xl" : "text-4xl sm:text-5xl"}`}>{b.t}</p>
        </div>
        <span className="w-11 h-11 rounded-full border border-[#EADBB9]/60 grid place-items-center text-[#EADBB9] transition-all duration-500 group-hover:bg-[#C5A059] group-hover:text-[#180B0E] group-hover:rotate-45">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  </Reveal>
);

export function CollectionsBento() {
  return (
    <section className="max-w-[1440px] mx-auto px-5 sm:px-8 py-20 sm:py-28" data-testid="collections-bento">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <SectionHead eyebrow="The collections" title={["Six rooms,", "one loom house."]} />
        <Reveal><Link to="/categories" className="text-sm tracking-[0.2em] uppercase text-[#58111A] link-underline" data-testid="bento-all-categories">All categories</Link></Reveal>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-[300px_300px_300px] gap-4 sm:gap-5">
        {BENTO.map((b, i) => <BentoTile key={b.t} b={b} i={i} />)}
        <Reveal delay={0.3} className="md:col-span-4 h-[300px]">
          <Link to="/collections/sale" data-testid="bento-offers" className="group relative flex flex-col justify-between w-full h-full bg-[#58111A] p-7 overflow-hidden grain">
            <p className="eyebrow !text-[#C5A059]">Privileges</p>
            <div>
              <p className="font-display text-[#FAF8F5] text-5xl font-light leading-none">Offers</p>
              <p className="text-[#EADBB9] text-sm mt-3">Use <span className="font-royal tracking-widest text-[#C5A059]">SILK10</span> for an extra 10% off.</p>
            </div>
            <span className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full border border-[#C5A059]/40 transition-transform duration-700 group-hover:scale-125" />
            <span className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border border-[#C5A059]/30 transition-transform duration-700 group-hover:scale-150" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function ProductRail({ collection, eyebrow, title, to, testid }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/products", { params: { collection, limit: 4 } })
      .then((r) => setItems(Array.isArray(r.data?.items) ? r.data.items : []))
      .catch(() => setItems([]));
  }, [collection]);
  if (!items.length) return null;
  return (
    <section className="max-w-[1440px] mx-auto px-5 sm:px-8 py-20 sm:py-24" data-testid={testid}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <SectionHead eyebrow={eyebrow} title={title} />
        <Reveal><Link to={to} className="text-sm tracking-[0.2em] uppercase text-[#58111A] link-underline" data-testid={`${testid}-view-all`}>View all</Link></Reveal>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
        {items.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
      </div>
    </section>
  );
}

const STEPS = [
  ["01", "The thread", "Pure silk is sorted, twisted and readied for the loom."],
  ["02", "The dye", "Yarn is hand-dyed in deep, lasting colours — vermilion, emerald, aubergine."],
  ["03", "The weave", "On the pit loom, body, border and pallu come alive with real zari."],
  ["04", "The finish", "Every saree is checked inch by inch before it leaves our house."],
];

export function CraftStory() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  return (
    <section ref={ref} className="relative bg-[#180B0E] text-[#FAF8F5] overflow-hidden grain" data-testid="craft-story">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-20 sm:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14">
        <div className="lg:col-span-5">
          <SectionHead light eyebrow="The craft" title={["Days on the loom,", "decades in", "your wardrobe."]}>
            A single silk saree can take many days to weave by hand. Our weavers carry techniques handed down through families — and it shows in every fold.
          </SectionHead>
          <div className="relative mt-12 h-[360px] sm:h-[460px] overflow-hidden">
            <motion.img style={{ y, scale: 1.25 }} src="/img/l2.jpg" alt="Weaver at a traditional handloom" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 ring-1 ring-inset ring-[#C5A059]/40 m-3" />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7 lg:pt-24">
          {STEPS.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 0.08}>
              <div className="group grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-8 border-t border-[#C5A059]/20 last:border-b">
                <span className="font-display italic text-[#C5A059] text-3xl sm:text-4xl">{n}</span>
                <div>
                  <h3 className="font-display text-3xl sm:text-4xl font-light transition-transform duration-500 group-hover:translate-x-2">{t}</h3>
                  <p className="text-stone-300 mt-2 leading-relaxed max-w-md">{d}</p>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal><Link to="/about" className="inline-block mt-10 text-sm tracking-[0.2em] uppercase text-[#C5A059] link-underline" data-testid="craft-about-link">Our story</Link></Reveal>
        </div>
      </div>
    </section>
  );
}

export function TryOnTeaser() {
  return (
    <section className="max-w-[1440px] mx-auto px-5 sm:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" data-testid="tryon-teaser">
      <div className="lg:col-span-6 grid grid-cols-2 gap-4 order-2 lg:order-1">
        <Reveal className="h-[300px] sm:h-[480px] overflow-hidden arch"><img src="/img/m2.jpg" alt="Saree draped" loading="lazy" className="w-full h-full object-cover" /></Reveal>
        <Reveal delay={0.12} className="h-[300px] sm:h-[480px] overflow-hidden mt-12 relative">
          <img src="/img/f4.jpg" alt="Silk detail" loading="lazy" className="w-full h-full object-cover" />
          <span className="absolute top-4 left-4 inline-flex items-center gap-2 bg-[#FAF8F5]/90 backdrop-blur px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase text-[#58111A]"><Sparkles className="w-3.5 h-3.5" /> AI studio</span>
        </Reveal>
      </div>
      <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2">
        <SectionHead eyebrow="Virtual try-on" title={["See the drape", "before it arrives."]}>
          Upload a photo, choose a saree, and our AI studio drapes it on you — colours, border and pallu included.
        </SectionHead>
        <Reveal delay={0.2}>
          <Link to="/try-on" data-testid="tryon-teaser-btn" className="group mt-8 inline-flex items-center gap-3 bg-[#58111A] hover:bg-[#3F0A12] text-[#EADBB9] pl-7 pr-5 py-4 font-royal text-[11px] tracking-[0.25em] transition-colors">
            OPEN THE STUDIO <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

const PROMISES = [
  [Gem, "Pure silk, real zari", "Woven on handlooms"],
  [Truck, "Shipping across India", "Free above ₹5,000"],
  [ShieldCheck, "Cash on delivery", "Pay when it arrives"],
  [PackageSearch, "Track every order", "From loom to doorstep"],
];

export function Promises() {
  return (
    <section className="border-y border-[#C5A059]/30 bg-[#F3EFEA]" data-testid="promises">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 grid grid-cols-2 lg:grid-cols-4">
        {PROMISES.map(([Icon, t, s], i) => (
          <Reveal key={t} delay={i * 0.06} className={`py-8 sm:py-10 px-2 sm:px-6 flex items-start gap-4 ${i % 2 ? "" : "border-r"} lg:border-r border-[#C5A059]/25 lg:last:border-r-0`}>
            <Icon className="w-6 h-6 text-[#8C6A23] shrink-0" strokeWidth={1.2} />
            <div><p className="font-display text-lg sm:text-xl leading-tight">{t}</p><p className="text-xs text-[#57534E] mt-1">{s}</p></div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Manifesto() {
  return (
    <section className="max-w-[1100px] mx-auto px-5 sm:px-8 py-24 sm:py-36 text-center" data-testid="manifesto">
      <Reveal><p className="eyebrow">Our promise</p></Reveal>
      <p className="font-display font-light text-3xl sm:text-5xl lg:text-6xl leading-[1.12] mt-8 text-[#1C1917]">
        <LineReveal inView delay={0} lines={["Not made for a season.", <span key="2">Made to be <em className="text-[#58111A]">handed down</em> —</span>, "from mother, to daughter, to hers."]} />
      </p>
      <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE }} className="mx-auto mt-12 h-px w-40 bg-[#C5A059] origin-center" />
    </section>
  );
}
