require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");
const { OAuth2Client } = require("google-auth-library");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT || 8000);
const jwtSecret = process.env.JWT_SECRET || "development-only-secret";
const googleClient = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL)
  : null;
const statuses = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const TRY_ON_LIMIT = 5;
const tryOnUsage = new Map();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "8mb" }));

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const sendError = (res, status, message) => res.status(status).json({ detail: message });
const tokenFor = (user) => jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role });

function auth(required = true) {
  return (req, res, next) => {
    const value = req.headers.authorization || "";
    if (!value.startsWith("Bearer ")) return required ? sendError(res, 401, "Authentication required.") : next();
    try {
      req.user = jwt.verify(value.slice(7), jwtSecret);
      next();
    } catch {
      return sendError(res, 401, "Your session has expired.");
    }
  };
}
const admin = [auth(), (req, res, next) => req.user.role === "admin" ? next() : sendError(res, 403, "Admin access required.")];
const productView = (row) => ({ ...row, images: row.images || [], tags: row.tags || [], price: Number(row.price), mrp: Number(row.mrp), stock: Number(row.stock), rating: Number(row.rating) });
const orderView = (row, items) => ({ ...row, total: Number(row.total), subtotal: Number(row.subtotal), discount: Number(row.discount), gift_wrap: Number(row.gift_wrap), items });

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/auth/google", (req, res) => {
  if (!googleClient) return sendError(res, 503, "Google authentication is not configured.");
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });
  res.redirect(url);
});

app.get("/api/auth/google/callback", asyncRoute(async (req, res) => {
  if (!googleClient) return sendError(res, 503, "Google authentication is not configured.");
  const { code } = req.query;
  if (!code) return sendError(res, 400, "Google did not return an authorization code.");
  const { tokens } = await googleClient.getToken(code);
  const ticket = await googleClient.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
  const profile = ticket.getPayload();
  if (!profile?.sub || !profile.email || profile.email_verified !== true) return sendError(res, 401, "Google account email could not be verified.");

  let result = await pool.query("SELECT * FROM users WHERE google_sub = $1 OR email = $2 LIMIT 1", [profile.sub, profile.email.toLowerCase()]);
  let user = result.rows[0];
  if (user) {
    result = await pool.query("UPDATE users SET google_sub = $1, name = COALESCE(NULLIF(name, ''), $2) WHERE id = $3 RETURNING *", [profile.sub, profile.name || profile.email.split("@")[0], user.id]);
    user = result.rows[0];
  } else {
    const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
    result = await pool.query(
      "INSERT INTO users (name,email,password_hash,google_sub) VALUES ($1,$2,$3,$4) RETURNING *",
      [profile.name || profile.email.split("@")[0], profile.email.toLowerCase(), randomPassword, profile.sub],
    );
    user = result.rows[0];
  }
  const token = tokenFor(user);
  const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3001";
  res.redirect(`${origin}/account#google_token=${encodeURIComponent(token)}`);
}));

app.post("/api/auth/register", asyncRoute(async (req, res) => {
  const { name, email, password, phone = "" } = req.body;
  if (!name || !email || !password || password.length < 6) return sendError(res, 400, "Name, email and a password of at least 6 characters are required.");
  const hash = await bcrypt.hash(password, 12);
  try {
    const { rows } = await pool.query("INSERT INTO users (name,email,password_hash,phone) VALUES ($1,$2,$3,$4) RETURNING *", [name.trim(), email.toLowerCase().trim(), hash, phone]);
    res.status(201).json({ token: tokenFor(rows[0]), user: publicUser(rows[0]) });
  } catch (e) {
    if (e.code === "23505") return sendError(res, 409, "An account with this email already exists.");
    throw e;
  }
}));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [(email || "").toLowerCase().trim()]);
  if (!rows[0] || !(await bcrypt.compare(password || "", rows[0].password_hash))) return sendError(res, 401, "Invalid email or password.");
  res.json({ token: tokenFor(rows[0]), user: publicUser(rows[0]) });
}));

app.get("/api/auth/me", auth(), asyncRoute(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
  if (!rows[0]) return sendError(res, 401, "User not found.");
  res.json(publicUser(rows[0]));
}));

app.get("/api/products/facets", asyncRoute(async (req, res) => {
  const { rows } = await pool.query("SELECT category, color FROM products ORDER BY category, color");
  res.json({ categories: [...new Set(rows.map((r) => r.category))], colors: [...new Set(rows.map((r) => r.color))] });
}));

