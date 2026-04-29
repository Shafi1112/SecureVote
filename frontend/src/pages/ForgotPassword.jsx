import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthShell } from "./Login";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Could not send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="SecureVote sends a 15-minute reset link.">
      <form onSubmit={submit} className="space-y-4">
        <input className="input" type="email" placeholder="Account email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
      </form>
    </AuthShell>
  );
}
