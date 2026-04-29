import { BarChart3, ClipboardList, LogOut, ShieldCheck, UserRound, UsersRound, Vote } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const userLinks = [
  { to: "/dashboard", label: "Elections", icon: Vote },
  { to: "/profile", label: "Voter ID", icon: UserRound }
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: BarChart3 },
  { to: "/admin/elections", label: "Elections", icon: ClipboardList },
  { to: "/admin/users", label: "Users", icon: UsersRound }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "admin" ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200/80 bg-white/95 px-5 py-5 shadow-[10px_0_40px_rgba(15,23,42,0.04)] backdrop-blur lg:block">
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white shadow-sm">
            <ShieldCheck size={22} />
          </span>
          <div>
            <p className="text-base font-black text-ink">SecureVote</p>
            <p className="text-xs text-slate-500">Online Voting System</p>
          </div>
        </div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Workspace</p>
        <nav className="space-y-1.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
                  isActive ? "bg-mint text-white shadow-sm" : "text-slatebrand hover:bg-slate-50 hover:text-ink"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-bold text-ink">{user?.name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mint">{user?.role} portal</p>
              <h1 className="text-xl font-black text-ink">Welcome, {user?.name}</h1>
            </div>
            <button onClick={handleLogout} className="btn-secondary lg:hidden">
              <LogOut size={18} />
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold ${
                    isActive ? "bg-mint text-white" : "bg-slate-100 text-slatebrand"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <div className="mx-auto max-w-[1500px] p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
