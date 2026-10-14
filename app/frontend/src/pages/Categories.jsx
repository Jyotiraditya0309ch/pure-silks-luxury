import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import { Reveal } from "@/components/Motion";
import { COLLECTIONS } from "@/lib/collections";

export default function Categories() {
  const entries = Object.entries(COLLECTIONS).filter(([k]) => k !== "shop");
  return (
    <div data-testid="categories-page">
      <PageHero eyebrow="Browse" title="Categories" blurb="Wander through our rooms — from everyday handlooms to heirloom bridal silks." image="/img/f1.jpg" />
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-14 sm:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {entries.map(([slug, c], i) => (
          <Reveal key={slug} delay={(i % 4) * 0.07}>
            <Link to={`/collections/${slug}`} className="group block" data-testid={`category-card-${slug}`}>
              <div className="relative aspect-[4/5] overflow-hidden arch bg-[#F3EFEA]">
                <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
              </div>
              <div className="flex items-start justify-between mt-4">
                <div><p className="text-[11px] tracking-[0.2em] uppercase text-[#8C6A23]">{c.eyebrow}</p><p className="font-display text-3xl leading-tight mt-1 group-hover:text-[#58111A] transition-colors">{c.title}</p></div>
                <ArrowUpRight className="w-5 h-5 mt-2 text-[#58111A] transition-transform duration-500 group-hover:rotate-45" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
