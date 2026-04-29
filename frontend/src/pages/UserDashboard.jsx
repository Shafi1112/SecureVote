import { motion } from "framer-motion";
import { CheckCircle2, Clock, ShieldAlert, Vote } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function UserDashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = () => api.get("/elections").then(({ data }) => setElections(data)).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const vote = async (electionId, candidateId) => {
    try {
      await api.post(`/elections/${electionId}/vote`, { candidateId });
      toast.success("Vote recorded");
      load();
    } catch (error) {
      toast.error(error.message || "Could not cast vote");
    }
  };

  if (loading) return <Spinner label="Loading elections" />;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wider text-mint">Voter workspace</p>
        <h2 className="page-title mt-2">Active Elections</h2>
        <p className="page-subtitle">Review candidates and cast one secure vote per election.</p>
      </div>

      {!user?.isEmailVerified && (
        <div className="panel flex items-center gap-3 border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          <ShieldAlert size={20} />
          Verify your email with OTP before voting.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {elections.map((election, index) => (
          <motion.section key={election._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="panel overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-ink">{election.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{election.description || "No description provided."}</p>
                </div>
                <span className={`status-pill ${election.hasVoted ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                  {election.hasVoted ? "Voted" : election.status}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Clock size={15} />
                {new Date(election.startTime).toLocaleString()} - {new Date(election.endTime).toLocaleString()}
              </div>
            </div>

            <div className="space-y-3 p-5">
              {election.candidates.map((candidate) => (
                <div key={candidate._id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-teal-200 hover:bg-teal-50/30">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slatebrand">
                      {candidate.name?.charAt(0)?.toUpperCase()}
                    </span>
                    <div>
                      <p className="font-bold text-ink">{candidate.name}</p>
                      <p className="text-xs text-slate-500">{candidate.party || "Independent"}</p>
                    </div>
                  </div>
                  <button className="btn-primary py-2" disabled={election.hasVoted || !user?.isEmailVerified} onClick={() => vote(election._id, candidate._id)}>
                    {election.hasVoted ? <CheckCircle2 size={17} /> : <Vote size={17} />}
                    Vote
                  </button>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {!elections.length && (
        <div className="panel p-10 text-center">
          <Vote className="mx-auto text-slate-300" size={38} />
          <p className="mt-3 font-bold text-ink">No active elections</p>
          <p className="text-sm text-slate-500">New elections will appear here when an admin activates them.</p>
        </div>
      )}
    </div>
  );
}
