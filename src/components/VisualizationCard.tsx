import { useEffect, useMemo, useState } from 'react';
import type { VisualizationMessage, VizSeries } from '../services/api';

function formatNumber(value: number, unit?: string) {
  if (!Number.isFinite(value)) return String(value);
  if (unit && /^[A-Z]{3}$/.test(unit)) {
    try {
      return new Intl.NumberFormat('en-AU', { style: 'currency', currency: unit }).format(value);
    } catch {
      // fall through
    }
  }
  return new Intl.NumberFormat('en-AU', { maximumFractionDigits: 2 }).format(value);
}

// Compact formatter for Y-axis labels to prevent overflow
function formatAxisLabel(value: number, unit?: string) {
  if (!Number.isFinite(value)) return String(value);

  const absValue = Math.abs(value);
  let formatted: string;

  if (absValue >= 1_000_000) {
    formatted = (value / 1_000_000).toFixed(1) + 'M';
  } else if (absValue >= 1_000) {
    formatted = (value / 1_000).toFixed(1) + 'K';
  } else {
    formatted = value.toFixed(0);
  }

  // Add currency symbol prefix if applicable
  if (unit && /^[A-Z]{3}$/.test(unit)) {
    return '$' + formatted;
  }
  return formatted;
}

function asNumericX(x: string | number): number | null {
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  if (typeof x === 'string') {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function buildLinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
}

function LineChart({
  series,
  yUnit,
  xLabel,
  yLabel,
}: {
  series: VizSeries[];
  yUnit?: string;
  xLabel: string;
  yLabel: string;
}) {
  const width = 700;
  const height = 260;
  const padding = { left: 70, right: 20, top: 20, bottom: 44 };

  const { mappedSeries, xMin, xMax, yMin, yMax, xTicks } = useMemo(() => {
    const allX: number[] = [];
    const allY: number[] = [];

    const mapped = series.map((s) => {
      const pts: Array<{ xRaw: string | number; x: number; y: number }> = [];
      s.data.forEach((p) => {
        const xNum = asNumericX(p.x);
        if (xNum === null) return;
        if (!Number.isFinite(p.y)) return;
        pts.push({ xRaw: p.x, x: xNum, y: p.y });
        allX.push(xNum);
        allY.push(p.y);
      });
      // ensure x sorted for nice lines
      pts.sort((a, b) => a.x - b.x);
      return { ...s, _points: pts };
    });

    const xMinV = allX.length ? Math.min(...allX) : 0;
    const xMaxV = allX.length ? Math.max(...allX) : 1;
    // Start Y from 0 for better visualization when all values are positive
    const yMinV = allY.length ? Math.min(0, Math.min(...allY)) : 0;
    const yMaxV = allY.length ? Math.max(...allY) : 1;

    // Generate X ticks based on data range
    const xRange = xMaxV - xMinV;
    const xTickCount = Math.min(xRange + 1, 11); // Max 11 ticks for 10-year range
    const xTicksArr: number[] = [];
    for (let i = 0; i < xTickCount; i++) {
      xTicksArr.push(xMinV + (xRange * i) / (xTickCount - 1 || 1));
    }

    return { mappedSeries: mapped, xMin: xMinV, xMax: xMaxV, yMin: yMinV, yMax: yMaxV, xTicks: xTicksArr };
  }, [series]);

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;

  const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]" style={{ height: 'auto', aspectRatio: `${width}/${height}` }}>
        <style>
          {`
            @keyframes vizDash { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
          `}
        </style>

        {/* horizontal grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding.top + (plotH * i) / 4;
          return (
            <line
              key={i}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Y axis */}
        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={height - padding.bottom}
          stroke="#9ca3af"
          strokeWidth="1.5"
        />
        {/* X axis */}
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
          stroke="#9ca3af"
          strokeWidth="1.5"
        />

        {/* Y-axis ticks and labels */}
        {Array.from({ length: 5 }).map((_, i) => {
          const t = i / 4;
          const yVal = yMax - t * ySpan;
          const y = padding.top + t * plotH;
          return (
            <g key={`yt-${i}`}>
              {/* tick mark */}
              <line x1={padding.left - 4} x2={padding.left} y1={y} y2={y} stroke="#9ca3af" strokeWidth="1" />
              {/* label */}
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#6b7280">
                {formatAxisLabel(yVal, yUnit)}
              </text>
            </g>
          );
        })}

        {/* X-axis ticks and labels */}
        {xTicks.map((xVal, i) => {
          const x = padding.left + ((xVal - xMin) / xSpan) * plotW;
          return (
            <g key={`xt-${i}`}>
              {/* tick mark */}
              <line x1={x} x2={x} y1={height - padding.bottom} y2={height - padding.bottom + 4} stroke="#9ca3af" strokeWidth="1" />
              {/* label */}
              <text x={x} y={height - padding.bottom + 16} textAnchor="middle" fontSize="10" fill="#6b7280">
                {Number.isInteger(xVal) ? xVal : xVal.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={width / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="#4b5563" fontWeight="500">
          {xLabel}
        </text>
        <text
          x={16}
          y={height / 2}
          textAnchor="middle"
          fontSize="11"
          fill="#4b5563"
          fontWeight="500"
          transform={`rotate(-90 16 ${height / 2})`}
        >
          {yLabel}
        </text>

        {/* series lines */}
        {mappedSeries.map((s, idx) => {
          const pts = s._points.map((p) => ({
            x: padding.left + ((p.x - xMin) / xSpan) * plotW,
            y: padding.top + (1 - (p.y - yMin) / ySpan) * plotH,
          }));
          const d = buildLinePath(pts);
          const color = colors[idx % colors.length];
          return (
            <g key={s.name}>
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 1200,
                  strokeDashoffset: 1200,
                  animation: 'vizDash 900ms ease-out forwards',
                }}
              />
              {/* end dot */}
              {pts.length > 0 && (
                <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4" fill={color} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BarChart({
  series,
  yUnit,
  yLabel,
}: {
  series: VizSeries[];
  yUnit?: string;
  yLabel: string;
}) {
  const width = 700;
  const height = 260;
  const padding = { left: 70, right: 20, top: 24, bottom: 44 };

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setAnimate(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  const categories = useMemo(() => {
    const first = series[0]?.data || [];
    return first.map((p) => String(p.x));
  }, [series]);

  const values = useMemo(() => {
    const first = series[0]?.data || [];
    return first.map((p) => p.y);
  }, [series]);

  const yMax = values.length ? Math.max(...values) : 1;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const barW = categories.length ? plotW / categories.length : plotW;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]" style={{ height: 'auto', aspectRatio: `${width}/${height}` }}>
        {/* horizontal grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding.top + (plotH * i) / 4;
          return (
            <line
              key={i}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Y axis */}
        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={height - padding.bottom}
          stroke="#9ca3af"
          strokeWidth="1.5"
        />
        {/* X axis */}
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
          stroke="#9ca3af"
          strokeWidth="1.5"
        />

        {/* Y-axis ticks and labels */}
        {Array.from({ length: 5 }).map((_, i) => {
          const t = i / 4;
          const yVal = yMax - t * yMax;
          const y = padding.top + t * plotH;
          return (
            <g key={`yt-${i}`}>
              <line x1={padding.left - 4} x2={padding.left} y1={y} y2={y} stroke="#9ca3af" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#6b7280">
                {formatAxisLabel(yVal, yUnit)}
              </text>
            </g>
          );
        })}

        {/* Y-axis label */}
        <text
          x={16}
          y={height / 2}
          textAnchor="middle"
          fontSize="11"
          fill="#4b5563"
          fontWeight="500"
          transform={`rotate(-90 16 ${height / 2})`}
        >
          {yLabel}
        </text>

        {categories.map((cat, i) => {
          const v = values[i] ?? 0;
          const h = yMax ? (v / yMax) * plotH : 0;
          const x = padding.left + i * barW + barW * 0.15;
          const w = barW * 0.7;
          const y = padding.top + (plotH - (animate ? h : 0));
          const heightPx = animate ? h : 0;
          return (
            <g key={cat}>
              <rect
                x={x}
                y={y}
                width={w}
                height={heightPx}
                rx={4}
                fill="#2563eb"
                style={{ transition: 'all 700ms ease' }}
              />
              <text x={x + w / 2} y={height - padding.bottom + 16} textAnchor="middle" fontSize="10" fill="#6b7280">
                {cat}
              </text>
              {animate && heightPx > 20 && (
                <text x={x + w / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#111827" fontWeight="500">
                  {formatAxisLabel(v, yUnit)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function VisualizationCard({
  viz,
  onExploreNext,
}: {
  viz: VisualizationMessage;
  onExploreNext?: (text: string) => void;
}) {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    (viz.series || []).forEach((s) => (initial[s.name] = true));
    setVisible(initial);
  }, [viz.viz_id]);

  const visibleSeries = useMemo(
    () => (viz.series || []).filter((s) => visible[s.name] !== false),
    [viz.series, visible]
  );

  const yUnit = viz.chart?.y_unit;

  return (
    <div className="rounded-2xl px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Visualization</div>
          <div className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{viz.title}</div>
          {viz.subtitle && <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{viz.subtitle}</div>}
        </div>
      </div>

      {viz.narrative && <div className="text-sm text-gray-800 dark:text-gray-200 mb-3">{viz.narrative}</div>}

      {/* Legend / toggles */}
      {(viz.series || []).length > 1 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {(viz.series || []).map((s) => {
            const isOn = visible[s.name] !== false;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setVisible((prev) => ({ ...prev, [s.name]: !isOn }))}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  isOn ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Body */}
      {viz.table ? (
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {viz.table.columns.map((c) => (
                  <th key={c} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {viz.table.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-gray-900 dark:text-gray-100">
                      {cell === null || cell === undefined ? '' : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : viz.scorecard ? (
        <div className="grid grid-cols-1 gap-2">
          {viz.scorecard.kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">{kpi.label}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{kpi.value === null ? '' : String(kpi.value)}</div>
              </div>
              {kpi.note && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{kpi.note}</div>}
            </div>
          ))}
        </div>
      ) : viz.timeline ? (
        <div className="space-y-2">
          {viz.timeline.events.map((e, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{e.label}</div>
              {e.detail && <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{e.detail}</div>}
            </div>
          ))}
        </div>
      ) : viz.chart ? (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-2">
          {viz.chart.kind === 'line' || viz.chart.kind === 'area' ? (
            <LineChart
              series={visibleSeries}
              yUnit={yUnit}
              xLabel={viz.chart.x_label}
              yLabel={viz.chart.y_label}
            />
          ) : (
            <BarChart series={visibleSeries} yUnit={yUnit} yLabel={viz.chart.y_label} />
          )}
        </div>
      ) : null}

      {viz.explore_next && viz.explore_next.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {viz.explore_next.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onExploreNext?.(t)}
              className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={t}
              title={t}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {viz.assumptions && viz.assumptions.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">Assumptions</summary>
          <ul className="mt-2 text-xs text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            {viz.assumptions.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}


