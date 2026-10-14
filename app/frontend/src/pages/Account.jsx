import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import AuthForm from "@/components/AuthForm";
import { useStore } from "@/context/Store";
import { api, inr } from "@/lib/api";

function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api.get("/orders/mine").then((r) => setOrders(Array.isArray(r.data) ? r.data : [])).catch(() => setOrders([])); }, []);
  if (orders === null) return <div className="h-40 shimmer" />;
  if (!orders.length) return <p className="font-display text-2xl text-[#57534E]" data-testid="no-orders">No orders yet. <Link to="/shop" className="text-[#58111A] link-underline">Begin with a silk.</Link></p>;
  return (
    <div className="divide-y divide-[#E7E2DA] border-y border-[#E7E2DA]" data-testid="my-orders">
      {orders.map((o) => (
        <div key={o.id} className="py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center" data-testid={`my-order-${o.order_number}`}>
          <div><p className="font-royal tracking-[0.15em] text-[#58111A]">{o.order_number}</p><p className="text-xs text-[#57534E]">{new Date(o.created_at).toLocaleDateString("en-IN")}</p></div>
          <div className="flex -space-x-3">{o.items.slice(0, 3).map((i) => <img key={i.product_id} src={i.image} alt="" className="w-10 h-12 object-cover border-2 border-[#FAF8F5]" />)}</div>
          <p className="font-display text-xl">{inr(o.total)}</p>
          <div className="flex items-center gap-3 justify-between"><span className="text-xs tracking-[0.15em] uppercase bg-[#58111A]/10 text-[#58111A] px-2.5 py-1">{o.status}</span>
            <Link to={`/track-order?order=${o.order_number}`} className="text-xs text-[#58111A] link-underline">Track</Link></div>
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const { user, signOut } = useStore();
  return (
    <div data-testid="account-page">
      <PageHero eyebrow="Patron's room" title={user ? `Namaste, ${user.name?.split(" ")[0] || ""}` : "My Account"} blurb={user ? user.email : "Sign in to view your orders, wishlist and try-on studio."} />
      <div className="max-w-[1300px] mx-auto px-5 sm:px-8 py-14">
        {!user ? <div className="flex justify-center"><AuthForm /></div> : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <aside className="lg:col-span-3 space-y-3">
              <Link to="/wishlist" className="block font-display text-2xl link-underline w-fit" data-testid="account-wishlist-link">Wishlist</Link>
              <Link to="/try-on" className="block font-display text-2xl link-underline w-fit" data-testid="account-tryon-link">Try-on studio</Link>
              <Link to="/track-order" className="block font-display text-2xl link-underline w-fit" data-testid="account-track-link">Track an order</Link>
              {user.role === "admin" && <Link to="/admin" className="block font-display text-2xl text-[#8C6A23] link-underline w-fit" data-testid="account-admin-link">Admin dashboard</Link>}
              <button onClick={signOut} className="block text-sm tracking-[0.2em] uppercase text-[#58111A] pt-6" data-testid="logout-btn">Sign out</button>
            </aside>
            <div className="lg:col-span-9"><p className="eyebrow mb-6">Your orders</p><Orders /></div>
          </div>
        )}
      </div>
    </div>
  );
}
