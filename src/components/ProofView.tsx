import React, { useState } from 'react';
import {
  ShieldCheck,
  BarChart2,
  Play,
  RotateCcw,
  CheckCircle2,
  Zap,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { MONTE_CARLO_PATHS } from '../data/mockMarketData';
import { MonteCarloPath } from '../types/alpha';

export const ProofView: React.FC = () => {
  const [isRunningSimulation, setIsRunningSimulation] = useState<boolean>(false);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(true);
  const [selectedPath, setSelectedPath] = useState<MonteCarloPath>(MONTE_CARLO_PATHS[0]);
  const [noiseTestProgress, setNoiseTestProgress] = useState<number>(100);
  const [noisePValue, setNoisePValue] = useState<number>(0.008);

  const handleRunNoiseTest = () => {
    setIsRunningSimulation(true);
    setNoiseTestProgress(0);
    const interval = setInterval(() => {
      setNoiseTestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningSimulation(false);
          setSimulationComplete(true);
          setNoisePValue(0.006 + Math.random() * 0.004);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // SVG Fan-Chart Geometry
  const chartWidth = 750;
  const chartHeight = 260;
  const padding = { top: 25, right: 30, bottom: 35, left: 60 };

  const minVal = 80000;
  const maxVal = 150000;

  const getX = (index: number, total: number) => {
    return padding.left + (index / (total - 1)) * (chartWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return (
      chartHeight -
      padding.bottom -
      ((clamped - minVal) / (maxVal - minVal)) * (chartHeight - padding.top - padding.bottom)
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Pillar P */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
          Pillar P · Strategy Proof & Validation
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Zero Alpha Proof, Walk-Forward Analysis & Monte Carlo Fan-Chart
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          No overfitting mandate: Strategies must survive 1,000-path block bootstrap shuffles with statistical significance
          (p &lt; 0.05), demonstrate parameter stability across modern regimes (post-2022 focus), and keep 95th percentile Max Drawdown &lt; 25%.
        </p>
      </div>

      {/* 3 Core Proof Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proof 1: Zero Alpha Proof */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>01. Zero Alpha Proof</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">PASSED</span>
          </div>

          <p className="text-xs text-slate-400">
            Pure Noise Test (IID & Block Bootstrap). Shuffles historical bar returns to test null hypothesis that alpha is luck.
          </p>

          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Empirical Sharpe:</span>
              <span className="text-emerald-400 font-bold">1.84</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Null Mean Sharpe:</span>
              <span className="text-slate-400">0.04</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Empirical p-value:</span>
              <span className="text-emerald-400 font-bold">
                p = {noisePValue.toFixed(4)} (&lt; 0.05)
              </span>
            </div>
          </div>

          <button
            onClick={handleRunNoiseTest}
            disabled={isRunningSimulation}
            className="w-full mt-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isRunningSimulation ? `Simulating ${noiseTestProgress}%...` : 'Run 1,000 IID Shuffles'}</span>
          </button>
        </div>

        {/* Proof 2: Planted Edge Check */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>02. Planted Edge Check</span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">VERIFIED</span>
          </div>

          <p className="text-xs text-slate-400">
            Injects artificial +0.08% daily drift into pure noise to verify that the regime detector extracts genuine signal without false discovery.
          </p>

          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Planted Signal Drift:</span>
              <span className="text-white">+0.08% / bar</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Detector Capture:</span>
              <span className="text-cyan-400 font-bold">96.8% Efficiency</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">False Positive Rate:</span>
              <span className="text-emerald-400 font-bold">1.2% (&lt; 5%)</span>
            </div>
          </div>

          <div className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] text-slate-400">
            Confirmed: Signal logic responds strictly to persistent trend autocorrelation.
          </div>
        </div>

        {/* Proof 3: Walk-Forward Analysis (WFA) */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>03. Walk-Forward (WFA)</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">LOCKED OOS</span>
          </div>

          <p className="text-xs text-slate-400">
            Post-2022 market structure priority. Evaluates in-sample stability and out-of-sample persistence.
          </p>

          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Train (2022-2024):</span>
              <span className="text-white">Sharpe: 1.88</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Locked Test (2025-2026):</span>
              <span className="text-emerald-400 font-bold">Sharpe: 1.76</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">WFA Efficiency Ratio:</span>
              <span className="text-emerald-400 font-bold">93.6% (Stable)</span>
            </div>
          </div>

          <div className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] text-slate-400">
            Zero parameter retuning allowed inside the 2025-2026 locked evaluation window.
          </div>
        </div>
      </div>

      {/* Monte Carlo Block Bootstrap Fan-Chart (Risk Tail Bounds) */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>04. Monte Carlo Block Bootstrap Fan-Chart (Risk Tail Bounds)</span>
              <span className="text-xs font-mono text-emerald-400 font-normal">
                · Max DD at p95: 18.4% (&lt; 25% Requirement)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              1,000 forward paths generated by sampling blocks of historical daily returns. Verifies tail risk does not exceed portfolio ruin limits.
            </p>
          </div>

          {/* Interactive path selectors */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {MONTE_CARLO_PATHS.map((p) => (
              <button
                key={p.percentile}
                onClick={() => setSelectedPath(p)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  selectedPath.percentile === p.percentile
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-[#0B0F19]'
                }`}
              >
                {p.percentile.toUpperCase()} (DD -{p.maxDrawdown}%)
              </button>
            ))}
          </div>
        </div>

        {/* SVG Fan-Chart */}
        <div className="bg-[#0B0F19] border border-slate-800/80 rounded-lg p-3 overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[650px] overflow-visible"
          >
            {/* Gridlines */}
            {[90000, 110000, 130000, 150000].map((level) => {
              const y = getY(level);
              return (
                <g key={level}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#1E293B"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    fill="#64748B"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    ${level / 1000}k
                  </text>
                </g>
              );
            })}

            {/* Confidence Area Fan (p95 to p10) */}
            {(() => {
              const topPath = MONTE_CARLO_PATHS[0].values;
              const bottomPath = MONTE_CARLO_PATHS[3].values;
              const n = topPath.length;

              let d = '';
              for (let i = 0; i < n; i++) {
                const x = getX(i, n);
                const y = getY(topPath[i]);
                d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
              }
              for (let i = n - 1; i >= 0; i--) {
                const x = getX(i, n);
                const y = getY(bottomPath[i]);
                d += `L ${x} ${y} `;
              }
              d += 'Z';

              return <path d={d} fill="#10B981" fillOpacity="0.08" />;
            })()}

            {/* Individual Paths */}
            {MONTE_CARLO_PATHS.map((path) => {
              const isSelected = selectedPath.percentile === path.percentile;
              const n = path.values.length;
              const strokeColor =
                path.percentile === 'p95'
                  ? '#10B981'
                  : path.percentile === 'p90'
                  ? '#34D399'
                  : path.percentile === 'p50'
                  ? '#38BDF8'
                  : path.percentile === 'p10'
                  ? '#F59E0B'
                  : '#F43F5E';

              const d = path.values.reduce((acc, val, i) => {
                const x = getX(i, n);
                const y = getY(val);
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '');

              return (
                <path
                  key={path.percentile}
                  d={d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 1.5}
                  strokeOpacity={isSelected ? 1 : 0.6}
                  strokeDasharray={path.percentile === 'worst' ? '4 4' : 'none'}
                />
              );
            })}

            {/* X Axis Time markers */}
            {[0, 2, 4, 6, 8, 10].map((idx) => {
              const x = getX(idx, 11);
              return (
                <text
                  key={idx}
                  x={x}
                  y={chartHeight - 10}
                  fill="#64748B"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  +{idx * 25}d
                </text>
              );
            })}
          </svg>

          {/* Selected Path Detail */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{selectedPath.label}:</span>
              <span className="text-slate-400">
                Final Projected Equity: ${selectedPath.finalEquity.toLocaleString()}
              </span>
            </div>
            <div className="text-rose-400 font-bold">
              Max Drawdown: -{selectedPath.maxDrawdown}% (Passes &lt; 25% Rule)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
