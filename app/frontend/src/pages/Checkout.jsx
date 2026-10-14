import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Banknote, CreditCard, Landmark, QrCode, Smartphone } from "lucide-react";
import PageHero from "@/components/PageHero";
import { Field, GoldButton } from "@/components/AuthForm";
import { Summary, CouponBox, totals } from "@/pages/Cart";
import { useStore } from "@/context/Store";
import { api, errMsg, inr } from "@/lib/api";

export default function Checkout() {
  const { cart, subtotal, user, clearCart } = useStore();
  const nav = useNavigate();
  const [coupon, setCoupon] = useState(() => JSON.parse(sessionStorage.getItem("vkh_coupon") || "null"));
  const [gift, setGift] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [qrOpen, setQrOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [s, setS] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", address: "", city: "", state: "", pincode: "" });
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const checkoutTotal = totals(subtotal, coupon?.percent || 0, gift).total;
  const upiUri = `upi://pay?pa=svijaykumar6002@ybl&pn=S%20Vijay%20Kumar&am=${checkoutTotal.toFixed(2)}&cu=INR&tn=Vijay%20Handlooms%20order`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;
  useEffect(() => { setQrOpen(false); }, [checkoutTotal]);

  if (cart.length === 0) return (
    <div className="py-40 text-center" data-testid="checkout-empty"><p className="font-display text-3xl">Your bag is empty.</p><Link to="/shop" className="inline-block mt-4 text-[#58111A] link-underline">Discover sarees</Link></div>
  );

  const place = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await api.post("/orders", { items: cart.map((i) => ({ product_id: i.product.id, qty: i.qty })), shipping: s, payment_method: paymentMethod, coupon: coupon?.code, gift_wrap: gift });
      clearCart(); sessionStorage.removeItem("vkh_coupon");
      nav(`/order/${data.order_number}`, { state: { order: data } });
    } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };

  return (
    <div data-testid="checkout-page">
      <PageHero eyebrow="Almost yours" title="Checkout" />
      <form onSubmit={place} className="max-w-[1300px] mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-12">
          <section>
            <p className="eyebrow mb-6">Delivery details</p>
            {!user && <p className="text-sm text-[#57534E] -mt-3 mb-6">Checking out as a guest · <Link to="/account" className="text-[#58111A] link-underline" data-testid="checkout-signin-link">sign in</Link> to save orders to your account.</p>}
            <div className="grid sm:grid-cols-2 gap-7">
              <Field label="Full name" required value={s.name} onChange={set("name")} testid="ship-name" />
              <Field label="Phone" required value={s.phone} onChange={set("phone")} testid="ship-phone" />
              <Field label="Email" type="email" required value={s.email} onChange={set("email")} testid="ship-email" className="sm:col-span-2" />
              <Field label="Address" required value={s.address} onChange={set("address")} testid="ship-address" className="sm:col-span-2" />
              <Field label="City" required value={s.city} onChange={set("city")} testid="ship-city" />
              <Field label="State" required value={s.state} onChange={set("state")} testid="ship-state" />
              <Field label="PIN code" required value={s.pincode} onChange={set("pincode")} testid="ship-pincode" />
            </div>
          </section>
          <section>
            <p className="eyebrow mb-6">Payment</p>
            <div className="space-y-3">
              {[
                { id: "cod", label: "Cash on delivery", detail: "Pay in cash or UPI when your saree arrives.", icon: Banknote },
                { id: "upi", label: "UPI / QR payment", detail: "PhonePe, Google Pay and every UPI app.", icon: QrCode },
                { id: "netbanking", label: "Net banking", detail: "Pay securely from SBI and other banks.", icon: Landmark },
                { id: "card", label: "Credit / debit card", detail: "Visa, Mastercard, RuPay and SBI cards.", icon: CreditCard },
              ].map(({ id, label, detail, icon: Icon }) => (
                <label key={id} className={`flex items-center gap-4 border p-5 cursor-pointer transition-colors ${paymentMethod === id ? "border-[#58111A] bg-[#58111A]/5" : "border-[#E7E2DA]"}`} data-testid={`payment-${id}`}>
                  <input type="radio" name="payment_method" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="accent-[#58111A]" />
                  <Icon className={`w-5 h-5 ${paymentMethod === id ? "text-[#58111A]" : "text-[#57534E]"}`} strokeWidth={1.3} />
                  <span><span className="block font-display text-xl">{label}</span><span className="block text-xs text-[#57534E]">{detail}</span></span>
                </label>
              ))}
            </div>
            {paymentMethod === "upi" && (
              <div className="mt-5 border border-[#E7E2DA] bg-[#FBF9F5] p-5 flex flex-col sm:flex-row items-center gap-5" data-testid="upi-qr-panel">
                <button type="button" onClick={() => setQrOpen(true)} className="relative w-36 h-36 overflow-hidden bg-white p-2" data-testid="upi-qr-open-btn" aria-label="Tap to open payment scanner">
                  <img src={qrUrl} alt="" className="w-full h-full object-contain transition-all duration-500" style={{ filter: qrOpen ? "none" : "blur(12px)", transform: qrOpen ? "scale(1)" : "scale(1.12)" }} data-testid="upi-qr-image" />
                  {!qrOpen && <span className="absolute inset-0 grid place-items-center text-center bg-white/85 text-black font-black text-base leading-none tracking-[0.12em] uppercase">Tap to open</span>}
                </button>
                <div className="text-center sm:text-left">
                  <p className="font-display text-xl text-[#2C211D]">Scan to pay</p>
                  <p className="text-sm text-[#57534E] mt-1">Pay {inr(checkoutTotal)} with PhonePe, Google Pay or any UPI app.</p>
                  <p className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#57534E] mt-3"><Smartphone className="w-4 h-4 text-[#58111A]" /> svijaykumar6002@ybl</p>
                  <a href={upiUri} className="inline-flex mt-4 px-4 py-2 bg-[#58111A] text-[#EADBB9] text-[10px] tracking-[0.18em] uppercase" data-testid="upi-pay-link">Open in UPI</a>
                  <p className="text-xs text-[#8A817A] mt-2">Place your order after completing the payment.</p>
                </div>
              </div>
            )}
            <label className="flex items-center gap-3 mt-6 text-sm cursor-pointer"><input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="accent-[#58111A] w-4 h-4" data-testid="gift-wrap-checkbox" /> Add heritage gift wrap ({inr(250)})</label>
          </section>
        </div>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div className="mb-4 space-y-3">
              {cart.map((i) => (
                <div key={i.product.id} className="flex gap-3 items-center text-sm"><img src={i.product.image} alt="" className="w-12 h-16 object-cover" /><span className="flex-1">{i.product.name} × {i.qty}</span><span>{inr(i.qty * i.product.price)}</span></div>
              ))}
            </div>
            <Summary subtotal={subtotal} coupon={coupon} gift={gift}>
              <CouponBox coupon={coupon} setCoupon={setCoupon} />
              <GoldButton disabled={busy} className="w-full mt-6" data-testid="place-order-btn">{busy ? "PLACING ORDER…" : "PLACE ORDER"}</GoldButton>
            </Summary>
          </div>
        </div>
      </form>
    </div>
  );
}
