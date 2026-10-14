import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import PageHero from "@/components/PageHero";
import { Field, GoldButton } from "@/components/AuthForm";
import { api, errMsg, inr } from "@/lib/api";

const FLOW = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export const Timeline = ({ order }) => {
  const idx = FLOW.indexOf(order.status);
  if (order.status === "Cancelled") return <p className="font-display text-2xl text-[#58111A]" data-testid="order-cancelled">This order was cancelled.</p>;
  return (
    <ol className="relative" data-testid="order-timeline">
      {FLOW.map((s, i) => {
        const at = order.timeline?.find((t) => t.status === s)?.at;
        const done = i <= idx;
        return (
          <motion.li key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-5 pb-7 last:pb-0 relative">
            {i < FLOW.length - 1 && <span className={`absolute left-[13px] top-7 bottom-0 w-px ${i < idx ? "bg-[#58111A]" : "bg-[#E7E2DA]"}`} />}
            <span className={`w-7 h-7 rounded-full grid place-items-center border shrink-0 ${done ? "bg-[#58111A] border-[#58111A] text-[#EADBB9]" : "border-[#D6CFC4] bg-[#FAF8F5]"}`}>{done && <Check className="w-3.5 h-3.5" />}</span>
            <div><p className={`font-display text-xl ${done ? "" : "text-stone-500"}`}>{s}</p>{at && <p className="text-xs text-[#57534E]">{new Date(at).toLocaleString("en-IN")}</p>}</div>
          </motion.li>
        );
      })}
    </ol>
  );
};

export default function TrackOrder() {
  const [sp] = useSearchParams();
  const [f, setF] = useState({ order_number: sp.get("order") || "", email: "" });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try { const { data } = await api.get("/orders/track", { params: f }); setOrder(data); }
    catch (er) { setOrder(null); setError(errMsg(er)); } finally { setBusy(false); }
  };
  return (
    <div data-testid="track-order-page">
      <PageHero eyebrow="Loom to doorstep" title="Track Order" blurb="Enter your order number and the email used at checkout." />
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-14 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-14">
        <form onSubmit={submit} className="space-y-7" data-testid="track-form">
          <Field label="Order number" required placeholder="VKH123456" value={f.order_number} onChange={(e) => setF({ ...f, order_number: e.target.value })} testid="track-order-input" />
          <Field label="Email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} testid="track-email-input" />
          <GoldButton disabled={busy} className="w-full" data-testid="track-submit-btn">{busy ? "SEARCHING…" : "TRACK"}</GoldButton>
          {error && <p className="text-sm text-[#58111A]" data-testid="track-error">{error}</p>}
        </form>
        <div>
          {order ? (
            <div data-testid="track-result">
              <p className="eyebrow">Order {order.order_number}</p>
              <p className="font-display text-3xl mt-2 mb-8">{order.items?.length} item(s) · {inr(order.total)}</p>
              <Timeline order={order} />
            </div>
          ) : <p className="font-display text-2xl text-[#57534E]">Your order's journey will appear here.</p>}
        </div>
      </div>
    </div>
  );
}
