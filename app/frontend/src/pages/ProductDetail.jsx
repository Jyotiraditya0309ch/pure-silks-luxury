import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, Sparkles, Truck, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductCard from "@/components/ProductCard";
import { QtyStepper } from "@/components/CartDrawer";
import { Ornament, EASE } from "@/components/Motion";
import { useStore } from "@/context/Store";
import { api, inr, pctOff } from "@/lib/api";

function Gallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");
  const [zoom, setZoom] = useState(false);
  useEffect(() => { setActive(0); }, [images]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-4">
      <div className="order-2 sm:order-1 flex sm:flex-col gap-3">
        {images.map((src, i) => (
          <button key={src + i} onClick={() => setActive(i)} data-testid={`gallery-thumb-${i}`}
            className={`w-20 aspect-[3/4] overflow-hidden border transition-colors ${i === active ? "border-[#58111A]" : "border-transparent opacity-70 hover:opacity-100"}`}>
            <img src={src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      <div className="order-1 sm:order-2 relative aspect-[3/4] overflow-hidden bg-[#F3EFEA] cursor-zoom-in" data-testid="gallery-main"
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); }}
        onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)}>
        <motion.img key={images[active]} src={images[active]} alt={name} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: EASE }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300" style={{ transformOrigin: origin, transform: zoom ? "scale(1.8)" : "scale(1)" }} />
        <span className="absolute inset-4 border border-[#EADBB9]/50 pointer-events-none" />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const [qty, setQty] = useState(1);
  useEffect(() => {
    setData(null); setErr(false); setQty(1);
    api.get(`/products/${slug}`).then((r) => setData(r.data)).catch(() => setErr(true));
  }, [slug]);

  if (err) return <div className="py-40 text-center font-display text-3xl" data-testid="product-not-found">This saree could not be found. <Link to="/shop" className="block mt-4 text-base text-[#58111A] link-underline">Back to the shop</Link></div>;
  if (!data) return <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-14 grid lg:grid-cols-2 gap-12"><div className="aspect-[3/4] shimmer" /><div className="h-96 shimmer" /></div>;
  const p = data.product;
  const off = pctOff(p);
  const images = p.images?.length ? p.images : ["/img/f3.jpg"];
  const specs = [["Fabric", p.fabric], ["Weave", p.weave], ["Zari", p.zari], ["Length", p.length], ["Colour", p.color], ["Category", p.category]];

  return (
    <div data-testid="product-detail-page">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 pt-8 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-7"><Gallery images={images} name={p.name} /></div>
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <p className="text-xs text-[#57534E]"><Link to="/shop" className="link-underline">Shop</Link> / {p.category}</p>
          <p className="eyebrow mt-6">{p.category} · {p.color}</p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }} className="font-display font-light text-5xl sm:text-6xl leading-[0.95] mt-3" data-testid="product-name">{p.name}</motion.h1>
          {p.reviews_count > 0 && (
            <div className="flex items-center gap-2 mt-4 text-sm text-[#57534E]">
              <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(p.rating) ? "fill-[#C5A059] text-[#C5A059]" : "text-stone-300"}`} />)}</span>
              {p.rating} · {p.reviews_count} reviews
            </div>
          )}
          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-display text-4xl text-[#58111A]" data-testid="product-price">{inr(p.price)}</span>
            {off > 0 && <><span className="text-stone-500 line-through">{inr(p.mrp)}</span><span className="text-xs tracking-[0.15em] uppercase text-[#8C6A23]">Save {off}%</span></>}
          </div>
          <p className="text-xs text-[#57534E] mt-1">Inclusive of all taxes</p>
          <Ornament className="mt-6" />
          <p className="mt-6 leading-relaxed text-[#57534E]">{p.description}</p>
          <p className={`mt-5 text-sm ${p.stock <= 3 ? "text-[#58111A]" : "text-[#57534E]"}`} data-testid="product-stock">{p.stock < 1 ? "Sold out" : p.stock <= 3 ? `Only ${p.stock} left — woven in small numbers` : "In stock, ready to ship"}</p>
          <div className="flex items-center gap-3 mt-6">
            <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, Math.min(10, v)))} testid="pdp-qty" />
            <button disabled={p.stock < 1} onClick={() => addToCart(p, qty)} className="flex-1 bg-[#58111A] hover:bg-[#3F0A12] text-[#EADBB9] py-4 font-royal text-[11px] tracking-[0.25em] transition-colors disabled:bg-stone-400" data-testid="add-to-cart-btn">ADD TO BAG</button>
            <button onClick={() => toggleWishlist(p)} className="w-[52px] h-[52px] grid place-items-center border border-[#E7E2DA] hover:border-[#58111A]" data-testid="pdp-wishlist-btn" aria-label="Wishlist">
              <Heart className={`w-5 h-5 ${inWishlist(p.id) ? "fill-[#58111A] text-[#58111A]" : ""}`} strokeWidth={1.4} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button disabled={p.stock < 1} onClick={() => { addToCart(p, qty); nav("/checkout"); }} className="border border-[#58111A] text-[#58111A] py-3.5 font-royal text-[11px] tracking-[0.25em] hover:bg-[#58111A] hover:text-[#EADBB9] transition-colors" data-testid="buy-now-btn">BUY NOW</button>
            <Link to={`/try-on?product=${p.slug}`} className="inline-flex items-center justify-center gap-2 border border-[#C5A059] text-[#8C6A23] py-3.5 font-royal text-[11px] tracking-[0.2em] hover:bg-[#C5A059]/10" data-testid="pdp-tryon-btn"><Sparkles className="w-3.5 h-3.5" /> TRY ON</Link>
          </div>
          <div className="flex gap-6 mt-6 text-xs text-[#57534E]">
            <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-[#8C6A23]" strokeWidth={1.3} /> Free shipping above ₹5,000</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#8C6A23]" strokeWidth={1.3} /> Cash on delivery</span>
          </div>
          <Accordion type="single" collapsible defaultValue="weave" className="mt-8 border-t border-[#E7E2DA]">
            <AccordionItem value="weave"><AccordionTrigger className="font-display text-xl" data-testid="acc-weave">Weave details</AccordionTrigger>
              <AccordionContent><dl className="grid grid-cols-2 gap-y-3 text-sm">{specs.map(([k, v]) => <div key={k} className="contents"><dt className="text-[#57534E]">{k}</dt><dd>{v}</dd></div>)}</dl></AccordionContent>
            </AccordionItem>
            <AccordionItem value="care"><AccordionTrigger className="font-display text-xl" data-testid="acc-care">Care</AccordionTrigger><AccordionContent className="text-sm text-[#57534E]">{p.care}</AccordionContent></AccordionItem>
            <AccordionItem value="ship"><AccordionTrigger className="font-display text-xl" data-testid="acc-shipping">Shipping & returns</AccordionTrigger>
              <AccordionContent className="text-sm text-[#57534E]">Shipped across India, free above ₹5,000. [Add your delivery timelines and returns policy here.]</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      {data.related?.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-5 sm:px-8 pb-24" data-testid="related-products">
          <p className="eyebrow">You may also love</p>
          <h2 className="font-display text-4xl sm:text-5xl font-light mt-3 mb-10">From the same loom</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">{data.related.map((r, i) => <ProductCard key={r.id} p={r} index={i} />)}</div>
        </section>
      )}
    </div>
  );
}
