import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { COLLECTIONS } from "@/lib/collections";

const PRICES = [["", "Any price"], ["0-10000", "Under ₹10,000"], ["10000-20000", "₹10,000 – ₹20,000"], ["20000-30000", "₹20,000 – ₹30,000"], ["30000-", "Above ₹30,000"]];
const SWATCH = {
  Red: "#9B1B1F", Green: "#1F5A3A", Purple: "#4B1D4F", Pink: "#D9566F", Gold: "#C5A059", Orange: "#D9772B", Maroon: "#58111A",
  Black: "#171411", Blue: "#24548A", "Royal Blue": "#174A8B", Navy: "#172B4D", Yellow: "#E7B928", Mustard: "#C58A16", "Mustard Gold": "#B98916",
  Beige: "#D9C6A5", Cream: "#F3E8CF", White: "#FAF8F2", Ivory: "#F2E6C9", Grey: "#8A8A84", Gray: "#8A8A84", Teal: "#0D7773",
  Rust: "#A44725", Wine: "#6C1F35", Magenta: "#A62B68", Peach: "#E9A08D", Lavender: "#9A86B8", Silver: "#AEB4B8", Multi: "#B67A48",
};

const colorValue = (value) => {
  if (!value) return "#8A6A32";
  if (/^#[0-9a-f]{3,8}$/i.test(value.trim())) return value.trim();
  const normalized = value.trim().toLowerCase();
  const exact = Object.entries(SWATCH).find(([name]) => name.toLowerCase() === normalized);
  if (exact) return exact[1];
  const partial = Object.entries(SWATCH).find(([name]) => normalized.includes(name.toLowerCase()) || name.toLowerCase().includes(normalized));
  return partial?.[1] || "#8A6A32";
};

function Filters({ facets, f, set }) {
  const toggle = (key, v) => set((s) => ({ ...s, [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] }));
  return (
    <div className="space-y-10" data-testid="filters-panel">
      <div>
        <p className="eyebrow mb-4">Weave</p>
        {(facets.categories || []).map((c) => (
          <label key={c} className="flex items-center gap-3 py-1.5 cursor-pointer text-sm group">
            <input type="checkbox" checked={f.category.includes(c)} onChange={() => toggle("category", c)} className="accent-[#58111A] w-4 h-4" data-testid={`filter-category-${c.toLowerCase().replace(/\s+/g, "-")}`} />
            <span className="group-hover:text-[#58111A]">{c}</span>
          </label>
        ))}
      </div>
      <div>
        <p className="eyebrow mb-4">Colour</p>
        <div className="flex flex-wrap gap-2.5">
          {(facets.colors || []).map((c) => (
            <button key={c} onClick={() => toggle("color", c)} title={c} data-testid={`filter-color-${c.toLowerCase()}`}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${f.color.includes(c) ? "border-[#1C1917] scale-110" : "border-[#FAF8F5] ring-1 ring-[#E7E2DA]"}`} style={{ background: colorValue(c) }} aria-label={c} />
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-4">Price</p>
        {PRICES.map(([v, l]) => (
          <label key={v || "any"} className="flex items-center gap-3 py-1.5 cursor-pointer text-sm">
            <input type="radio" name="price" checked={f.price === v} onChange={() => set((s) => ({ ...s, price: v }))} className="accent-[#58111A] w-4 h-4" data-testid={`filter-price-${v || "any"}`} />{l}
          </label>
        ))}
      </div>
      <button onClick={() => set({ category: [], color: [], price: "" })} className="text-xs tracking-[0.2em] uppercase text-[#58111A] link-underline" data-testid="filters-clear-btn">Clear all</button>
    </div>
  );
}

export default function Listing() {
  const { slug = "shop" } = useParams();
  const [sp] = useSearchParams();
  const q = sp.get("q") || "";
  const meta = COLLECTIONS[slug] || COLLECTIONS.shop;
  const [facets, setFacets] = useState({});
  const [f, setF] = useState({ category: [], color: [], price: "" });
  const [sort, setSort] = useState("featured");
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { api.get("/products/facets").then((r) => setFacets(r.data || {})).catch(() => {}); }, []);
  useEffect(() => { setF({ category: [], color: [], price: "" }); }, [slug]);
  const params = useMemo(() => {
    const [mn, mx] = f.price.split("-");
    return { collection: meta.tag, q: q || undefined, sort, category: f.category.join(",") || undefined, color: f.color.join(",") || undefined,
      min_price: mn || undefined, max_price: mx || undefined };
  }, [meta.tag, q, sort, f]);
  useEffect(() => {
    setItems(null);
    api.get("/products", { params }).then((r) => setItems(Array.isArray(r.data?.items) ? r.data.items : [])).catch(() => setItems([]));
  }, [params]);
  const active = f.category.length + f.color.length + (f.price ? 1 : 0);

  return (
    <div data-testid={`listing-page-${slug}`}>
      <PageHero eyebrow={q ? "Search results" : meta.eyebrow} title={q ? `“${q}”` : meta.title} blurb={q ? null : meta.blurb} image={q ? null : meta.image} />
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#E7E2DA]">
          <button onClick={() => setOpen(true)} className="lg:hidden inline-flex items-center gap-2 text-sm" data-testid="mobile-filters-btn"><SlidersHorizontal className="w-4 h-4" /> Filters {active > 0 && `(${active})`}</button>
          <p className="hidden lg:block text-sm text-[#57534E]" data-testid="results-count">{items ? `${items.length} sarees` : "Loading…"}</p>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[190px] rounded-none border-[#E7E2DA] bg-transparent" data-testid="sort-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: low to high</SelectItem>
              <SelectItem value="price_desc">Price: high to low</SelectItem>
              <SelectItem value="rating">Top rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-12 pt-10">
          <aside className="hidden lg:block"><div className="sticky top-28"><Filters facets={facets} f={f} set={setF} /></div></aside>
          <div>
            {items === null ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] shimmer" />)}</div>
            ) : items.length === 0 ? (
              <div className="py-24 text-center" data-testid="no-results"><p className="font-display text-3xl">No sarees match just yet.</p><p className="text-[#57534E] mt-2">Try removing a filter or two.</p></div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-12" data-testid="product-grid">
                {items.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="bg-[#FAF8F5] max-h-[85vh] overflow-y-auto" data-lenis-prevent data-testid="mobile-filters-sheet">
          <div className="flex items-center justify-between mb-6"><SheetTitle className="font-display text-3xl font-light">Refine</SheetTitle><button onClick={() => setOpen(false)} data-testid="mobile-filters-close"><X className="w-5 h-5" /></button></div>
          <Filters facets={facets} f={f} set={setF} />
          <button onClick={() => setOpen(false)} className="mt-8 w-full bg-[#58111A] text-[#EADBB9] py-4 font-royal text-xs tracking-[0.25em]" data-testid="mobile-filters-apply">SHOW {items?.length ?? ""} SAREES</button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
