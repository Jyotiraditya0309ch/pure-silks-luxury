import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/context/Store";

export default function Wishlist() {
  const { wishlist } = useStore();
  return (
    <div data-testid="wishlist-page">
      <PageHero eyebrow="Saved for later" title="Wishlist" blurb="The silks you could not stop thinking about." />
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-14">
        {wishlist.length === 0 ? (
          <div className="py-16 text-center" data-testid="wishlist-empty">
            <p className="font-display text-3xl">Nothing saved yet.</p>
            <Link to="/shop" className="inline-block mt-5 text-sm tracking-[0.2em] uppercase text-[#58111A] link-underline" data-testid="wishlist-shop-link">Discover sarees</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-12">{wishlist.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>
        )}
      </div>
    </div>
  );
}
