"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  chartType: string;
  data: Record<string, any>;
  title: string;
  config?: Record<string, any>;
}

// Modern color palette
const COLORS = [
  "rgba(99, 102, 241, 0.8)",   // Indigo
  "rgba(16, 185, 129, 0.8)",   // Emerald
  "rgba(245, 158, 11, 0.8)",   // Amber
  "rgba(239, 68, 68, 0.8)",    // Red
  "rgba(139, 92, 246, 0.8)",   // Purple
  "rgba(6, 182, 212, 0.8)",    // Cyan
  "rgba(236, 72, 153, 0.8)",   // Pink
  "rgba(34, 197, 94, 0.8)",    // Green
];

const BORDER_COLORS = COLORS.map(c => c.replace("0.8", "1"));

export default function Chart({ chartType, data, title, config }: ChartProps) {
  // Default configuration with modern styling
  const defaultConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'DM Sans', sans-serif",
            size: 12,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: "'DM Sans', sans-serif",
          size: 16,
          weight: "bold" as const,
        },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { family: "'DM Sans', sans-serif" },
        bodyFont: { family: "'DM Sans', sans-serif" },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
      },
    },
    ...config,
  };

  // Transform data to Chart.js format if needed
  let chartData = data;

  if (!data.labels && !data.datasets) {
    if (Array.isArray(data)) {
      chartData = {
        labels: data.map((item: any) => item.label || item.name || ""),
        datasets: [
          {
            label: title,
            data: data.map((item: any) => item.value || item.data || 0),
            backgroundColor: COLORS,
            borderColor: BORDER_COLORS,
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      };
    } else {
      const entries = Object.entries(data).filter(([_, v]) => typeof v === "number");
      chartData = {
        labels: entries.map(([k]) => 
          k.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        ),
        datasets: [
          {
            label: title,
            data: entries.map(([_, v]) => v as number),
            backgroundColor: COLORS.slice(0, entries.length),
            borderColor: BORDER_COLORS.slice(0, entries.length),
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      };
    }
  }

  const chartTypeLower = chartType.toLowerCase();

  const barLineConfig = {
    ...defaultConfig,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "'DM Sans', sans-serif", size: 11 },
        },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          font: { family: "'DM Sans', sans-serif", size: 11 },
          callback: (value: any) => {
            if (typeof value === "number") {
              if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
            }
            return value;
          },
        },
      },
    },
  };

  // Ensure chartData has the required structure
  const safeChartData = chartData.datasets ? chartData : {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: COLORS,
      borderColor: BORDER_COLORS,
      borderWidth: 2,
    }],
  };

  switch (chartTypeLower) {
    case "bar":
    case "bar_chart":
      return (
        <div className="w-full h-64">
          <Bar data={safeChartData as any} options={barLineConfig as any} />
        </div>
      );

    case "line":
    case "line_chart":
      // Add fill and tension for line charts
      const lineData = {
        ...safeChartData,
        datasets: safeChartData.datasets?.map((ds: any) => ({
          ...ds,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        })) || [],
      };
      return (
        <div className="w-full h-64">
          <Line data={lineData as any} options={barLineConfig as any} />
        </div>
      );

    case "pie":
    case "pie_chart":
      return (
        <div className="w-full h-64">
          <Pie data={safeChartData as any} options={defaultConfig as any} />
        </div>
      );

    case "donut":
    case "doughnut":
    case "donut_chart":
      return (
        <div className="w-full h-64">
          <Doughnut 
            data={safeChartData as any} 
            options={{
              ...defaultConfig,
              cutout: "60%",
            } as any} 
          />
        </div>
      );

    default:
      return (
        <div className="w-full h-64">
          <Bar data={safeChartData as any} options={barLineConfig as any} />
        </div>
      );
  }
}
