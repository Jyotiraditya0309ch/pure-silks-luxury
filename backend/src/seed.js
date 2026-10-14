require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const products = [
  ["Kanjivaram Ruby Temple", "kanjivaram-ruby-temple", "Kanjivaram", "Red", 18900, 22900, ["/img/f1.jpg", "/img/f2.jpg"], ["pure-silk", "wedding", "bestseller"], "Temple border", "Gold zari", "Pure Mulberry Silk", "A luminous ruby silk with traditional temple zari.", 8],
  ["Peacock Blue Vaira", "peacock-blue-vaira", "Kanjivaram", "Green", 21500, 26500, ["/img/f3.jpg", "/img/m1.jpg"], ["pure-silk", "festive", "new"], "Vaira oosi", "Gold zari", "Pure Mulberry Silk", "Peacock tones with a finely woven zari pallu.", 6],
  ["Madhubani Rose Handloom", "madhubani-rose-handloom", "Handloom", "Pink", 12800, 15800, ["/img/m2.jpg", "/img/m3.jpg"], ["handloom", "new"], "Floral jacquard", "Antique zari", "Handwoven Silk", "A soft rose handloom for intimate celebrations.", 12],
  ["Maroon Bridal Heirloom", "maroon-bridal-heirloom", "Bridal", "Maroon", 32000, 38000, ["/img/m4.jpg", "/img/m5.jpg"], ["pure-silk", "wedding", "designer"], "Bridal korvai", "Heavy gold zari", "Pure Mulberry Silk", "A rich bridal drape designed to become an heirloom.", 4],
  ["Gulmohar Gold Silk", "gulmohar-gold-silk", "Designer", "Gold", 24500, 29900, ["/img/m6.jpg", "/img/m7.jpg"], ["designer", "festive", "bestseller"], "Gulmohar motif", "Gold zari", "Pure Mulberry Silk", "Warm gold silk with a sculpted floral pallu.", 7],
  ["Saffron Loom Classic", "saffron-loom-classic", "Handloom", "Orange", 9900, 12500, ["/img/l1.jpg", "/img/f1.jpg"], ["handloom", "sale"], "Checked weave", "Contrast zari", "Handwoven Silk", "An easy, glowing silk for festive mornings.", 10]
];

async function seed() {
  const schema = fs.readFileSync(path.join(__dirname, "..", "sql", "schema.sql"), "utf8");
  await pool.query(schema);
  for (const p of products) {
    await pool.query(
      `INSERT INTO products (name, slug, category, color, price, mrp, images, tags, weave, zari, fabric, description, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (slug) DO NOTHING`,
      [
        p[0],
        p[1],
        p[2],
        p[3],
        p[4],
        p[5],
        JSON.stringify(p[6]),
        JSON.stringify(p[7]),
        p[8],
        p[9],
        p[10],
        p[11],
        p[12],
      ],
    );
  }
  const hash = await bcrypt.hash("change-me-now", 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Store Admin', 'admin@puresilks.local', $1, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [hash],
  );
  console.log("Database schema and starter data are ready.");
  console.log("Admin login: admin@puresilks.local / change-me-now");
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => pool.end());
