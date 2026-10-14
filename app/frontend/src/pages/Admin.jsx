import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Camera, ImagePlus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthForm, { Field, GoldButton } from "@/components/AuthForm";
import { useStore } from "@/context/Store";
import { api, errMsg, inr } from "@/lib/api";

const STATUSES = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const TAGS = ["pure-silk", "handloom", "wedding", "festive", "designer", "new", "bestseller", "sale"];
const EMPTY = { name: "", category: "Kanjivaram", color: "Red", price: "", mrp: "", images: "", tags: [], weave: "", zari: "Gold zari", fabric: "Pure Silk", description: "", stock: 10 };

const resizeImage = (file) => new Promise((resolve, reject) => {
  const image = new Image();
  const url = URL.createObjectURL(file);
  image.onload = () => {
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    resolve(canvas.toDataURL("image/jpeg", 0.86));
  };
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image could not be read.")); };
  image.src = url;
});

function Stats({ s }) {
  const cards = [["Revenue", inr(s.revenue)], ["Orders", s.orders], ["To fulfil", s.pending], ["Products", s.products], ["Customers", s.customers], ["Low stock", s.low_stock]];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="admin-stats">
      {cards.map(([l, v]) => <div key={l} className="border border-[#C5A059]/30 bg-[#FAF8F5] p-5"><p className="eyebrow">{l}</p><p className="font-display text-3xl mt-2" data-testid={`stat-${l.toLowerCase().replace(/\s+/g, "-")}`}>{v ?? "—"}</p></div>)}
    </div>
  );
}

function OrdersTable({ orders, onStatus }) {
  if (!orders.length) return <p className="text-[#57534E] py-10">No orders yet.</p>;
  return (
    <div className="overflow-x-auto" data-lenis-prevent>
      <table className="w-full text-sm min-w-[760px]" data-testid="admin-orders-table">
        <thead><tr className="text-left text-[11px] tracking-[0.15em] uppercase text-[#57534E] border-b border-[#E7E2DA]"><th className="py-3">Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-[#E7E2DA]" data-testid={`admin-order-${o.order_number}`}>
              <td className="py-3"><p className="font-royal text-[#58111A]">{o.order_number}</p><p className="text-xs text-[#57534E]">{new Date(o.created_at).toLocaleString("en-IN")}</p></td>
              <td><p>{o.shipping.name}</p><p className="text-xs text-[#57534E]">{o.shipping.phone} · {o.shipping.city}</p></td>
              <td>{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
              <td>{inr(o.total)}</td>
              <td>
                <Select value={o.status} onValueChange={(v) => onStatus(o.id, v)}>
                  <SelectTrigger className="w-[170px] rounded-none h-9" data-testid={`order-status-${o.order_number}`}><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductForm({ initial, onSaved, onClose }) {
  const [f, setF] = useState(initial ? { ...initial, images: initial.images.join(", ") } : EMPTY);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const onImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      const results = await Promise.allSettled(imageFiles.map(resizeImage));
      const images = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
      const failed = results.length - images.length;
      if (images.length) setUploadedImages((current) => [...current, ...images]);
      if (failed) toast.error(`${failed} image${failed === 1 ? "" : "s"} could not be previewed.`);
      if (!imageFiles.length) toast.error("Please choose an image file.");
    } catch (error) {
      toast.error(error.message || "One of the images could not be uploaded.");
    } finally {
      setUploading(false);
    }
  };
  const removeUploaded = (image) => setUploadedImages((current) => current.filter((item) => item !== image));
  const save = async (e) => {
    e.preventDefault();
    const body = { ...f, price: Number(f.price), mrp: Number(f.mrp || f.price), stock: Number(f.stock), images: [...f.images.split(",").map((s) => s.trim()).filter(Boolean), ...uploadedImages] };
    ["id", "slug", "rating", "reviews_count", "created_at"].forEach((k) => delete body[k]);
    try {
      if (initial) await api.put(`/admin/products/${initial.id}`, body); else await api.post("/admin/products", body);
      toast.success("Saree saved"); await onSaved(); onClose();
    } catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <form onSubmit={save} className="grid sm:grid-cols-2 gap-5" data-testid="product-form">
      <Field label="Name" required value={f.name} onChange={set("name")} testid="pf-name" className="sm:col-span-2" />
      <Field label="Category" required value={f.category} onChange={set("category")} testid="pf-category" />
      <Field label="Colour" required value={f.color} onChange={set("color")} testid="pf-color" />
      <Field label="Price (₹)" type="number" required value={f.price} onChange={set("price")} testid="pf-price" />
      <Field label="MRP (₹)" type="number" value={f.mrp} onChange={set("mrp")} testid="pf-mrp" />
      <Field label="Stock" type="number" required value={f.stock} onChange={set("stock")} testid="pf-stock" />
      <Field label="Weave" value={f.weave} onChange={set("weave")} testid="pf-weave" />
      <div className="sm:col-span-2">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#57534E]">Saree photos</span>
        <div className="mt-2 admin-upload-box">
          <div className="flex flex-wrap gap-2">
            <label className="admin-upload-button"><ImagePlus className="w-4 h-4" /> Gallery<input type="file" accept="image/*" multiple onChange={onImages} className="sr-only" data-testid="pf-gallery-input" /></label>
            <label className="admin-upload-button"><Camera className="w-4 h-4" /> Camera<input type="file" accept="image/*" capture="environment" onChange={onImages} className="sr-only" data-testid="pf-camera-input" /></label>
            {uploading && <span className="text-xs text-[#6d6262] self-center">Preparing photos…</span>}
          </div>
          <p className="text-xs text-[#6d6262] mt-3">Upload multiple angles from a phone, including front, pallu, blouse and detail shots.</p>
          {(uploadedImages.length > 0 || f.images) && <div className="flex flex-wrap gap-2 mt-4">
            {f.images.split(",").map((image) => image.trim()).filter(Boolean).map((image) => <img key={image} src={image} alt="Saree" className="admin-upload-preview" />)}
            {uploadedImages.map((image) => <div key={image} className="relative"><img src={image} alt="New saree upload" className="admin-upload-preview" /><button type="button" onClick={() => removeUploaded(image)} className="admin-upload-remove" aria-label="Remove uploaded image"><X className="w-3 h-3" /></button></div>)}
          </div>}
        </div>
      </div>
      <Field label="Description" value={f.description} onChange={set("description")} testid="pf-description" className="sm:col-span-2" />
      <Field label="Fabric" value={f.fabric} onChange={set("fabric")} testid="pf-fabric" />
      <Field label="Zari / finish" value={f.zari} onChange={set("zari")} testid="pf-zari" />
      <div className="sm:col-span-2 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button type="button" key={t} onClick={() => setF({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] })} data-testid={`pf-tag-${t}`}
            className={`px-3 py-1.5 text-xs border ${f.tags.includes(t) ? "bg-[#58111A] text-[#EADBB9] border-[#58111A]" : "border-[#D6CFC4]"}`}>{t}</button>
        ))}
      </div>
      <GoldButton className="sm:col-span-2" data-testid="pf-save-btn">SAVE SAREE</GoldButton>
    </form>
  );
}

