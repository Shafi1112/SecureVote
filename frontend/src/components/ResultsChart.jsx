import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ResultsChart({ results }) {
  const labels = results?.candidates?.map((candidate) => candidate.name) || [];
  const votes = results?.candidates?.map((candidate) => candidate.votes) || [];

  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data: votes,
            backgroundColor: ["#0f766e", "#2563eb", "#f59e0b", "#db2777", "#64748b"],
            borderWidth: 0
          }
        ]
      }}
      options={{ plugins: { legend: { position: "bottom" } }, cutout: "64%" }}
    />
  );
}
