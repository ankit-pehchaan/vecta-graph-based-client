"use client";

interface SummaryCardProps {
  label: string;
  value: number;
  type?: "currency" | "number" | "percent";
  color?: "indigo" | "emerald" | "rose" | "amber" | "slate";
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: "bg-indigo-100 text-indigo-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: "bg-emerald-100 text-emerald-500",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    icon: "bg-rose-100 text-rose-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: "bg-amber-100 text-amber-500",
  },
  slate: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    icon: "bg-slate-100 text-slate-500",
  },
};

export default function SummaryCard({
  label,
  value,
  type = "currency",
  color = "slate",
  trend,
  icon,
}: SummaryCardProps) {
  const colors = colorMap[color];

  const formatValue = () => {
    if (type === "currency") {
      return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (type === "percent") {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  return (
    <div className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className={`text-xl font-bold ${value >= 0 ? "text-slate-900" : "text-rose-600"}`}>
            {formatValue()}
          </p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
      {trend && trend !== "neutral" && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
          {trend === "up" ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          <span>{trend === "up" ? "Positive" : "Negative"}</span>
        </div>
      )}
    </div>
  );
}

