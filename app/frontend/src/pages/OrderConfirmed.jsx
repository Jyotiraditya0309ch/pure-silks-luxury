import { Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Ornament, LineReveal, EASE } from "@/components/Motion";
import { inr } from "@/lib/api";

export default function OrderConfirmed() {
  const { number } = useParams();
  const order = useLocation().state?.order;
  const paymentLabels = { cod: "cash on delivery", upi: "UPI / QR payment", netbanking: "net banking", card: "credit / debit card" };
  return (
    <div className="silk-bg grain relative" data-testid="order-confirmed-page">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
        <p className="eyebrow">Order placed</p>
        <h1 className="font-display font-light text-5xl sm:text-7xl leading-[0.95] mt-5"><LineReveal lines={["Thank you.", <em key="e" className="text-[#58111A]">It is yours.</em>]} /></h1>
        <Ornament className="mx-auto mt-8" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}>
          <p className="mt-8 text-[#57534E]">Your order number is</p>
          <p className="font-royal text-3xl tracking-[0.2em] text-[#58111A] mt-2" data-testid="order-number">{number}</p>
          {order && (
            <div className="mt-10 text-left bg-[#FAF8F5] border border-[#C5A059]/30 p-6 sm:p-8">
              {order.items.map((i) => <div key={i.product_id} className="flex justify-between text-sm py-1.5"><span>{i.name} × {i.qty}</span><span>{inr(i.price * i.qty)}</span></div>)}
              <div className="flex justify-between font-display text-2xl border-t border-[#E7E2DA] mt-3 pt-3"><span>Total ({paymentLabels[order.payment_method] || "selected payment"})</span><span data-testid="order-total">{inr(order.total)}</span></div>
              <p className="text-xs text-[#57534E] mt-3">Delivering to {order.shipping.name}, {order.shipping.city} — {order.shipping.pincode}</p>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link to={`/track-order?order=${number}`} className="bg-[#58111A] text-[#EADBB9] px-8 py-4 font-royal text-[11px] tracking-[0.25em]" data-testid="order-track-btn">TRACK ORDER</Link>
            <Link to="/shop" className="border border-[#58111A]/40 text-[#58111A] px-8 py-4 font-royal text-[11px] tracking-[0.25em]" data-testid="order-continue-btn">CONTINUE SHOPPING</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
