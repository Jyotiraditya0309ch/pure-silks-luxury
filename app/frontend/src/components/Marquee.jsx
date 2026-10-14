const WORDS = ["Kanjivaram", "Narayanpet Sarees", "Gadwal sarees", "Paithani sarees", "Temple Zari", "Soft Silk"];

const Diamond = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4 sm:w-5 sm:h-5 mx-6 sm:mx-10 shrink-0" aria-hidden="true">
    <path d="M10 1l9 9-9 9-9-9z" fill="none" stroke="#C5A059" />
    <path d="M10 6l4 4-4 4-4-4z" fill="#C5A059" />
  </svg>
);

export default function Marquee({ dark = false }) {
  const row = WORDS.map((w, i) => (
    <span key={i} className="flex items-center shrink-0">
      <span className={`font-display italic font-light text-4xl sm:text-6xl lg:text-7xl whitespace-nowrap ${dark ? "text-[#EADBB9]" : "text-[#58111A]"}`}>{w}</span>
      <Diamond />
    </span>
  ));
  return (
    <div data-testid="editorial-marquee" className={`relative overflow-hidden py-8 sm:py-12 border-y ${dark ? "bg-[#180B0E] border-[#C5A059]/20" : "bg-[#F3EFEA] border-[#C5A059]/30"}`}>
      <div className="marquee-track flex w-max">
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}