function ProductsTable({ products, reload }) {
  const [edit, setEdit] = useState(undefined);
  const del = async (p) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    try { await api.delete(`/admin/products/${p.id}`); toast.success("Deleted"); reload(); } catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <>
      <button onClick={() => setEdit(null)} className="mb-6 inline-flex items-center gap-2 bg-[#58111A] text-[#EADBB9] px-5 py-3 font-royal text-[11px] tracking-[0.2em]" data-testid="add-product-btn"><Plus className="w-4 h-4" /> ADD SAREE</button>
      <div className="overflow-x-auto" data-lenis-prevent>
        <table className="w-full text-sm min-w-[700px]" data-testid="admin-products-table">
          <thead><tr className="text-left text-[11px] tracking-[0.15em] uppercase text-[#57534E] border-b border-[#E7E2DA]"><th className="py-3">Saree</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#E7E2DA]" data-testid={`admin-product-${p.slug}`}>
                <td className="py-3 flex items-center gap-3"><img src={p.images?.[0]} alt="" className="w-10 h-12 object-cover" />{p.name}</td>
                <td>{p.category}</td><td>{inr(p.price)}</td>
                <td className={p.stock <= 3 ? "text-[#58111A] font-medium" : ""}>{p.stock}</td>
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => setEdit(p)} className="p-2 hover:text-[#58111A]" data-testid={`edit-product-${p.slug}`} aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => del(p)} className="p-2 hover:text-[#58111A]" data-testid={`delete-product-${p.slug}`} aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={edit !== undefined} onOpenChange={(o) => !o && setEdit(undefined)}>
        <DialogContent className="bg-[#FAF8F5] max-w-2xl max-h-[90vh] overflow-y-auto rounded-none" data-lenis-prevent>
          <DialogTitle className="font-display text-3xl font-light">{edit ? "Edit saree" : "Add a saree"}</DialogTitle>
          {edit !== undefined && <ProductForm key={edit?.id || "new"} initial={edit} onSaved={reload} onClose={() => setEdit(undefined)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CategoryManager({ categories, reload }) {
  const [name, setName] = useState("");
  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try { await api.post("/admin/categories", { name }); setName(""); reload(); toast.success("Category added"); } catch (er) { toast.error(errMsg(er)); }
  };
  const remove = async (category) => {
    if (!window.confirm(`Remove ${category.name}? Existing products will keep their category.`)) return;
    try { await api.delete(`/admin/categories/${category.id}`); reload(); toast.success("Category removed"); } catch (er) { toast.error(errMsg(er)); }
  };
  return (
    <section className="admin-category-box" data-testid="admin-categories">
      <div><p className="eyebrow">Catalog structure</p><h2 className="font-display text-3xl mt-1">Categories</h2><p className="text-sm text-[#6d6262] mt-2">Create the sections customers will browse.</p></div>
      <form onSubmit={add} className="flex gap-2 mt-5 max-w-lg"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wedding lehengas" className="admin-category-input" aria-label="New category name" /><GoldButton type="submit">ADD CATEGORY</GoldButton></form>
      <div className="flex flex-wrap gap-2 mt-5">{categories.map((category) => <span key={category.id} className="admin-category-chip">{category.name}<button type="button" onClick={() => remove(category)} aria-label={`Remove ${category.name}`}>×</button></span>)}</div>
    </section>
  );
}

export default function Admin() {
  const { user, signOut } = useStore();
  const [params, setParams] = useSearchParams();
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const load = useCallback(() => {
    return Promise.all([
      api.get("/admin/stats").then((r) => setStats(r.data || {})).catch(() => {}),
      api.get("/admin/orders").then((r) => setOrders(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      api.get("/products", { params: { limit: 200, sort: "newest" } }).then((r) => setProducts(r.data?.items || [])).catch(() => {}),
      api.get("/admin/categories").then((r) => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
    ]);
  }, []);
  useEffect(() => { if (user?.role === "admin") load(); }, [user, load]);
  const onStatus = async (id, status) => {
    try { await api.patch(`/admin/orders/${id}`, { status }); toast.success(`Marked ${status}`); load(); } catch (er) { toast.error(errMsg(er)); }
  };

  if (!user) return <div className="admin-login" data-testid="admin-login"><div className="admin-login-card"><p className="eyebrow">House team access</p><h1 className="font-display text-5xl font-light mt-2 mb-3">Welcome back</h1><p className="text-sm text-[#6d6262] mb-8">Sign in with your administrator account to manage the store.</p><AuthForm showRegister={false} showGoogle={false} /></div></div>;
  if (user.role !== "admin") return <div className="admin-login"><div className="admin-login-card text-center"><p className="eyebrow">Access restricted</p><h1 className="font-display text-4xl font-light mt-2">Administrator account required</h1><p className="text-sm text-[#6d6262] mt-4">You are currently signed in as {user.email}. Sign out, then use your administrator credentials to enter this workspace.</p><button onClick={signOut} className="mt-8 bg-[#58111A] text-[#EADBB9] py-4 px-8 font-royal text-[11px] tracking-[0.2em]" data-testid="switch-admin-account">SIGN OUT AND SWITCH ACCOUNT</button></div></div>;
  const tab = ["overview", "orders", "products"].includes(params.get("tab")) ? params.get("tab") : "overview";
  return (
    <div className="admin-dashboard" data-testid="admin-dashboard">
      <div className="admin-heading"><div><p className="eyebrow">House ledger</p><h1 className="font-display text-5xl sm:text-6xl font-light mt-2">Admin Dashboard</h1></div><p className="admin-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p></div>
      <Tabs value={tab} onValueChange={(value) => setParams(value === "overview" ? {} : { tab: value })}>
        <TabsList className="bg-transparent border-b border-[#E7E2DA] rounded-none w-full justify-start h-auto p-0 mb-8 gap-6">
          {["overview", "orders", "products"].map((t) => (
            <TabsTrigger key={t} value={t} data-testid={`admin-tab-${t}`} className="rounded-none px-0 pb-3 font-display text-xl capitalize data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#58111A]">{t}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview"><Stats s={stats} /><p className="eyebrow mt-12 mb-4">Latest orders</p><OrdersTable orders={orders.slice(0, 5)} onStatus={onStatus} /></TabsContent>
        <TabsContent value="orders"><OrdersTable orders={orders} onStatus={onStatus} /></TabsContent>
        <TabsContent value="products"><CategoryManager categories={categories} reload={load} /><div className="mt-12"><ProductsTable products={products} reload={load} /></div></TabsContent>
      </Tabs>
    </div>
  );
}
