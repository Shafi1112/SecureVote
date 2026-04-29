import Election from "../models/Election.js";
import Vote from "../models/Vote.js";
import { emitElectionResults } from "../config/socket.js";
import { writeAuditLog } from "../utils/audit.js";

const electionResults = (election) => ({
  electionId: election._id,
  title: election.title,
  totalVotes: election.candidates.reduce((sum, candidate) => sum + candidate.votes, 0),
  candidates: election.candidates.map((candidate) => ({
    id: candidate._id,
    name: candidate.name,
    party: candidate.party,
    image: candidate.image,
    votes: candidate.votes
  }))
});

export const listElections = async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { isActive: true, endTime: { $gte: new Date() } };
  const elections = await Election.find(filter).sort({ createdAt: -1 });
  const voted = await Vote.find({ user: req.user._id }).select("election");
  const votedSet = new Set(voted.map((vote) => String(vote.election)));

  res.json(elections.map((election) => ({ ...election.toObject(), hasVoted: votedSet.has(String(election._id)) })));
};

export const getElection = async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) return res.status(404).json({ message: "Election not found" });

  const hasVoted = await Vote.exists({ election: election._id, user: req.user._id });
  res.json({ ...election.toObject(), hasVoted: Boolean(hasVoted) });
};

export const createElection = async (req, res) => {
  const { title, description, startTime, endTime, candidates = [] } = req.body;
  const parsedCandidates = typeof candidates === "string" ? JSON.parse(candidates) : candidates;

  if (new Date(startTime) >= new Date(endTime)) {
    return res.status(422).json({ message: "End time must be after start time" });
  }

  const election = await Election.create({
    title,
    description,
    startTime,
    endTime,
    candidates: parsedCandidates,
    createdBy: req.user._id
  });

  await writeAuditLog({ admin: req.user._id, action: "CREATE_ELECTION", entity: "Election", entityId: election._id });
  res.status(201).json(election);
};

export const addCandidate = async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) return res.status(404).json({ message: "Election not found" });

  election.candidates.push({
    name: req.body.name,
    party: req.body.party,
    manifesto: req.body.manifesto,
    image: req.file ? `/${req.file.path.replaceAll("\\", "/")}` : ""
  });
  await election.save();

  await writeAuditLog({ admin: req.user._id, action: "ADD_CANDIDATE", entity: "Election", entityId: election._id });
  res.status(201).json(election);
};

export const toggleElection = async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) return res.status(404).json({ message: "Election not found" });

  election.isActive = Boolean(req.body.isActive);
  await election.save();

  await writeAuditLog({
    admin: req.user._id,
    action: election.isActive ? "ACTIVATE_ELECTION" : "DEACTIVATE_ELECTION",
    entity: "Election",
    entityId: election._id
  });
  res.json(election);
};

export const castVote = async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) return res.status(404).json({ message: "Election not found" });

  const now = new Date();
  if (!election.isActive || now < election.startTime || now > election.endTime) {
    return res.status(400).json({ message: "This election is not currently open" });
  }

  const candidate = election.candidates.id(req.body.candidateId);
  if (!candidate) return res.status(404).json({ message: "Candidate not found" });

  try {
    await Vote.create({ election: election._id, candidate: candidate._id, user: req.user._id });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already voted in this election" });
    throw error;
  }

  candidate.votes += 1;
  await election.save();

  const results = electionResults(election);
  emitElectionResults(election._id, results);
  res.status(201).json({ message: "Vote recorded successfully", results });
};

export const getResults = async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) return res.status(404).json({ message: "Election not found" });
  res.json(electionResults(election));
};
