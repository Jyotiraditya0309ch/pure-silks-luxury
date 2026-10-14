import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Instagram, MessageCircle, Truck } from "lucide-react";
import PageHero from "@/components/PageHero";
import { Reveal } from "@/components/Motion";
import { Field, GoldButton } from "@/components/AuthForm";
import { api, errMsg } from "@/lib/api";

const INFO = [
  [Instagram, "Instagram", "@vijayhandlooms_silk_sarres", "https://www.instagram.com/vijayhandlooms_silk_sarres?igsh=MnQ3NmZoMXZtd256"],
  [MessageCircle, "WhatsApp group", "Join our group", "https://chat.whatsapp.com/KtcZ6z27NXX6Z37CxNcQtC?s=sw&p=a&mlu=2&amv=3"],
  [MapPin, "Visit", "JAJAPUR, NARAYANPET - 509210", "https://maps.app.goo.gl/B85nkxtttvzUYdh57?g_st=ac"],
  [Phone, "Call", "+91 9703182026 · +91 9642600670"],
  [Truck, "Shipping", "All India shipping available"],
  [Mail, "Write", "Message us through the contact form"],
  [Clock, "Hours", "Please contact us for store hours"],
];

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.post("/contact", f); toast.success("Thank you — we will write back soon."); setF({ name: "", email: "", phone: "", message: "" }); }
    catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (
    <div data-testid="contact-page">
      <PageHero eyebrow="Say namaste" title="Contact" blurb="Questions about a weave, a bridal order or your delivery? We would love to help." image="/img/f2.jpg" />
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-14">
        <div className="lg:col-span-4 space-y-8">
          {INFO.map(([Icon, t, v, href], i) => (
            <Reveal key={t} delay={i * 0.06} className="flex gap-5 border-b border-[#E7E2DA] pb-6">
              <Icon className="w-5 h-5 text-[#8C6A23] mt-1" strokeWidth={1.3} />
              <div><p className="eyebrow">{t}</p>{href ? <a href={href} target="_blank" rel="noreferrer" className="font-display text-2xl mt-1 block text-[#58111A] link-underline">{v}</a> : <p className="font-display text-2xl mt-1">{v}</p>}</div>
            </Reveal>
          ))}
        </div>
        <form onSubmit={submit} className="lg:col-span-7 lg:col-start-6 grid sm:grid-cols-2 gap-8" data-testid="contact-form">
          <Field label="Name" required value={f.name} onChange={set("name")} testid="contact-name-input" />
          <Field label="Email" type="email" required value={f.email} onChange={set("email")} testid="contact-email-input" />
          <Field label="Phone" value={f.phone} onChange={set("phone")} testid="contact-phone-input" className="sm:col-span-2" />
          <label className="block sm:col-span-2">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#57534E]">Message</span>
            <textarea required rows={5} value={f.message} onChange={set("message")} data-testid="contact-message-input" className="mt-2 w-full bg-transparent border-b border-[#D6CFC4] focus:border-[#58111A] outline-none py-2.5 resize-none" />
          </label>
          <GoldButton disabled={busy} className="sm:col-span-2 sm:w-fit" data-testid="contact-submit-btn">{busy ? "SENDING…" : "SEND MESSAGE"}</GoldButton>
        </form>
      </div>
    </div>
  );
}
