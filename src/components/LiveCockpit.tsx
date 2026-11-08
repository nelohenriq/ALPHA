import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sliders,
  Cpu,
  Lock,
} from 'lucide-react';
import {
  SystemState,
  PortfolioPosition,
  HistoricalBar,
  AuditLogItem,
  RegimeType,
  StudyTicker,
} from '../types/alpha';
import { AssetSleeveSelector } from './AssetSleeveSelector';

interface LiveCockpitProps {
  systemState: SystemState;
  positions: PortfolioPosition[];
  historicalData: HistoricalBar[];
  auditLogs: AuditLogItem[];
  onTriggerRebalance: () => void;
  onOpenTradeModal: () => void;
  onNavigateToTab: (tab: 'cockpit' | 'architecture' | 'logic' | 'proof' | 'harness' | 'adapt') => void;
  selectedAssetToAnalyze: StudyTicker;
  onSelectAssetToAnalyze: (ticker: StudyTicker) => void;
  onSetCoreAsset: (ticker: StudyTicker) => void;
  onUpdateSleeveSlot: (slotIndex: number, newTicker: StudyTicker) => void;
  onAutoSelectTopMomentum: () => void;
}

export const LiveCockpit: React.FC<LiveCockpitProps> = ({
  systemState,
  positions,
  historicalData,
  auditLogs,
  onTriggerRebalance,
  onOpenTradeModal,
  onNavigateToTab,
  selectedAssetToAnalyze,
  onSelectAssetToAnalyze,
  onSetCoreAsset,
  onUpdateSleeveSlot,
  onAutoSelectTopMomentum,
}) => {
  const [hoveredBar, setHoveredBar] = useState<HistoricalBar | null>(null);
  const [simulatedSpyPrice, setSimulatedSpyPrice] = useState<number>(582.40);
  const spy200dMa = 545.10;

  // Compute regime based on simulated or current price
  const distancePct = ((simulatedSpyPrice - spy200dMa) / spy200dMa) * 100;
  const isUptrend = simulatedSpyPrice >= spy200dMa;
  const isWhipsawZone = Math.abs(distancePct) < 1.5;

  const currentRegime: RegimeType = isWhipsawZone
    ? 'TRANSITION_WHIPSAW'
    : isUptrend
    ? 'BULLISH_UPTREND'
    : 'BEARISH_DOWNTREND';

  // SVG Chart Geometry
  const chartWidth = 780;
  const chartHeight = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 60 };

  const minEquity = 90000;
  const maxEquity = 280000;

  const getX = (index: number) => {
    return padding.left + (index / (historicalData.length - 1)) * (chartWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    const clamped = Math.max(minEquity, Math.min(maxEquity, val));
    return (
      chartHeight -
      padding.bottom -
      ((clamped - minEquity) / (maxEquity - minEquity)) * (chartHeight - padding.top - padding.bottom)
    );
  };

  // Build SVG Paths
  const portfolioPath = historicalData.reduce((acc, bar, i) => {
    const x = getX(i);
    const y = getY(bar.portfolioEquity);
    return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  const benchmarkPath = historicalData.reduce((acc, bar, i) => {
    const x = getX(i);
    const y = getY(bar.benchmarkEquity);
    return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  const corePosition = positions.find((p) => p.type === 'CORE');
  const sleevePositions = positions.filter((p) => p.type === 'SLEEVE');

  return (
    <div className="space-y-6">
      {/* Circuit Breaker Warning Banner if Tripped */}
      {systemState.circuitBreakerTripped && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <div>
              <div className="font-semibold text-rose-300 text-sm">
                Safety Circuit Breaker Active
              </div>
              <div className="text-xs text-rose-400 mt-0.5">
                {systemState.circuitBreakerReason || 'Emergency kill-switch manually or automatically engaged.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('harness')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            Review & Reset
          </button>
        </div>
      )}

      {/* Asset & Sleeve Analysis Configurator */}
      <AssetSleeveSelector
        selectedAsset={selectedAssetToAnalyze}
        onSelectAsset={onSelectAssetToAnalyze}
        coreAsset={corePosition?.ticker || 'QQQ'}
        onSetCoreAsset={onSetCoreAsset}
        sleevePositions={sleevePositions}
        onUpdateSleeve={onUpdateSleeveSlot}
        onAutoSelectTopMomentum={onAutoSelectTopMomentum}
      />

      {/* Row 1: SPY 200D MA Regime Router & Dynamic Allocation Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Regime Router Diagnostic */}
        <div className="lg:col-span-2 bg-[#101623] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <span>01. SPY 200-Day Regime Router</span>
                <span className="text-xs font-normal text-slate-400">· Deterministic Core Allocator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                When SPY &ge; 200D MA, Core allocates to Primary Engine. When SPY &lt; 200D MA, Core rotates to Safe Asset / Cash.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Current SPY Bar</span>
              <div className="text-base font-bold font-mono tabular-nums text-white">
                ${simulatedSpyPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Regime Gauge & Distance Bar */}
          <div className="bg-[#0B0F19] border border-slate-800/80 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Regime State:</span>
                <span
                  className={`font-bold font-mono tracking-wide ${
                    currentRegime === 'BULLISH_UPTREND'
                      ? 'text-emerald-400'
                      : currentRegime === 'BEARISH_DOWNTREND'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {currentRegime === 'BULLISH_UPTREND' && 'BULLISH UPTREND (CORE -> QQQ)'}
                  {currentRegime === 'BEARISH_DOWNTREND' && 'BEARISH DOWNTREND (CORE -> BIL/GLD)'}
                  {currentRegime === 'TRANSITION_WHIPSAW' && 'TRANSITION FILTER BAND (±1.5%)'}
                </span>
              </div>
              <div className="font-mono text-xs tabular-nums text-slate-400">
                200D MA: ${spy200dMa.toFixed(2)} · Distance:{' '}
                <span className={distancePct >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {distancePct >= 0 ? '+' : ''}
                  {distancePct.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Distance relative line visualization */}
            <div className="relative pt-2 pb-4">
              <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden flex">
                <div className="w-1/2 bg-rose-500/30" />
                <div className="w-1/2 bg-emerald-500/30" />
              </div>

              {/* 200D MA center marker */}
              <div className="absolute top-0 bottom-2 left-1/2 w-0.5 bg-slate-400 -translate-x-1/2 flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 -top-3 absolute">200D MA</span>
              </div>

              {/* Dynamic current pointer */}
              {(() => {
                // Map -15% to +15% onto 0% to 100%
                const clampedPct = Math.max(-15, Math.min(15, distancePct));
                const leftPos = ((clampedPct + 15) / 30) * 100;
                return (
                  <div
                    className="absolute top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                    style={{ left: `${leftPos}%` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md" />
                    <span className="text-[11px] font-mono font-bold text-white mt-1">
                      {simulatedSpyPrice >= spy200dMa ? 'BULL' : 'BEAR'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Interactive SPY Price Slider to Test Transition */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 gap-4">
              <span className="flex items-center gap-1.5 shrink-0">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Simulate SPY Bar:</span>
              </span>
              <input
                type="range"
                min="480"
                max="620"
                step="0.5"
                value={simulatedSpyPrice}
                onChange={(e) => setSimulatedSpyPrice(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <button
                onClick={() => setSimulatedSpyPrice(582.40)}
                className="text-xs text-slate-400 hover:text-white underline shrink-0"
              >
                Reset ($582.40)
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Capital Division (70% Core + 30% Sleeves) */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <span>Portfolio Capital Division</span>
              </h2>
              <span className="text-xs font-mono text-slate-400 tabular-nums">$104,850.25</span>
            </div>

            {/* Division Visual Bar */}
            <div className="h-3 w-full rounded-md overflow-hidden flex mb-4 border border-slate-700/50">
              <div
                className="bg-emerald-500/80 transition-all duration-300"
                style={{ width: '70%' }}
                title="Core Engine: 70%"
              />
              <div
                className="bg-cyan-500/80 transition-all duration-300"
                style={{ width: '10%' }}
                title="Sleeve 1: 10%"
              />
              <div
                className="bg-indigo-500/80 transition-all duration-300"
                style={{ width: '10%' }}
                title="Sleeve 2: 10%"
              />
              <div
                className="bg-amber-500/80 transition-all duration-300"
                style={{ width: '10%' }}
                title="Sleeve 3: 10%"
              />
            </div>

            {/* Core Box (70%) */}
            <div className="p-3 bg-[#0B0F19] border border-slate-800 rounded-lg mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-emerald-400" />
                  CORE ENGINE (70.0%)
                </span>
                <span className="font-mono tabular-nums text-slate-300">
                  ${corePosition ? corePosition.marketValue.toLocaleString('en-US') : '73,316'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Asset: <span className="font-mono text-white font-semibold">{corePosition?.ticker || 'QQQ'}</span> · Low turnover (switches on 200D trend transition or macro override)
              </div>
            </div>

            {/* Tactical Sleeves Box (30%) */}
            <div className="p-3 bg-[#0B0F19] border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-cyan-400" />
                  TACTICAL SLEEVES (3 x 10%)
                </span>
                <span className="font-mono tabular-nums text-slate-300">$31,534</span>
              </div>
              <div className="text-xs text-slate-400">
                Sleeves: <span className="font-mono text-white font-semibold">XLK (10%) · XLE (10%) · XLI (10%)</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Rotates dynamically based on 63D relative momentum. Decay threshold: &gt; 2&sigma;.
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs border-t border-slate-800/80 mt-4">
            <span className="text-slate-400">AI Override Authority:</span>
            <span className="font-mono text-emerald-400 text-xs">Core Only (70%)</span>
          </div>
        </div>
      </div>

      {/* Row 2: Performance Attribution & Historical Equity Curve (2020-2026) */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>02. Long-Term Outperformance vs SPY Benchmark</span>
              <span className="text-xs font-normal text-slate-400">· July 2020 to October 2026</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice the 2022 capital preservation: When SPY collapsed -19.4%, The Machine preserved equity in BIL & GLD.
            </p>
          </div>

          {/* Legend and stats */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-emerald-400 rounded-full" />
              <span className="text-slate-300">The Machine (+162.1%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-slate-500 rounded-full" />
              <span className="text-slate-400">SPY Benchmark (+81.8%)</span>
            </div>
          </div>
        </div>

        {/* SVG Equity Chart */}
        <div className="relative bg-[#0B0F19] border border-slate-800/80 rounded-lg p-3 overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[650px] overflow-visible"
          >
            {/* Horizontal Gridlines */}
            {[100000, 150000, 200000, 250000].map((level) => {
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

            {/* Bear Market Regime Shading (2022) */}
            {(() => {
              const startX = getX(5); // ~2022-03
              const endX = getX(9); // ~2023-01
              return (
                <rect
                  x={startX}
                  y={padding.top}
                  width={endX - startX}
                  height={chartHeight - padding.top - padding.bottom}
                  fill="#F43F5E"
                  fillOpacity="0.06"
                />
              );
            })()}

            {/* Benchmark Path */}
            <path
              d={benchmarkPath}
              fill="none"
              stroke="#64748B"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Portfolio Path */}
            <path
              d={portfolioPath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
            />

            {/* Data Point Dots & Interactivity */}
            {historicalData.map((bar, i) => {
              const x = getX(i);
              const yPort = getY(bar.portfolioEquity);
              const isHovered = hoveredBar?.date === bar.date;

              return (
                <g key={bar.date}>
                  {/* X Axis Label */}
                  {i % 3 === 0 && (
                    <text
                      x={x}
                      y={chartHeight - 10}
                      fill="#64748B"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {bar.date}
                    </text>
                  )}

                  {/* Interactive Trigger */}
                  <circle
                    cx={x}
                    cy={yPort}
                    r={isHovered ? 5 : 3}
                    fill={isHovered ? '#FFFFFF' : '#10B981'}
                    stroke="#0B0F19"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredBar(bar)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Card */}
          {hoveredBar && (
            <div className="absolute top-4 right-4 bg-[#111827] border border-slate-700/80 rounded-lg p-3 text-xs shadow-xl min-w-[200px]">
              <div className="font-mono text-slate-400 font-semibold mb-1">
                Date: {hoveredBar.date}
              </div>
              <div className="flex items-center justify-between font-mono text-white mb-0.5">
                <span>The Machine:</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  ${hoveredBar.portfolioEquity.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-slate-400 mb-1">
                <span>SPY Benchmark:</span>
                <span className="tabular-nums">${hoveredBar.benchmarkEquity.toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-1 mt-1">
                Core Asset: <span className="text-white font-mono font-semibold">{hoveredBar.coreAsset}</span> · Regime: {hoveredBar.regime}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Active Holdings & Tactical Alpha Decay Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positions Table (2 cols) */}
        <div className="lg:col-span-2 bg-[#101623] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <span>03. Active Portfolio Holdings</span>
                <span className="text-xs font-normal text-slate-400">· 70% Core + 3x 10% Tactical Sleeves</span>
              </h2>
            </div>
            <button
              onClick={onTriggerRebalance}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-md transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Re-rank Momentum</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-medium">Type / Slot</th>
                  <th className="pb-2.5 font-medium">Ticker</th>
                  <th className="pb-2.5 font-medium text-right">Allocation</th>
                  <th className="pb-2.5 font-medium text-right">Shares</th>
                  <th className="pb-2.5 font-medium text-right">Entry Price</th>
                  <th className="pb-2.5 font-medium text-right">Current</th>
                  <th className="pb-2.5 font-medium text-right">Market Value</th>
                  <th className="pb-2.5 font-medium text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {positions.map((pos) => {
                  const isProfit = pos.unrealizedPnL >= 0;
                  return (
                    <tr key={pos.ticker} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 text-slate-300 font-sans">
                        {pos.type === 'CORE' ? (
                          <span className="font-semibold text-emerald-400">CORE (70%)</span>
                        ) : (
                          <span className="text-cyan-400">SLEEVE #{(pos.slotIndex ?? 0) + 1} (10%)</span>
                        )}
                      </td>
                      <td className="py-2.5 font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{pos.ticker}</span>
                          <span className="text-[10px] font-sans font-normal text-slate-400">
                            {pos.ticker === 'QQQ' ? 'Nasdaq 100' : pos.ticker}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right text-slate-300">
                        {(pos.allocationWeight * 100).toFixed(0)}%
                      </td>
                      <td className="py-2.5 text-right text-slate-300">{pos.shares}</td>
                      <td className="py-2.5 text-right text-slate-400">${pos.avgEntryPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-white font-semibold">
                        ${pos.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right text-slate-200">
                        ${pos.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-2.5 text-right font-semibold ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)} ({isProfit ? '+' : ''}
                        {pos.unrealizedPnLPercent.toFixed(2)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tactical Strategy Decay Monitor (1 col) */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white tracking-tight">
                <span>04. Strategy Decay Monitor</span>
              </h2>
              <span className="text-xs text-slate-400">Limit: &gt; 2.0&sigma;</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tactical sleeves are monitored for alpha degradation. If degradation breaches 2&sigma;, the sleeve is auto-deactivated.
            </p>

            <div className="space-y-3">
              {sleevePositions.map((sleeve, idx) => {
                const zScore = sleeve.decayZScore ?? 0.5;
                const isWarning = zScore > 1.5;
                const isBreached = zScore >= 2.0;

                return (
                  <div
                    key={sleeve.ticker}
                    className="p-3 bg-[#0B0F19] border border-slate-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-white">
                        Sleeve #{idx + 1}: {sleeve.ticker}
                      </span>
                      <span
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          isBreached
                            ? 'text-rose-400'
                            : isWarning
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {zScore.toFixed(2)}&sigma; {isBreached ? '(DECAY BREACH)' : '(NOMINAL)'}
                      </span>
                    </div>

                    {/* Decay Meter */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isBreached
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (zScore / 2.5) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Decay Protection:</span>
            <button
              onClick={() => onNavigateToTab('adapt')}
              className="text-emerald-400 hover:text-emerald-300 font-medium underline"
            >
              Configure in Adapt &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: AI Macro Advisory Status & Audit Log Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Advisory Layer Quick Status */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>AI Macro Advisory Layer</span>
            </h2>
            <span className="text-xs text-slate-400">Gemini 3.8 Flash</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Advisory overrides for <strong className="text-slate-200">CORE ONLY</strong>. Zero write authority over tactical sleeves.
          </p>

          <div className="p-3.5 bg-[#0B0F19] border border-slate-800 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active Override:</span>
              <span className="font-mono font-bold text-white">
                {systemState.coreOverride.active
                  ? `${systemState.coreOverride.advisory} on ${systemState.coreOverride.targetAsset}`
                  : 'NONE (Autonomous Quantitative Rules)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Lock Duration:</span>
              <span className="font-mono text-slate-300">
                {systemState.coreOverride.active
                  ? `${systemState.coreOverride.remainingDays} days remaining`
                  : '5 / 10 / 20 trading days'}
              </span>
            </div>
            <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
              {systemState.coreOverride.rationale}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('adapt')}
            className="w-full mt-3 px-3 py-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Launch AI Macro Synthesis Workbench</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real-Time Audit Feed (2 cols) */}
        <div className="lg:col-span-2 bg-[#101623] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white tracking-tight">
              <span>Execution & Compliance Audit Trail</span>
            </h2>
            <button
              onClick={() => onNavigateToTab('harness')}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              View Full JSONL Log ({auditLogs.length})
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {auditLogs.slice(0, 5).map((log, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-[#0B0F19] border border-slate-800/80 rounded-lg flex items-start gap-3 text-xs"
              >
                <span
                  className={`px-1.5 py-0.5 font-mono text-[10px] font-bold rounded ${
                    log.level === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400'
                      : log.level === 'EXEC'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : log.level === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {log.pillar}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="text-slate-200">{log.message}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
