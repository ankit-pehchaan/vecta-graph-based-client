"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TimelineEvent {
  id: string;
  node: string;
  field: string;
  value: any;
  previousValue?: any;
  timestamp: Date;
  source?: string;
  isConflict?: boolean;
}

interface HistoryChartProps {
  events: TimelineEvent[];
  title?: string;
}

export default function HistoryChart({ events, title = "Value Over Time" }: HistoryChartProps) {
  // Filter to only numeric values
  const numericEvents = events
    .filter((e) => typeof e.value === "number")
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (numericEvents.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
        <p className="text-sm">Not enough numeric data points to chart</p>
      </div>
    );
  }

  const data = {
    labels: numericEvents.map((e) =>
      new Intl.DateTimeFormat("en-AU", {
        month: "short",
        day: "numeric",
      }).format(e.timestamp)
    ),
    datasets: [
      {
        label: title,
        data: numericEvents.map((e) => e.value),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: numericEvents.map((e) =>
          e.isConflict ? "rgb(245, 158, 11)" : "rgb(99, 102, 241)"
        ),
        pointBorderColor: numericEvents.map((e) =>
          e.isConflict ? "rgb(245, 158, 11)" : "rgb(99, 102, 241)"
        ),
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            if (value >= 1000) {
              return new Intl.NumberFormat("en-AU", {
                style: "currency",
                currency: "AUD",
                minimumFractionDigits: 0,
              }).format(value);
            }
            return value.toLocaleString();
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: any) => {
            if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
            return value;
          },
        },
      },
    },
  };

  return (
    <div className="h-48">
      <Line data={data} options={options} />
    </div>
  );
}

