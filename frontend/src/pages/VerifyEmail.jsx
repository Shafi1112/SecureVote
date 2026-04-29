import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { AuthShell } from "./Login";

export default function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`).then(({ data }) => setMessage(data.message)).catch((error) => setMessage(error.message || "Verification failed"));
  }, [token]);

  return (
    <AuthShell title="Email verification" subtitle="Your account status is being updated.">
      <p className="text-sm text-slate-600">{message}</p>
      <Link to="/login" className="btn-primary mt-5 w-full">Continue to login</Link>
    </AuthShell>
  );
}
