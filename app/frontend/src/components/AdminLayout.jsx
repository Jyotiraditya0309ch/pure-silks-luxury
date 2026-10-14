import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, ExternalLink, LogOut, Menu, Package, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useStore } from "@/context/Store";

const links = [
  { label: "Overview", to: "/admin", end: true, icon: BarChart3 },
  { label: "Orders", to: "/admin?tab=orders", icon: ShoppingCart },
  { label: "Products & stock", to: "/admin?tab=products", icon: Package },
];

export default function AdminLayout() {
  const { user, signOut } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const logout = () => { signOut(); navigate("/admin"); };

  return (
    <div className="admin-shell" data-testid="admin-shell">
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-brand">
          <Logo light />
          <p>House administration</p>
          <button className="admin-close" onClick={() => setOpen(false)} aria-label="Close menu"><X className="w-5 h-5" /></button>
        </div>
        <nav className="admin-nav">
          <p className="admin-nav-label">Workspace</p>
          {links.map(({ label, to, end, icon: Icon }) => (
            <NavLink key={label} to={to} end={end} onClick={() => setOpen(false)} className={() => `admin-nav-link ${location.search === new URL(to, window.location.origin).search ? "is-active" : ""}`}>
              <Icon className="w-[17px] h-[17px]" strokeWidth={1.7} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user"><span className="admin-avatar">{user?.name?.charAt(0)?.toUpperCase() || "A"}</span><span><strong>{user?.name || "Administrator"}</strong><small>{user?.email}</small></span></div>
          <Link to="/" className="admin-footer-link"><ExternalLink className="w-4 h-4" /> View storefront</Link>
          <button onClick={logout} className="admin-footer-link admin-logout"><LogOut className="w-4 h-4" /> Sign out</button>
        </div>
      </aside>
      {open && <button className="admin-backdrop" onClick={() => setOpen(false)} aria-label="Close menu" />}
      <section className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="w-5 h-5" /></button>
          <div><span>PURE SILKS / ADMIN</span><strong>Operations centre</strong></div>
          <Link to="/" className="admin-store-link">Storefront <ExternalLink className="w-3.5 h-3.5" /></Link>
        </header>
        <main className="admin-content"><Outlet /></main>
      </section>
    </div>
  );
}