app.get("/api/products", asyncRoute(async (req, res) => {
  const { collection, q, category, color, min_price, max_price, sort = "featured", limit = 24 } = req.query;
  const values = [];
  const where = [];
  const add = (sql, value) => { values.push(value); where.push(sql.replace("?", `$${values.length}`)); };
  if (collection) add("tags @> ?::jsonb", JSON.stringify([collection]));
  if (q) {
    values.push(`%${q}%`, `%${q}%`);
    where.push(`(name ILIKE $${values.length - 1} OR description ILIKE $${values.length})`);
  }
  if (category) add("category = ANY(?)", String(category).split(","));
  if (color) add("color = ANY(?)", String(color).split(","));
  if (min_price) add("price >= ?", Number(min_price));
  if (max_price) add("price <= ?", Number(max_price));
  const order = { newest: "created_at DESC", price_asc: "price ASC", price_desc: "price DESC", rating: "rating DESC" }[sort] || "created_at DESC";
  values.push(Math.min(Number(limit) || 24, 100));
  const sql = `SELECT * FROM products ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY ${order} LIMIT $${values.length}`;
  const { rows } = await pool.query(sql, values);
  res.json({ items: rows.map(productView), total: rows.length });
}));

app.get("/api/products/:slug", asyncRoute(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM products WHERE slug = $1", [req.params.slug]);
  if (!rows[0]) return sendError(res, 404, "Saree not found.");
  const { rows: related } = await pool.query(
    "SELECT * FROM products WHERE id <> $1 AND category = $2 ORDER BY created_at DESC LIMIT 4",
    [rows[0].id, rows[0].category],
  );
  res.json({ product: productView(rows[0]), related: related.map(productView) });
}));

app.post("/api/coupons/validate", (req, res) => {
  const code = String(req.body.code || "").toUpperCase();
  if (code !== "SILK10") return sendError(res, 400, "That privilege code is not valid.");
  res.json({ code, percent: 10 });
});

