import { BarChart3, Plus, Power, RadioTower } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ResultsChart from "../components/ResultsChart";
import Spinner from "../components/Spinner";
import api from "../services/api";
import { socket } from "../services/socket";

const blankElection = { title: "", description: "", startTime: "", endTime: "" };
const blankCandidate = { electionId: "", name: "", party: "", manifesto: "", file: null };

export default function AdminElections() {
  const [elections, setElections] = useState([]);
  const [results, setResults] = useState({});
  const [form, setForm] = useState(blankElection);
  const [candidate, setCandidate] = useState(blankCandidate);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get("/elections");
    setElections(data);
    setLoading(false);
    data.forEach((election) => api.get(`/elections/${election._id}/results`).then(({ data: res }) => setResults((old) => ({ ...old, [election._id]: res }))));
  };

  useEffect(() => {
    load();
    socket.connect();
    socket.on("results:update", (payload) => setResults((old) => ({ ...old, [payload.electionId]: payload })));
    return () => {
      socket.off("results:update");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    elections.forEach((election) => socket.emit("results:join", election._id));
    return () => elections.forEach((election) => socket.emit("results:leave", election._id));
  }, [elections]);

  const createElection = async (event) => {
    event.preventDefault();
    try {
      await api.post("/elections", form);
      toast.success("Election created");
      setForm(blankElection);
      load();
    } catch (error) {
      toast.error(error.message || "Could not create election");
    }
  };

  const addCandidate = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", candidate.name);
    formData.append("party", candidate.party);
    formData.append("manifesto", candidate.manifesto);
    if (candidate.file) formData.append("candidateImage", candidate.file);
    try {
      await api.post(`/elections/${candidate.electionId}/candidates`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Candidate added");
      setCandidate(blankCandidate);
      load();
    } catch (error) {
      toast.error(error.message || "Could not add candidate");
    }
  };

  const toggle = async (id, isActive) => {
    await api.patch(`/elections/${id}/status`, { isActive });
    toast.success(isActive ? "Election activated" : "Election deactivated");
    load();
  };

  if (loading) return <Spinner label="Loading elections" />;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wider text-mint">Election operations</p>
        <h2 className="page-title mt-2">Manage Elections</h2>
        <p className="page-subtitle">Create contests, add candidates, activate voting windows, and monitor live results.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          <form onSubmit={createElection} className="panel space-y-3 p-5">
            <h2 className="text-lg font-black text-ink">Create Election</h2>
            <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="input min-h-24" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="input" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            <input className="input" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
            <button className="btn-primary w-full"><Plus size={18} /> Create</button>
          </form>

          <form onSubmit={addCandidate} className="panel space-y-3 p-5">
            <h2 className="text-lg font-black text-ink">Add Candidate</h2>
            <select className="input" value={candidate.electionId} onChange={(e) => setCandidate({ ...candidate, electionId: e.target.value })} required>
              <option value="">Choose election</option>
              {elections.map((election) => <option key={election._id} value={election._id}>{election.title}</option>)}
            </select>
            <input className="input" placeholder="Candidate name" value={candidate.name} onChange={(e) => setCandidate({ ...candidate, name: e.target.value })} required />
            <input className="input" placeholder="Party" value={candidate.party} onChange={(e) => setCandidate({ ...candidate, party: e.target.value })} />
            <textarea className="input min-h-20" placeholder="Manifesto" value={candidate.manifesto} onChange={(e) => setCandidate({ ...candidate, manifesto: e.target.value })} />
            <input className="input" type="file" accept="image/*" onChange={(e) => setCandidate({ ...candidate, file: e.target.files?.[0] })} />
            <button className="btn-primary w-full"><Plus size={18} /> Add candidate</button>
          </form>
        </div>

        <div className="space-y-5">
          {elections.map((election) => (
            <section key={election._id} className="panel overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-ink">{election.title}</h3>
                      {election.isActive && <span className="status-pill bg-emerald-50 text-emerald-700"><RadioTower size={13} className="mr-1" /> Live</span>}
                    </div>
                    <p className="text-sm text-slate-500">{election.candidates.length} candidates - {results[election._id]?.totalVotes || 0} votes</p>
                  </div>
                  <button className={election.isActive ? "btn-secondary" : "btn-primary"} onClick={() => toggle(election._id, !election.isActive)}>
                    <Power size={18} />
                    {election.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-[1fr_240px]">
                <div className="space-y-2">
                  {election.candidates.map((candidate) => (
                    <div key={candidate._id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                      <div>
                        <p className="font-bold text-ink">{candidate.name}</p>
                        <p className="text-xs text-slate-500">{candidate.party || "Independent"}</p>
                      </div>
                      <span className="status-pill bg-slate-100 text-slate-700">{candidate.votes} votes</span>
                    </div>
                  ))}
                  {!election.candidates.length && <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">No candidates added yet.</p>}
                </div>
                <div className="mx-auto grid h-[240px] w-[240px] place-items-center rounded-lg bg-slate-50 p-3">
                  {results[election._id] ? <ResultsChart results={results[election._id]} /> : <BarChart3 className="text-slate-300" size={38} />}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
