import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Ctx = createContext(null);
const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; }
};
const snap = (p) => ({ id: p.id, slug: p.slug, name: p.name, price: p.price, mrp: p.mrp, image: p.images?.[0] || "", category: p.category, color: p.color, stock: p.stock, images: p.images, tags: p.tags });

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(() => load("vkh_cart", []));
  const [wishlist, setWishlist] = useState(() => load("vkh_wish", []));
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => { localStorage.setItem("vkh_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("vkh_wish", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.replace(/^#/, "")).get("google_token");
    if (token) {
      localStorage.setItem("vkh_token", token);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    if (!localStorage.getItem("vkh_token")) return;
    api.get("/auth/me").then((r) => setUser(r.data)).catch(() => localStorage.removeItem("vkh_token"));
  }, []);

  const signIn = useCallback((data) => { localStorage.setItem("vkh_token", data.token); setUser(data.user); }, []);
  const signOut = useCallback(() => { localStorage.removeItem("vkh_token"); setUser(null); }, []);

  const addToCart = (p, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.product.id === p.id);
      if (ex) return c.map((i) => (i.product.id === p.id ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
      return [...c, { product: snap(p), qty }];
    });
    toast.success(`${p.name} added to your bag`);
    setCartOpen(true);
  };
  const setQty = (id, qty) => setCart((c) => c.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)));
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.product.id !== id));
  const clearCart = () => setCart([]);
  const inWishlist = (id) => wishlist.some((w) => w.id === id);
  const toggleWishlist = (p) => {
    if (inWishlist(p.id)) { setWishlist((w) => w.filter((x) => x.id !== p.id)); toast("Removed from wishlist"); }
    else { setWishlist((w) => [...w, snap(p)]); toast.success("Saved to wishlist"); }
  };
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.qty * i.product.price, 0);

  return (
    <Ctx.Provider value={{ user, signIn, signOut, cart, addToCart, setQty, removeFromCart, clearCart, cartCount, subtotal, cartOpen, setCartOpen, wishlist, toggleWishlist, inWishlist }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
