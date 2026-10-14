import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import AuthForm, { GoldButton } from "@/components/AuthForm";
import { useStore } from "@/context/Store";
import { api, errMsg, inr } from "@/lib/api";

const resize = (file) => new Promise((res, rej) => {
  const img = new Image();
  img.onload = () => {
    const s = Math.min(1, 1024 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = img.width * s; c.height = img.height * s;
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    res(c.toDataURL("image/jpeg", 0.88));
  };
  img.onerror = rej;
});

function SareePicker({ items, value, onPick }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1" data-lenis-prevent data-testid="tryon-saree-picker">
      {items.map((p) => (
        <button key={p.id} onClick={() => onPick(p)} data-testid={`tryon-pick-${p.slug}`}
          className={`shrink-0 w-24 text-left transition-opacity ${value?.id === p.id ? "" : "opacity-60 hover:opacity-100"}`}>
          <div className={`aspect-[3/4] overflow-hidden border-2 ${value?.id === p.id ? "border-[#58111A]" : "border-transparent"}`}><img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" /></div>
          <p className="text-[11px] mt-1.5 leading-tight">{p.name}</p>
        </button>
      ))}
    </div>
  );
}

export default function TryOn() {
  const { user } = useStore();
  const [sp] = useSearchParams();
  const [items, setItems] = useState([]);
  const [saree, setSaree] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get("/products", { params: { limit: 40 } }).then((r) => {
      const list = Array.isArray(r.data?.items) ? r.data.items : [];
      setItems(list);
      setSaree(list.find((p) => p.slug === sp.get("product")) || list[0] || null);
    }).catch(() => setItems([]));
  }, [sp]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    setPhoto(await resize(f)); setResult(null);
  };
  const generate = async () => {
    if (!TRY_ON_CONFIGURED) return;
    setBusy(true); setResult(null);
    try {
      const { data } = await api.post("/tryon", { product_id: saree.id, image_base64: photo });
      setResult(data.image); toast.success(`Your drape is ready · ${data.remaining} try-ons left today`);
    } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };

  return (
    <div data-testid="tryon-page">
      <PageHero eyebrow="AI studio" title="Virtual Try-On" blurb="Upload a clear, front-facing photo. Choose a saree. We drape it on you in moments." image="/img/m2.jpg" />
      {!user ? (
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-2 gap-12 items-start" data-testid="tryon-auth-gate">
          <div><p className="font-display text-3xl sm:text-4xl font-light leading-tight max-w-md">Sign in to open the studio — your photos stay private to your account.</p><p className="text-[#57534E] mt-4 text-sm">Each account gets 5 try-ons per day.</p></div>
          <AuthForm />
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-10">
            <div>
              <p className="eyebrow">Step 1 · Your photo</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" data-testid="tryon-file-input" />
              <button onClick={() => fileRef.current?.click()} data-testid="tryon-upload-btn"
                className="mt-4 w-full border border-dashed border-[#C5A059] hover:bg-[#C5A059]/5 py-10 flex flex-col items-center gap-3 transition-colors">
                {photo ? <img src={photo} alt="Your upload" className="h-40 object-contain" /> : <Upload className="w-7 h-7 text-[#8C6A23]" strokeWidth={1.2} />}
                <span className="text-sm">{photo ? "Choose a different photo" : "Upload a photo (JPG or PNG)"}</span>
              </button>
            </div>
            <div>
              <p className="eyebrow mb-4">Step 2 · Choose your saree</p>
              <SareePicker items={items} value={saree} onPick={(p) => { setSaree(p); setResult(null); }} />
              {saree && <p className="text-sm mt-2 text-[#57534E]">Selected: <span className="text-[#1C1917]">{saree.name}</span> · {inr(saree.price)}</p>}
            </div>
            <GoldButton onClick={generate} disabled={!photo || !saree || busy} className="w-full inline-flex items-center justify-center gap-2" data-testid="tryon-generate-btn">
              <Sparkles className="w-4 h-4" /> {busy ? "DRAPING YOUR SAREE…" : "DRAPE IT ON ME"}
            </GoldButton>
          </div>
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] bg-[#F3EFEA] overflow-hidden border border-[#C5A059]/30" data-testid="tryon-result-panel">
              <AnimatePresence>
                {busy && <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 shimmer grid place-items-center"><p className="font-display italic text-2xl text-[#58111A]">Weaving your look…</p></motion.div>}
                {result && !busy && <motion.img key="res" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} src={result} alt="Your virtual try-on" className="absolute inset-0 w-full h-full object-contain" data-testid="tryon-result-image" />}
              </AnimatePresence>
              {!busy && !result && <div className="absolute inset-0 grid place-items-center p-8 text-center"><p className="font-display text-2xl text-[#57534E] max-w-sm">Your draped portrait will appear here.</p></div>}
            </div>
            {result && (
              <div className="flex gap-3 mt-4">
                <a href={result} download="vkh-try-on.png" className="inline-flex items-center gap-2 text-sm text-[#58111A] link-underline" data-testid="tryon-download-btn"><Download className="w-4 h-4" /> Download</a>
                <button onClick={() => setResult(null)} className="inline-flex items-center gap-2 text-sm text-[#57534E] link-underline" data-testid="tryon-reset-btn"><RotateCcw className="w-4 h-4" /> Try another</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
