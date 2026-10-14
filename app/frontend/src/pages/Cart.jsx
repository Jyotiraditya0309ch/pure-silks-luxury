import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import { CartLine } from "@/components/CartDrawer";
import { GoldButton } from "@/components/AuthForm";
import { useStore } from "@/context/Store";
import { api, errMsg, inr } from "@/lib/api";

export const totals = (subtotal, pct = 0, gift = false) => {
  const discount = Math.round(subtotal * pct / 100);
  const shipping = subtotal - discount >= 5000 || subtotal === 0 ? 0 : 150;
  const wrap = gift ? 250 : 0;
  return { discount, shipping, wrap, total: subtotal - discount + shipping + wrap };
};

export const Summary = ({ subtotal, coupon, gift, children }) => {
  const t = totals(subtotal, coupon?.percent || 0, gift);
  const row = (l, v, id) => <div className="flex justify-between text-sm py-1.5"><span className="text-[#57534E]">{l}</span><span data-testid={id}>{v}</span></div>;
  return (
    <div className="bg-[#F3EFEA] p-6 sm:p-8 border border-[#C5A059]/25" data-testid="order-summary">
      <p className="eyebrow mb-4">Summary</p>
      {row("Subtotal", inr(subtotal), "summary-subtotal")}
      {t.discount > 0 && row(`Coupon ${coupon.code}`, `− ${inr(t.discount)}`, "summary-discount")}
      {row("Shipping", t.shipping ? inr(t.shipping) : "Complimentary", "summary-shipping")}
      {gift && row("Gift wrap", inr(t.wrap), "summary-gift")}
      <div className="flex justify-between font-display text-3xl border-t border-[#C5A059]/30 mt-4 pt-4"><span>Total</span><span data-testid="summary-total">{inr(t.total)}</span></div>
      {children}
    </div>
  );
};

export const CouponBox = ({ coupon, setCoupon }) => {
  const [code, setCode] = useState("");
  const apply = async () => {
    try { const { data } = await api.post("/coupons/validate", { code }); setCoupon(data); toast.success(`${data.percent}% off applied`); }
    catch (er) { toast.error(errMsg(er)); }
  };
  if (coupon) return <p className="text-sm mt-4" data-testid="coupon-applied">Code <b>{coupon.code}</b> applied · <button onClick={() => setCoupon(null)} className="text-[#58111A] link-underline" data-testid="coupon-remove-btn">remove</button></p>;
  return (
    <div className="flex mt-4 border-b border-[#D6CFC4]">
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="flex-1 bg-transparent py-2.5 outline-none text-sm uppercase" data-testid="coupon-input" />
      <button onClick={apply} className="text-xs tracking-[0.2em] uppercase text-[#58111A]" data-testid="coupon-apply-btn">Apply</button>
    </div>
  );
};

export default function Cart() {
  const { cart, subtotal } = useStore();
  const [coupon, setCoupon] = useState(() => JSON.parse(sessionStorage.getItem("vkh_coupon") || "null"));
  const nav = useNavigate();
  const go = () => { sessionStorage.setItem("vkh_coupon", JSON.stringify(coupon)); nav("/checkout"); };
  return (
    <div data-testid="cart-page">
      <PageHero eyebrow="Your selection" title="Shopping Bag" />
      <div className="max-w-[1300px] mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          {cart.length === 0 ? (
            <div className="py-16" data-testid="cart-page-empty"><p className="font-display text-3xl">Your bag is empty.</p><Link to="/shop" className="inline-block mt-5 text-sm tracking-[0.2em] uppercase text-[#58111A] link-underline">Continue shopping</Link></div>
          ) : cart.map((i) => <CartLine key={i.product.id} item={i} />)}
        </div>
        {cart.length > 0 && (
          <div className="lg:col-span-5">
            <Summary subtotal={subtotal} coupon={coupon}>
              <CouponBox coupon={coupon} setCoupon={setCoupon} />
              <GoldButton onClick={go} className="w-full mt-6" data-testid="cart-page-checkout-btn">CHECKOUT</GoldButton>
            </Summary>
          </div>
        )}
      </div>
    </div>
  );
}
