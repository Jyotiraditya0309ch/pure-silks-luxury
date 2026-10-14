import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/context/Store";
import { inr } from "@/lib/api";

export const QtyStepper = ({ value, onChange, testid }) => (
  <div className="inline-flex items-center border border-[#E7E2DA]" data-testid={testid}>
    <button onClick={() => onChange(value - 1)} className="p-2 hover:text-[#58111A]" data-testid={`${testid}-dec`} aria-label="Decrease"><Minus className="w-3.5 h-3.5" /></button>
    <span className="w-8 text-center text-sm">{value}</span>
    <button onClick={() => onChange(value + 1)} className="p-2 hover:text-[#58111A]" data-testid={`${testid}-inc`} aria-label="Increase"><Plus className="w-3.5 h-3.5" /></button>
  </div>
);

export const CartLine = ({ item }) => {
  const { setQty, removeFromCart } = useStore();
  const p = item.product;
  return (
    <div className="flex gap-4 py-5 border-b border-[#E7E2DA]" data-testid={`cart-line-${p.slug}`}>
      <Link to={`/product/${p.slug}`} className="w-20 sm:w-24 aspect-[3/4] shrink-0 overflow-hidden bg-[#F3EFEA]"><img src={p.image} alt={p.name} className="w-full h-full object-cover" /></Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C6A23]">{p.category}</p>
            <p className="font-display text-xl leading-tight">{p.name}</p>
          </div>
          <button onClick={() => removeFromCart(p.id)} className="text-stone-500 hover:text-[#58111A] h-fit" data-testid={`cart-remove-${p.slug}`} aria-label="Remove"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <QtyStepper value={item.qty} onChange={(q) => setQty(p.id, q)} testid={`cart-qty-${p.slug}`} />
          <span className="text-sm font-medium">{inr(p.price * item.qty)}</span>
        </div>
      </div>
    </div>
  );
};

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, subtotal } = useStore();
  const nav = useNavigate();
  const go = (to) => { setCartOpen(false); nav(to); };
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="bg-[#FAF8F5] w-full sm:max-w-md p-0 flex flex-col border-l border-[#C5A059]/30" data-testid="cart-drawer">
        <div className="px-6 pt-8 pb-4 border-b border-[#E7E2DA]">
          <p className="eyebrow">Your selection</p>
          <SheetTitle className="font-display text-3xl font-light mt-2">Shopping Bag</SheetTitle>
        </div>
        <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
          {cart.length === 0 ? (
            <div className="py-20 text-center" data-testid="cart-empty">
              <p className="font-display text-2xl">Your bag awaits its first silk.</p>
              <button onClick={() => go("/shop")} className="mt-6 text-[#58111A] link-underline text-sm tracking-widest uppercase" data-testid="cart-empty-shop-btn">Explore the collection</button>
            </div>
          ) : cart.map((i) => <CartLine key={i.product.id} item={i} />)}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#E7E2DA] bg-[#F3EFEA]">
            <div className="flex justify-between font-display text-2xl"><span>Subtotal</span><span data-testid="cart-subtotal">{inr(subtotal)}</span></div>
            <p className="text-xs text-[#57534E] mt-1">Shipping & offers calculated at checkout.</p>
            <button onClick={() => go("/checkout")} className="mt-5 w-full bg-[#58111A] hover:bg-[#3F0A12] text-[#EADBB9] py-4 font-royal text-xs tracking-[0.25em] transition-colors" data-testid="cart-checkout-btn">PROCEED TO CHECKOUT</button>
            <button onClick={() => go("/cart")} className="mt-3 w-full border border-[#58111A]/40 py-3.5 font-royal text-xs tracking-[0.25em] text-[#58111A] hover:bg-[#58111A]/5" data-testid="cart-view-btn">VIEW BAG</button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
