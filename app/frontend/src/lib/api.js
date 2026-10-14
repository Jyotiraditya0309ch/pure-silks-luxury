import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api`;
export const GOOGLE_AUTH_URL = `${API}/auth/google`;
export const api = axios.create({ baseURL: API });

api.interceptors.request.use((c) => {
  const t = localStorage.getItem("vkh_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export function errMsg(e) {
  const d = e?.response?.data?.detail;
  if (!d) return e?.message || "Something went wrong. Please try again.";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg || "").filter(Boolean).join(" ");
  return String(d?.msg || d);
}

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const pctOff = (p) => (p?.mrp > p?.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);
