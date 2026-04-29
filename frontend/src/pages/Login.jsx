import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success("Signed in securely");
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in to SecureVote" subtitle="Protected access for voters and administrators.">
      <form onSubmit={submit} className="space-y-4">
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
      <div className="mt-5 flex justify-between text-sm">
        <Link className="font-semibold text-mint" to="/register">Create account</Link>
        <Link className="font-semibold text-slatebrand" to="/forgot-password">Forgot password?</Link>
      </div>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_32rem),linear-gradient(135deg,#f8fbfd,#eef4f8)] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lift">
        <div className="border-b border-slate-100 bg-slate-50/70 px-7 py-6">
          <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-ink text-white shadow-sm"><ShieldCheck /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-mint">SecureVote</p>
            <h1 className="mt-1 text-2xl font-black text-ink">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        </div>
        <div className="p-7">
        {children}
        </div>
      </motion.div>
    </div>
  );
}
