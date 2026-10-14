import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { api, errMsg } from "@/lib/api";

const COLS = [
  { h: "Collections", l: [["Pure Silks", "/collections/pure-silks"], ["Handlooms", "/collections/handlooms"], ["Wedding", "/collections/wedding"], ["Festive", "/collections/festive"], ["Designer", "/collections/designer"], ["Offers", "/collections/sale"]] },
  { h: "Patrons", l: [["My Account", "/account"], ["Track Order", "/track-order"], ["Wishlist", "/wishlist"], ["Shopping Bag", "/cart"], ["Virtual Try-On", "/try-on"]] },
  { h: "The House", l: [["About Us", "/about"], ["Contact", "/contact"], ["All Categories", "/categories"], ["New Arrivals", "/collections/new-arrivals"]] },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const sub = async (e) => {
    e.preventDefault();
    try { await api.post("/newsletter", { email }); toast.success("Welcome to the inner circle."); setEmail(""); }
    catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <footer className="relative bg-[#180B0E] text-stone-300 grain overflow-hidden" data-testid="site-footer">
      <div className="zari-band opacity-80" />
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Logo light testid="footer-logo" />
            <p className="font-display text-3xl sm:text-4xl text-[#FAF8F5] font-light leading-tight mt-8 max-w-md">Letters from the loom — new weaves, private previews and festive edits.</p>
            <form onSubmit={sub} className="mt-6 flex border-b border-[#C5A059]/50 max-w-md">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" data-testid="newsletter-input"
                className="flex-1 bg-transparent py-3 outline-none text-[#FAF8F5] placeholder:text-stone-400" />
              <button className="text-[#C5A059] hover:translate-x-1 transition-transform" data-testid="newsletter-submit" aria-label="Subscribe"><ArrowRight className="w-5 h-5" /></button>
            </form>
          </div>
          {COLS.map((c) => (
            <div key={c.h} className="lg:col-span-2">
              <p className="eyebrow !text-[#C5A059]">{c.h}</p>
              <ul className="mt-5 space-y-3">
                {c.l.map(([t, to]) => <li key={to}><Link to={to} className="text-sm text-stone-300 hover:text-[#EADBB9] link-underline">{t}</Link></li>)}
              </ul>
            </div>
          ))}
          <div className="lg:col-span-1" />
        </div>
        <div className="mt-16 pt-8 border-t border-[#C5A059]/15 flex flex-col sm:flex-row gap-3 justify-between text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Vijay Handlooms Pure Silks. All rights reserved.</p>
          <p>All India shipping available · <a href="tel:+919703182026" className="hover:text-[#EADBB9]">+91 9703182026</a> · <a href="tel:+919642600670" className="hover:text-[#EADBB9]">+91 9642600670</a></p>
        </div>
      </div>
    </footer>
  );
}
