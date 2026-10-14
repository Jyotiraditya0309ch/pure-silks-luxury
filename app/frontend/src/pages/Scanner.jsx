import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, ImagePlus, LoaderCircle, ScanLine, X } from "lucide-react";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import { api } from "@/lib/api";

const scanFormats = ["qr_code", "ean_13", "ean_8", "code_128", "upc_a", "upc_e"];

function getScanTarget(rawValue) {
  try {
    const url = new URL(rawValue);
    const productPath = url.pathname.match(/\/product\/([^/]+)/);
    if (productPath) return `/product/${productPath[1]}`;
    const productSlug = url.searchParams.get("product");
    if (productSlug) return `/product/${productSlug}`;
  } catch {
    // Plain text codes are handled as product slugs below.
  }
  const value = rawValue.trim();
  return value ? `/product/${encodeURIComponent(value)}` : null;
}

export default function Scanner() {
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const frameRef = useRef(null);
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(true);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const stopCamera = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  };

  const resolveScan = async (rawValue) => {
    const target = getScanTarget(rawValue);
    if (!target) return;
    stopCamera();
    try {
      await api.get(target.replace("/product", "/products"));
      navigate(target);
    } catch {
      toast.error("We couldn't find that product");
    }
  };

  const readFrame = () => {
    if (!videoRef.current || !detectorRef.current || !streamRef.current) return;
    detectorRef.current.detect(videoRef.current).then((codes) => {
      if (codes[0]?.rawValue) resolveScan(codes[0].rawValue);
      else frameRef.current = requestAnimationFrame(readFrame);
    }).catch(() => { frameRef.current = requestAnimationFrame(readFrame); });
  };

  const startCamera = async () => {
    if (!("BarcodeDetector" in window)) { setSupported(false); return; }
    try {
      detectorRef.current = new window.BarcodeDetector({ formats: scanFormats });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
      setActive(true);
      frameRef.current = requestAnimationFrame(readFrame);
    } catch {
      toast.error("Camera access is unavailable. Upload a code image instead.");
    }
  };

  const onImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !("BarcodeDetector" in window)) { setSupported(false); return; }
    setBusy(true);
    try {
      const detector = new window.BarcodeDetector({ formats: scanFormats });
      const codes = await detector.detect(await createImageBitmap(file));
      if (codes[0]?.rawValue) await resolveScan(codes[0].rawValue);
      else toast.error("No QR code or barcode found in that image");
    } catch {
      toast.error("That image could not be scanned");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div data-testid="scanner-page">
      <PageHero eyebrow="Find it instantly" title="Scan a saree" blurb="Scan the QR code or barcode on a piece, card, or invitation to open its product page." image="/img/m4.jpg" />
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-14">
        <div className="relative aspect-square sm:aspect-[4/3] bg-[#180B0E] overflow-hidden border border-[#C5A059]/50">
          <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover ${active ? "" : "hidden"}`} muted playsInline />
          {active && <><div className="absolute inset-[16%] border border-[#EADBB9] shadow-[0_0_0_999px_rgba(24,11,14,0.35)]" /><button onClick={stopCamera} className="absolute top-4 right-4 p-2 text-[#EADBB9]" aria-label="Stop scanner"><X className="w-5 h-5" /></button></>}
          {!active && <div className="absolute inset-0 grid place-items-center p-8 text-center text-[#EADBB9]"><div><ScanLine className="w-12 h-12 mx-auto mb-5 text-[#C5A059]" strokeWidth={1} /><p className="font-display text-3xl">Ready to scan</p><p className="text-sm text-[#EADBB9]/70 mt-2">Allow camera access when prompted.</p></div></div>}
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <button onClick={startCamera} disabled={active} className="inline-flex items-center justify-center gap-2 bg-[#58111A] text-[#EADBB9] py-4 font-royal text-[11px] tracking-[0.2em] disabled:opacity-50" data-testid="scanner-start-btn"><Camera className="w-4 h-4" /> OPEN CAMERA</button>
          <button onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex items-center justify-center gap-2 border border-[#C5A059] text-[#8C6A23] py-4 font-royal text-[11px] tracking-[0.2em] disabled:opacity-50" data-testid="scanner-upload-btn">{busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} UPLOAD CODE IMAGE</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onImage} className="hidden" data-testid="scanner-file-input" />
        </div>
        {!supported && <p className="text-sm text-[#57534E] mt-5 text-center">Live scanning is not supported in this browser. Use an image with a QR code or barcode, or <Link to="/shop" className="text-[#58111A] link-underline">browse the shop</Link>.</p>}
      </section>
    </div>
  );
}