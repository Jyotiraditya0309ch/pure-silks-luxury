import { useState } from "react";
import { toast } from "sonner";
import { api, errMsg, GOOGLE_AUTH_URL } from "@/lib/api";
import { useStore } from "@/context/Store";

export const Field = ({ label, testid, className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="text-[11px] tracking-[0.2em] uppercase text-[#57534E]">{label}</span>
    <input {...props} data-testid={testid} className="mt-2 w-full bg-transparent border-b border-[#D6CFC4] focus:border-[#58111A] outline-none py-2.5 text-[15px] transition-colors" />
  </label>
);

export const GoldButton = ({ children, className = "", ...props }) => (
  <button {...props} className={`bg-[#58111A] hover:bg-[#3F0A12] text-[#EADBB9] py-4 px-8 font-royal text-[11px] tracking-[0.25em] transition-colors disabled:opacity-60 ${className}`}>{children}</button>
);

export default function AuthForm({ onDone, showRegister = true, showGoogle = true }) {
  const { signIn } = useStore();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(`/auth/${mode}`, body);
      signIn(data); toast.success(`Welcome, ${data.user.name || "patron"}`); onDone?.(data.user);
    } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (
    <div className="w-full max-w-md" data-testid="auth-form">
      <div className="flex gap-8 border-b border-[#E7E2DA] mb-8">
        {[["login", "Sign in"], ...(showRegister ? [["register", "Create account"]] : [])].map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)} data-testid={`auth-tab-${m}`} className={`pb-3 font-display text-2xl -mb-px border-b-2 transition-colors ${mode === m ? "border-[#58111A] text-[#1C1917]" : "border-transparent text-stone-500"}`}>{l}</button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-6">
        {mode === "register" && <Field label="Full name" required value={form.name} onChange={set("name")} testid="auth-name-input" />}
        <Field label="Email" type="email" required value={form.email} onChange={set("email")} testid="auth-email-input" />
        {mode === "register" && <Field label="Phone" value={form.phone} onChange={set("phone")} testid="auth-phone-input" />}
        <Field label="Password" type="password" required minLength={6} value={form.password} onChange={set("password")} testid="auth-password-input" />
        <GoldButton disabled={busy} className="w-full" data-testid="auth-submit-btn">{busy ? "PLEASE WAIT…" : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}</GoldButton>
      </form>
      {showGoogle && <><div className="flex items-center gap-3 my-6 text-xs text-[#57534E]">
        <span className="h-px bg-[#E7E2DA] flex-1" /><span>OR</span><span className="h-px bg-[#E7E2DA] flex-1" />
      </div><a href={GOOGLE_AUTH_URL} className="w-full border border-[#D6CFC4] py-3.5 flex items-center justify-center gap-3 text-sm hover:border-[#58111A] transition-colors" data-testid="google-auth-btn">
        <span className="font-medium text-[#4285F4]">G</span>Continue with Google
      </a></>}
    </div>
  );
}
