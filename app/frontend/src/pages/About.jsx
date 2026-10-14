import PageHero from "@/components/PageHero";
import Marquee from "@/components/Marquee";
import { Reveal, SectionHead } from "@/components/Motion";

const VALUES = [
  ["Authenticity", "Pure silk and real zari, described honestly — what you see is what is woven."],
  ["Craft", "We work with handloom weavers whose skills are passed down through families."],
  ["Care", "Every saree is inspected, folded and packed by hand before it reaches you."],
];

export default function About() {
  return (
    <div data-testid="about-page">
      <PageHero eyebrow="Our house" title="About Us" blurb="A house of handwoven silk — devoted to the loom, the weaver and the woman who drapes it." image="/img/l1.jpg" />
      <section className="max-w-[1440px] mx-auto px-5 sm:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <Reveal className="lg:col-span-5 h-[420px] sm:h-[560px] overflow-hidden arch"><img src="/img/l3.jpg" alt="A traditional handloom" className="w-full h-full object-cover" /></Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <SectionHead eyebrow="The story" title={["Rooted in the", "rhythm of the loom."]} />
          <Reveal delay={0.1}>
            <p className="mt-6 text-[#57534E] leading-relaxed">Vijay Kumar Handlooms Pure Silks brings together the finest handwoven silks — Kanjivaram, soft silks and handloom cottons — chosen for their weave, their zari and the hands that made them.</p>
            <p className="mt-4 text-[#57534E] leading-relaxed" data-testid="about-placeholder">[Add your family story here — founding year, weaving town, and the people behind the house.]</p>
          </Reveal>
        </div>
      </section>
      <Marquee dark />
      <section className="max-w-[1440px] mx-auto px-5 sm:px-8 py-20 sm:py-28 grid grid-cols-1 md:grid-cols-3 gap-10">
        {VALUES.map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.1} className="border-t border-[#C5A059]/50 pt-8">
            <span className="font-display italic text-[#C5A059] text-3xl">0{i + 1}</span>
            <h3 className="font-display text-4xl font-light mt-3">{t}</h3>
            <p className="text-[#57534E] mt-3 leading-relaxed">{d}</p>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
