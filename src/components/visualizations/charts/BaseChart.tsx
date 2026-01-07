// Utility functions and base chart setup
export function formatNumber(value: number, unit?: string) {
  if (!Number.isFinite(value)) return String(value);
  if (unit === 'AUD' || unit === 'USD') {
    try {
      return new Intl.NumberFormat('en-AU', { style: 'currency', currency: unit }).format(value);
    } catch {
      return `$${value.toLocaleString()}`;
    }
  }
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  return new Intl.NumberFormat('en-AU', { maximumFractionDigits: 2 }).format(value);
}

export const CHART_COLORS = [
  '#2563eb', // blue
  '#16a34a', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export const CHART_PADDING = {
  left: 60,
  right: 20,
  top: 20,
  bottom: 50,
};

export const DEFAULT_CHART_SIZE = {
  width: 700,
  height: 300,
};