app.post("/api/orders", auth(false), asyncRoute(async (req, res) => {
  const { items, shipping, payment_method = "cod", coupon, gift_wrap = false } = req.body;
  if (!Array.isArray(items) || !items.length || !shipping?.email) return sendError(res, 400, "Order items and delivery details are required.");
  const paymentMethods = new Set(["cod", "upi", "netbanking", "card"]);
  if (!paymentMethods.has(payment_method)) return sendError(res, 400, "Please choose a valid payment method.");
  const ids = items.map((i) => Number(i.product_id)).filter(Boolean);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: products } = await client.query("SELECT * FROM products WHERE id = ANY($1) FOR UPDATE", [ids]);
    const byId = new Map(products.map((p) => [p.id, p]));
    const orderItems = items.map((i) => {
      const p = byId.get(Number(i.product_id));
      const qty = Math.max(1, Math.min(10, Number(i.qty) || 1));
      if (!p || p.stock < qty) throw Object.assign(new Error(`${p?.name || "A product"} is out of stock.`), { status: 400 });
      return { p, qty };
    });
    const subtotal = orderItems.reduce((sum, { p, qty }) => sum + p.price * qty, 0);
    const discount = String(coupon || "").toUpperCase() === "SILK10" ? Math.round(subtotal * 0.1) : 0;
    const gift = gift_wrap ? 250 : 0;
    const shippingFee = subtotal - discount >= 5000 || subtotal === 0 ? 0 : 150;
    const total = subtotal - discount + shippingFee + gift;
    const orderNumber = `VKH${String(Date.now()).slice(-8)}`;
    const timeline = [{ status: "Placed", at: new Date().toISOString() }];
    const inserted = await client.query(
      `INSERT INTO orders (order_number,user_id,email,shipping,payment_method,subtotal,discount,gift_wrap,total,timeline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [orderNumber, req.user?.id || null, shipping.email, shipping, payment_method, subtotal, discount, gift, total, JSON.stringify(timeline)],
    );
    for (const { p, qty } of orderItems) {
      await client.query("INSERT INTO order_items (order_id,product_id,name,price,qty,image) VALUES ($1,$2,$3,$4,$5,$6)", [inserted.rows[0].id, p.id, p.name, p.price, qty, p.images?.[0] || ""]);
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [qty, p.id]);
    }
    await client.query("COMMIT");
    res.status(201).json({ ...orderView(inserted.rows[0], orderItems.map(({ p, qty }) => ({ ...productView(p), name: p.name, qty, price: p.price }))), order_number: orderNumber });
  } catch (e) {
    await client.query("ROLLBACK");
    if (e.status) return sendError(res, e.status, e.message);
    throw e;
  } finally {
    client.release();
  }
}));

async function findOrder(where, values) {
  const result = await pool.query(`SELECT * FROM orders WHERE ${where}`, values);
  if (!result.rows[0]) return null;
  const { rows: items } = await pool.query("SELECT * FROM order_items WHERE order_id = $1 ORDER BY id", [result.rows[0].id]);
  return orderView(result.rows[0], items);
}

app.get("/api/orders/track", asyncRoute(async (req, res) => {
  const order = await findOrder("order_number = $1 AND LOWER(email) = LOWER($2)", [req.query.order_number, req.query.email]);
  if (!order) return sendError(res, 404, "We could not find that order.");
  res.json(order);
}));
app.get("/api/orders/mine", auth(), asyncRoute(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);
  const result = await Promise.all(rows.map(async (o) => orderView(o, (await pool.query("SELECT * FROM order_items WHERE order_id = $1", [o.id])).rows)));
  res.json(result);
}));

app.post("/api/newsletter", asyncRoute(async (req, res) => {
  if (!req.body.email) return sendError(res, 400, "Email is required.");
  await pool.query("INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT DO NOTHING", [req.body.email.toLowerCase().trim()]);
  res.status(201).json({ ok: true });
}));
app.post("/api/contact", asyncRoute(async (req, res) => {
  const { name, email, phone = "", message } = req.body;
  if (!name || !email || !message) return sendError(res, 400, "Name, email and message are required.");
  await pool.query("INSERT INTO contact_messages (name,email,phone,message) VALUES ($1,$2,$3,$4)", [name, email, phone, message]);
  res.status(201).json({ ok: true });
}));

function tryOnCount(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const current = tryOnUsage.get(userId);
  if (!current || current.date !== today) {
    const fresh = { date: today, count: 0 };
    tryOnUsage.set(userId, fresh);
    return fresh;
  }
  return current;
}

function imageBufferFromDataUrl(value) {
  const match = String(value || "").match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) return null;
  return Buffer.from(match[2], "base64");
}

app.post("/api/tryon", auth(), asyncRoute(async (req, res) => {
  const input = imageBufferFromDataUrl(req.body.image_base64);
  const productId = Number(req.body.product_id);
  if (!input || !productId) return sendError(res, 400, "A valid photo and saree selection are required.");
  if (input.length > 6 * 1024 * 1024) return sendError(res, 413, "Please choose a photo smaller than 6 MB.");

  const usage = tryOnCount(req.user.id);
  if (usage.count >= TRY_ON_LIMIT) return sendError(res, 429, "You have used all 5 try-ons for today. Please come back tomorrow.");

  const { rows } = await pool.query("SELECT id, name, images FROM products WHERE id = $1", [productId]);
  const product = rows[0];
  if (!product) return sendError(res, 404, "That saree could not be found.");
  const productImage = String(product.images?.[0] || "");
  const imageName = path.basename(productImage);
  const sareePath = path.resolve(__dirname, "../../img", imageName);
  if (!imageName || !productImage.startsWith("/img/") || imageName !== productImage.slice(5) || !fs.existsSync(sareePath)) {
    return sendError(res, 422, "This saree does not have a usable image yet.");
  }

  try {
    const base = sharp(input).rotate().resize({ width: 768, height: 1024, fit: "inside", withoutEnlargement: true });
    const metadata = await base.metadata();
    const width = metadata.width || 768;
    const height = metadata.height || 1024;
    const overlay = await sharp(sareePath)
      .resize({ width: Math.round(width * 0.88), height: Math.round(height * 0.62), fit: "cover" })
      .removeAlpha()
      .ensureAlpha()
      .linear([1, 1, 1, 0.72], [0, 0, 0, 0])
      .png()
      .toBuffer();
    const result = await base.composite([{ input: overlay, gravity: "southeast", blend: "soft-light" }]).png().toBuffer();
    usage.count += 1;
    res.json({ image: `data:image/png;base64,${result.toString("base64")}`, remaining: TRY_ON_LIMIT - usage.count, product: product.name });
  } catch (error) {
    if (error.code === "INPUT_BUFFER_UNSUPPORTED" || error.message?.includes("Input buffer")) return sendError(res, 400, "That photo could not be processed. Please choose a JPG or PNG image.");
    throw error;
  }
}));

app.get("/api/admin/stats", admin, asyncRoute(async (req, res) => {
  const [revenue, orders, pending, products, customers, lowStock] = await Promise.all([
    pool.query("SELECT COALESCE(SUM(total),0) AS value FROM orders WHERE status <> 'Cancelled'"),
    pool.query("SELECT COUNT(*) AS value FROM orders"),
    pool.query("SELECT COUNT(*) AS value FROM orders WHERE status NOT IN ('Delivered','Cancelled')"),
    pool.query("SELECT COUNT(*) AS value FROM products"),
    pool.query("SELECT COUNT(*) AS value FROM users WHERE role = 'customer'"),
    pool.query("SELECT COUNT(*) AS value FROM products WHERE stock <= 3"),
  ]);
  res.json({ revenue: Number(revenue.rows[0].value), orders: Number(orders.rows[0].value), pending: Number(pending.rows[0].value), products: Number(products.rows[0].value), customers: Number(customers.rows[0].value), low_stock: Number(lowStock.rows[0].value) });
}));
app.get("/api/admin/categories", admin, asyncRoute(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY name");
  res.json(rows);
}));
app.post("/api/admin/categories", admin, asyncRoute(async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) return sendError(res, 400, "Category name is required.");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  try {
    const { rows } = await pool.query("INSERT INTO categories (name,slug) VALUES ($1,$2) RETURNING *", [name, slug]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === "23505") return sendError(res, 409, "That category already exists.");
    throw e;
  }
}));
app.delete("/api/admin/categories/:id", admin, asyncRoute(async (req, res) => {
  const result = await pool.query("DELETE FROM categories WHERE id = $1", [req.params.id]);
  if (!result.rowCount) return sendError(res, 404, "Category not found.");
  res.status(204).end();
}));
app.get("/api/admin/orders", admin, asyncRoute(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
  res.json(await Promise.all(rows.map(async (o) => orderView(o, (await pool.query("SELECT * FROM order_items WHERE order_id = $1", [o.id])).rows))));
}));
app.patch("/api/admin/orders/:id", admin, asyncRoute(async (req, res) => {
  if (!statuses.includes(req.body.status)) return sendError(res, 400, "Invalid order status.");
  const { rows } = await pool.query("UPDATE orders SET status = $1, timeline = timeline || $2::jsonb WHERE id = $3 RETURNING *", [req.body.status, JSON.stringify([{ status: req.body.status, at: new Date().toISOString() }]), req.params.id]);
  if (!rows[0]) return sendError(res, 404, "Order not found.");
  res.json(rows[0]);
}));
app.post("/api/admin/products", admin, asyncRoute(async (req, res) => {
  const p = req.body;
  if (!p.name || !p.category || !p.price) return sendError(res, 400, "Name, category and price are required.");
  const slug = String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-4);
  const { rows } = await pool.query(
    `INSERT INTO products (slug,name,category,color,price,mrp,images,tags,weave,zari,fabric,description,stock)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [slug, p.name, p.category, p.color || "Red", Number(p.price), Number(p.mrp || p.price), JSON.stringify(p.images || []), JSON.stringify(p.tags || []), p.weave || "", p.zari || "Gold zari", p.fabric || "Pure Mulberry Silk", p.description || "", Number(p.stock || 0)],
  );
  res.status(201).json(productView(rows[0]));
}));
app.put("/api/admin/products/:id", admin, asyncRoute(async (req, res) => {
  const p = req.body;
  const { rows } = await pool.query(
    `UPDATE products SET name=$1,category=$2,color=$3,price=$4,mrp=$5,images=$6,tags=$7,weave=$8,zari=$9,fabric=$10,description=$11,stock=$12 WHERE id=$13 RETURNING *`,
    [p.name, p.category, p.color, Number(p.price), Number(p.mrp || p.price), JSON.stringify(p.images || []), JSON.stringify(p.tags || []), p.weave || "", p.zari || "Gold zari", p.fabric || "Pure Mulberry Silk", p.description || "", Number(p.stock || 0), req.params.id],
  );
  if (!rows[0]) return sendError(res, 404, "Product not found.");
  res.json(productView(rows[0]));
}));
app.delete("/api/admin/products/:id", admin, asyncRoute(async (req, res) => {
  const result = await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  if (!result.rowCount) return sendError(res, 404, "Product not found.");
  res.status(204).end();
}));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ detail: "The server encountered an unexpected error." });
});
app.listen(port, () => console.log(`Pure Silks backend listening on http://localhost:${port}`));
