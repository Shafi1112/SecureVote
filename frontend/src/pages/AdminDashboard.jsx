import { Activity, BadgeCheck, Boxes, Clock3, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import api from "../services/api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/admin/summary"), api.get("/admin/audit-logs")]).then(([summaryRes, logsRes]) => {
      setSummary(summaryRes.data);
      setLogs(logsRes.data);
    });
  }, []);

  if (!summary) return <Spinner label="Loading admin dashboard" />;

  const cards = [
    { label: "Registered Users", value: summary.users, icon: UsersRound, tone: "bg-teal-50 text-mint" },
    { label: "Total Elections", value: summary.elections, icon: Boxes, tone: "bg-blue-50 text-blue-700" },
    { label: "Votes Cast", value: summary.votes, icon: BadgeCheck, tone: "bg-amber-50 text-amber-700" },
    { label: "Live Elections", value: summary.activeElections, icon: Activity, tone: "bg-rose-50 text-rose-700" }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wider text-mint">Command center</p>
        <h2 className="page-title mt-2">Admin Overview</h2>
        <p className="page-subtitle">Monitor participation, voting activity, and recent administrative actions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="panel p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{label}</span>
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
                <Icon size={20} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-ink">{value}</p>
          </div>
        ))}
      </div>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-ink">Audit Logs</h3>
            <p className="text-sm text-slate-500">Latest admin activity across SecureVote.</p>
          </div>
          <Clock3 className="text-slate-400" size={20} />
        </div>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-sm">
              <div>
                <p className="font-semibold text-ink">{log.action}</p>
                <p className="text-slate-500">{log.admin?.name} - {log.entity}</p>
              </div>
              <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {!logs.length && <p className="text-sm text-slate-500">No admin actions recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}
