import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/Store";
import { inr, pctOff } from "@/lib/api";

export default function ProductCard({ p, index = 0 }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const off = pctOff(p);
  const imgs = p.images?.length ? p.images : [p.image];
  const liked = inWishlist(p.id);
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.08 }}
      className="group relative saree-product-card"
      data-testid={`product-card-${p.slug}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F3EFEA] saree-product-image">
        <Link to={`/product/${p.slug}`} data-testid={`product-card-link-${p.slug}`} className="block w-full h-full">
          <img src={imgs[0]} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]" />
          {imgs[1] && <img src={imgs[1]} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />}
          <span className="absolute inset-3 border border-[#EADBB9]/0 group-hover:border-[#EADBB9]/70 transition-colors duration-700 pointer-events-none" />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.tags?.includes("new") && <span className="bg-[#FAF8F5]/90 backdrop-blur text-[#58111A] font-royal text-[10px] tracking-[0.2em] px-2.5 py-1">NEW</span>}
          {off > 0 && <span className="bg-[#58111A] text-[#EADBB9] font-royal text-[10px] tracking-[0.2em] px-2.5 py-1">−{off}%</span>}
        </div>
        <button
          onClick={() => toggleWishlist(p)}
          data-testid={`wishlist-toggle-${p.slug}`}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full bg-[#FAF8F5]/90 backdrop-blur transition-transform duration-300 hover:scale-110"
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-[#58111A] text-[#58111A]" : "text-[#1C1917]"}`} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => addToCart(p)}
          disabled={p.stock < 1}
          data-testid={`quick-add-${p.slug}`}
          className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-2 py-3.5 bg-[#58111A] text-[#EADBB9] font-royal text-[11px] tracking-[0.25em] translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-500 ease-out disabled:bg-stone-500"
        >
          <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} /> {p.stock < 1 ? "SOLD OUT" : "ADD TO BAG"}
        </button>
      </div>
      <Link to={`/product/${p.slug}`} className="block pt-4 saree-product-info">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#8C6A23]">{p.category} · {p.color}</p>
        <h3 className="font-display text-xl sm:text-2xl leading-tight mt-1 text-[#1C1917] group-hover:text-[#58111A] transition-colors">{p.name}</h3>
        <p className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[15px] font-medium text-[#1C1917]" data-testid={`price-${p.slug}`}>{inr(p.price)}</span>
          {off > 0 && <span className="text-sm text-stone-500 line-through">{inr(p.mrp)}</span>}
        </p>
      </Link>
    </motion.article>
  );
}
