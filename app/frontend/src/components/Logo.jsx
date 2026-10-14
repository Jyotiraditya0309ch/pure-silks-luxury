import { Link } from "react-router-dom";

export const LogoMark = ({ className = "w-10 h-10", light = false }) => (
  <img src="/img/company-logo.png" alt="Vijay Handlooms logo" className={`${className} object-cover object-left rounded-full [clip-path:circle(42%_at_50%_50%)]`} />
);

export const Logo = ({ light = false, testid = "brand-logo" }) => (
  <Link to="/" data-testid={testid} className="flex items-center gap-3 group">
    <LogoMark className="w-10 h-10 sm:w-11 sm:h-11 transition-transform duration-500 group-hover:rotate-[8deg]" />
    <span className="leading-none">
      <span className={`block font-royal text-[13px] sm:text-[15px] tracking-[0.18em] ${light ? "text-[#EADBB9]" : "text-[#58111A]"}`}>VIJAY HANDLOOMS</span>
      <span className={`block font-royal text-[8.5px] sm:text-[9.5px] tracking-[0.28em] mt-1 ${light ? "text-[#C5A059]" : "text-[#8C6A23]"}`}>PURE SILK · PAITHANI SAREE</span>
    </span>
  </Link>
);
