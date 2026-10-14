import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, ScanLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { useStore } from "@/context/Store";
import { NAV, MORE_NAV } from "@/lib/collections";

const Count = ({ n, testid }) => n > 0 ? (
  <span data-testid={testid} className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[#58111A] text-[#EADBB9] text-[10px]">{n}</span>
) : null;

function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const submit = (e) => { e.preventDefault(); if (!q.trim()) return; nav(`/shop?q=${encodeURIComponent(q.trim())}`); onClose(); setQ(""); };
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-[#180B0E]/95 backdrop-blur-xl flex items-start justify-center pt-[22vh] px-6" data-testid="search-overlay">
          <button onClick={onClose} className="absolute top-6 right-6 text-[#EADBB9]" data-testid="search-close-btn" aria-label="Close search"><X className="w-7 h-7" strokeWidth={1.2} /></button>
          <form onSubmit={submit} className="w-full max-w-3xl">
            <p className="eyebrow !text-[#C5A059]">Search the loom house</p>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kanjivaram, bridal red, handwoven…" data-testid="search-input"
              className="mt-6 w-full bg-transparent border-b border-[#C5A059]/50 focus:border-[#C5A059] outline-none font-display text-3xl sm:text-5xl text-[#FAF8F5] placeholder:text-stone-500 pb-4" />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileMenu({ open, setOpen }) {
  const { user } = useStore();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="bg-[#FAF8F5] w-[86vw] max-w-sm p-0 border-r border-[#C5A059]/30" data-lenis-prevent data-testid="mobile-menu">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="p-6 border-b border-[#E7E2DA]"><Logo testid="mobile-menu-logo" /></div>
        <nav className="p-6 overflow-y-auto max-h-[80vh]">
          {[...NAV, ...MORE_NAV].map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="block py-3 font-display text-2xl text-[#1C1917] border-b border-[#E7E2DA]/70">{n.label}</Link>
          ))}
          <Link to="/account" onClick={() => setOpen(false)} className="block py-3 font-display text-2xl text-[#58111A]" data-testid="mobile-nav-account">{user ? "My Account" : "Sign in"}</Link>
          {user?.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="block py-3 font-display text-2xl text-[#8C6A23]" data-testid="mobile-nav-admin">Admin Dashboard</Link>}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  const { cartCount, wishlist, setCartOpen, user } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [more, setMore] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setMore(false); }, [loc.pathname]);
  const icon = "relative p-2 text-[#1C1917] hover:text-[#58111A] transition-colors";
  return (
    <>
      <header className={`saree-header sticky top-0 z-50 transition-[background-color,box-shadow] duration-500 ${scrolled ? "is-scrolled" : ""}`} data-testid="site-header">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between gap-4">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setMenu(true)} data-testid="mobile-menu-btn" aria-label="Open menu"><Menu className="w-6 h-6" strokeWidth={1.3} /></button>
          <Logo light />
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={({ isActive }) => `text-[13px] tracking-[0.08em] nav-sparkle-link ${isActive ? "text-[#EADBB9]" : "text-[#FAF8F5]"}`}>{n.label}</NavLink>
            ))}
            <div className="relative" onMouseEnter={() => setMore(true)} onMouseLeave={() => setMore(false)}>
              <button className="flex items-center gap-1 text-[13px] tracking-[0.08em] text-[#FAF8F5]" data-testid="nav-more-btn" onClick={() => setMore((m) => !m)}>More <ChevronDown className="w-3.5 h-3.5" /></button>
              <AnimatePresence>
                {more && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
                    className="absolute right-0 top-full pt-4 w-56" data-testid="nav-more-menu">
                    <div className="bg-[#FAF8F5] border border-[#C5A059]/30 shadow-xl p-2">
                      {MORE_NAV.map((n) => <Link key={n.to} to={n.to} className="block px-4 py-2.5 text-sm hover:bg-[#F3EFEA] hover:text-[#58111A]" data-testid={`more-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}>{n.label}</Link>)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <button className={icon} onClick={() => setSearch(true)} data-testid="search-btn" aria-label="Search"><Search className="w-5 h-5" strokeWidth={1.4} /></button>
            <Link to="/scanner" className={`${icon} hidden sm:block`} data-testid="scanner-btn" aria-label="Scan a saree"><ScanLine className="w-5 h-5" strokeWidth={1.4} /></Link>
            <Link to={user?.role === "admin" ? "/admin" : "/account"} className={`${icon} hidden sm:block`} data-testid="account-btn" aria-label="Account"><User className="w-5 h-5" strokeWidth={1.4} /></Link>
            <Link to="/wishlist" className={icon} data-testid="wishlist-btn" aria-label="Wishlist"><Heart className="w-5 h-5" strokeWidth={1.4} /><Count n={wishlist.length} testid="wishlist-count" /></Link>
            <button className={icon} onClick={() => setCartOpen(true)} data-testid="cart-btn" aria-label="Bag"><ShoppingBag className="w-5 h-5" strokeWidth={1.4} /><Count n={cartCount} testid="cart-count" /></button>
          </div>
        </div>
      </header>
      <MobileMenu open={menu} setOpen={setMenu} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}
