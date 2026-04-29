import { ShieldCheck, Trash2, UserRoundCheck, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const { user: currentUser } = useAuth();

  const loadUsers = () => api.get("/admin/users").then(({ data }) => setUsers(data));

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const list = users || [];
    return {
      total: list.length,
      verified: list.filter((item) => item.isEmailVerified).length,
      admins: list.filter((item) => item.role === "admin").length
    };
  }, [users]);

  const deleteUser = async (user) => {
    const ok = window.confirm(`Delete ${user.name} (${user.email})? This also removes their vote records.`);
    if (!ok) return;

    setDeletingId(user._id);
    try {
      const { data } = await api.delete(`/admin/users/${user._id}`);
      toast.success(data.message);
      setUsers((existing) => existing.filter((item) => item._id !== user._id));
    } catch (error) {
      toast.error(error.message || "Could not delete user");
    } finally {
      setDeletingId("");
    }
  };

  if (!users) return <Spinner label="Loading users" />;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wider text-mint">Access control</p>
        <h2 className="page-title mt-2">Registered Users</h2>
        <p className="page-subtitle">Review voter identities, verification status, and admin access.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Total accounts</p>
            <UsersRound className="text-mint" size={20} />
          </div>
          <p className="mt-3 text-3xl font-black text-ink">{stats.total}</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Verified voters</p>
            <UserRoundCheck className="text-blue-700" size={20} />
          </div>
          <p className="mt-3 text-3xl font-black text-ink">{stats.verified}</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Admins</p>
            <ShieldCheck className="text-amber-700" size={20} />
          </div>
          <p className="mt-3 text-3xl font-black text-ink">{stats.admins}</p>
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-black text-ink">User Directory</h3>
          <p className="text-sm text-slate-500">Deleting a user also removes their vote records.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Verification</th>
                <th className="px-5 py-4">Voter ID</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slatebrand">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <div>
                        <p className="font-bold text-ink">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`status-pill ${user.role === "admin" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`status-pill ${user.isEmailVerified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {user.isEmailVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{user.voterId}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={deletingId === user._id || currentUser?.id === user._id}
                      onClick={() => deleteUser(user)}
                    >
                      <Trash2 size={15} />
                      {deletingId === user._id ? "Deleting" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
