import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthShell } from "./Login";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      toast.success(data.message);
      setPendingEmail(data.email || form.email);
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/verify-email-otp", { email: pendingEmail, otp });
      toast.success("Email verified. You can sign in now.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/resend-email-otp", { email: pendingEmail });
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  };

  if (pendingEmail) {
    return (
      <AuthShell title="Verify your email" subtitle={`Enter the 6-digit OTP sent to ${pendingEmail}.`}>
        <form onSubmit={verifyOtp} className="space-y-4">
          <input
            className="input text-center text-xl font-bold tracking-[0.35em]"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />
          <button className="btn-primary w-full" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        <button type="button" className="btn-secondary mt-4 w-full" onClick={resendOtp} disabled={loading}>
          Resend OTP
        </button>
        <button type="button" className="mt-4 text-sm font-semibold text-slatebrand" onClick={() => setPendingEmail("")}>
          Use another email
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create voter account" subtitle="A 6-digit OTP will be sent to your email.">
      <form onSubmit={submit} className="space-y-4">
        <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
      </form>
      <p className="mt-5 text-sm text-slate-500">Already registered? <Link className="font-semibold text-mint" to="/login">Sign in</Link></p>
    </AuthShell>
  );
}
