"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface SectionChartProps {
  data: Record<string, any>;
  type?: "bar" | "doughnut";
}

export default function SectionChart({ data, type = "bar" }: SectionChartProps) {
  // Extract numeric values for visualization
  const numericEntries = Object.entries(data).filter(
    ([_, value]) => typeof value === "number" && value > 0
  );

  // Also check nested objects for numeric values
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (typeof nestedValue === "number" && nestedValue > 0) {
          numericEntries.push([`${key} - ${nestedKey}`, nestedValue]);
        }
      });
    }
  });

  if (numericEntries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
        <p className="text-sm">No numeric data to visualize</p>
      </div>
    );
  }

  const labels = numericEntries.map(([key]) =>
    key
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
  const values = numericEntries.map(([_, value]) => value as number);

  const colors = [
    "rgba(99, 102, 241, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(139, 92, 246, 0.8)",
    "rgba(6, 182, 212, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(34, 197, 94, 0.8)",
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: colors.slice(0, values.length).map((c) => c.replace("0.8", "1")),
        borderWidth: 2,
        borderRadius: type === "bar" ? 8 : 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === "doughnut",
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return new Intl.NumberFormat("en-AU", {
              style: "currency",
              currency: "AUD",
              minimumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
    scales:
      type === "bar"
        ? {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value: any) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                  return `$${value}`;
                },
              },
            },
          }
        : undefined,
  };

  return (
    <div className="h-64">
      {type === "bar" ? (
        <Bar data={chartData} options={options} />
      ) : (
        <Doughnut data={chartData} options={options} />
      )}
    </div>
  );
}

