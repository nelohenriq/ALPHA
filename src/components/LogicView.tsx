import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SystemState } from '../types/alpha';

interface LogicViewProps {
  systemState: SystemState;
  onSimulateTradeCountChange: (newCount: number) => void;
}

export const LogicView: React.FC<LogicViewProps> = ({
  systemState,
  onSimulateTradeCountChange,
}) => {
  const [testSpyPrice, setTestSpyPrice] = useState<number>(582.40);
  const [whipsawFilterPct, setWhipsawFilterPct] = useState<number>(1.5);
  const [selectedEngine, setSelectedEngine] = useState<string>('QQQ');
  const [selectedSafe, setSelectedSafe] = useState<string>('BIL');

  const ma200 = 545.10;
  const distancePct = ((testSpyPrice - ma200) / ma200) * 100;
  const isAboveMa = testSpyPrice >= ma200;
  const isInsideWhipsaw = Math.abs(distancePct) < whipsawFilterPct;

  let activeCoreAsset = 'QQQ';
  let regimeName = 'BULLISH UPTREND';
  let regimeDescription = 'SPY is securely above the 200D MA. Core deploys 70% into Primary Engine (QQQ).';

  if (isInsideWhipsaw) {
    regimeName = 'WHIPSAW TRANSITION ZONE';
    activeCoreAsset = 'HOLD PREVIOUS (FILTERED)';
    regimeDescription = `Distance (${distancePct.toFixed(2)}%) is within ±${whipsawFilterPct}% buffer band. Signals locked to prevent churning.`;
  } else if (!isAboveMa) {
    regimeName = 'BEARISH DOWNTREND';
    activeCoreAsset = selectedSafe;
    regimeDescription = `SPY is below 200D MA. Core rotates 70% into Safe Asset (${selectedSafe}) to preserve capital.`;
  } else {
    activeCoreAsset = selectedEngine;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Pillar L */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
          Pillar L · Logic & Pre-Flight Guard
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          SPY 200D Regime Router, Dynamic Sizing & FINRA PDT Safety
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Deterministic quantitative rules execute 100% of trades programmatically. Core allocation (70%) is governed
          by the 200-day trend line with whipsaw filtration. Pre-flight checks strictly block unauthorized intraday risk.
        </p>
      </div>

      {/* Row 1: The Regime Router Logic & Dynamic Weight Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Deterministic Regime Engine */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>SPY 200D MA Regime Router</span>
            </h2>
            <span className="text-xs font-mono text-slate-400 tabular-nums">MA: $545.10</span>
          </div>

          {/* Interactive SPY Price Slider */}
          <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Test Market Bar (SPY):</span>
              <span className="font-mono font-bold text-lg text-white tabular-nums">
                ${testSpyPrice.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min="480"
              max="620"
              step="0.5"
              value={testSpyPrice}
              onChange={(e) => setTestSpyPrice(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>$480.00 (Deep Bear)</span>
              <span>$545.10 (200D Line)</span>
              <span>$620.00 (Strong Bull)</span>
            </div>
          </div>

          {/* Router Decision Output */}
          <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-lg space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Detected Regime:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  regimeName.includes('BULL')
                    ? 'text-emerald-400'
                    : regimeName.includes('BEAR')
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {regimeName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Core Allocation Target (70%):</span>
              <span className="font-mono font-bold text-white text-sm bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                {activeCoreAsset}
              </span>
            </div>

            <div className="text-slate-400 text-[11px] pt-2 border-t border-slate-800/80 leading-relaxed">
              {regimeDescription}
            </div>
          </div>

          {/* Whipsaw Filter Band Settings */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Trend Whipsaw Filter Band:</span>
            <div className="flex items-center gap-2">
              {[1.0, 1.5, 2.0].map((band) => (
                <button
                  key={band}
                  onClick={() => setWhipsawFilterPct(band)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
                    whipsawFilterPct === band
                      ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ±{band.toFixed(1)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Box 2: Portfolio Weight Selector (70% Core + 30% Tactical Sleeves) */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Dynamic Weight Selector Blueprint</span>
            </h2>
            <span className="text-xs text-slate-400">Total: 100%</span>
          </div>

          <p className="text-xs text-slate-400">
            Explicit segregation prevents tactical noise from disturbing the patient, trend-capturing Core.
          </p>

          <div className="space-y-3">
            {/* Core Section (70%) */}
            <div className="p-3.5 bg-[#0B0F19] border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-emerald-400" />
                  CORE ENGINE (70% Capital = $73,395)
                </span>
                <span className="font-mono text-slate-400">Low Turnover</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Switches rarely. Driven by 200-day trend regime transitions and macro overrides.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Engine Candidate:</span>
                {['QQQ', 'SPY', 'IWM', 'DIA'].map((eng) => (
                  <button
                    key={eng}
                    onClick={() => setSelectedEngine(eng)}
                    className={`px-2 py-0.5 font-mono text-[11px] rounded transition-colors ${
                      selectedEngine === eng
                        ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {eng}
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Sleeves (3 x 10%) */}
            <div className="p-3.5 bg-[#0B0F19] border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-cyan-400" />
                  TACTICAL SLEEVES (3 x 10% = $31,455)
                </span>
                <span className="font-mono text-slate-400">High Turnover</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Captures short-term relative momentum and sector alpha. Monitored for strategy decay.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Sleeve 1 (10%)</div>
                  <div className="text-white font-bold mt-0.5">XLK</div>
                  <div className="text-emerald-400 text-[10px]">Mom: +14.2</div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Sleeve 2 (10%)</div>
                  <div className="text-white font-bold mt-0.5">XLE</div>
                  <div className="text-emerald-400 text-[10px]">Mom: +11.2</div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Sleeve 3 (10%)</div>
                  <div className="text-white font-bold mt-0.5">XLI</div>
                  <div className="text-emerald-400 text-[10px]">Mom: +11.8</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Pre-Flight Safety Checks & FINRA PDT Guard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pre-Flight Check 1: FINRA PDT Guard */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>FINRA PDT Guard</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">&lt; $25,000 Equity</span>
          </div>

          <p className="text-xs text-slate-400">
            FINRA Pattern Day Trader rule requires &ge; $25k to execute 4+ day trades in a rolling 5-business-day window.
          </p>

          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account Equity:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                ${systemState.accountEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-semibold font-mono">
                EXEMPT (&gt; $25k Equity)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Day Trades (Rolling 5d):</span>
              <span className="font-mono font-bold text-slate-200">
                {systemState.pdtCount5Days} / 3 Allowed
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Simulate Day Trade:</span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => onSimulateTradeCountChange(count)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                    systemState.pdtCount5Days === count
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pre-Flight Check 2: Buying Power */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Buying Power & Margin Gate</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">PASSED</span>
          </div>

          <p className="text-xs text-slate-400">
            Verifies non-margin cash balances and unencumbered buying power prior to firing any broker order.
          </p>

          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Total Buying Power:</span>
              <span className="text-white font-bold">
                ${systemState.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Required per 10% Sleeve:</span>
              <span className="text-slate-300">$10,485.02</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Max Leverage Ceiling:</span>
              <span className="text-slate-400">1.0x (No naked leverage)</span>
            </div>
          </div>
        </div>

        {/* Pre-Flight Check 3: Market Hours & Timezone */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>NYSE Market Hours & DST</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">REGULAR SESSION</span>
          </div>

          <p className="text-xs text-slate-400">
            Orders are executed exclusively during regular trading hours (9:30 AM - 4:00 PM US Eastern) to avoid wide illiquid spreads.
          </p>

          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Execution Window:</span>
              <span className="font-mono text-white">09:30 - 16:00 EST</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">DST Sync Status:</span>
              <span className="font-mono text-emerald-400">UTC-5 Synced</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Slippage Bound:</span>
              <span className="font-mono text-slate-300">0.05% (5 bps) Max</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
