import Hero from "@/pages/home/Hero";
import Marquee from "@/components/Marquee";
import { CollectionsBento, ProductRail, CraftStory, TryOnTeaser, Promises, Manifesto } from "@/pages/home/Sections";

export default function Home() {
  return (
    <div data-testid="home-page">
      <Hero />
      <Marquee />
      <CollectionsBento />
      <ProductRail collection="new" eyebrow="Fresh off the loom" title={["New arrivals"]} to="/collections/new-arrivals" testid="new-arrivals-rail" />
      <CraftStory />
      <ProductRail collection="bestseller" eyebrow="Most loved" title={["Bestsellers"]} to="/collections/bestsellers" testid="bestsellers-rail" />
      <Manifesto />
      <Promises />
      <TryOnTeaser />
    </div>
  );
}
