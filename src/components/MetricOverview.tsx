import React from 'react';
import { SystemState } from '../types/alpha';

interface MetricOverviewProps {
  systemState: SystemState;
  spyPrice: number;
  spy200dMa: number;
  coreAsset?: string;
  sleeveTickers?: string[];
}

export const MetricOverview: React.FC<MetricOverviewProps> = ({
  systemState,
  spyPrice,
  spy200dMa,
  coreAsset = 'QQQ',
  sleeveTickers = ['XLK', 'XLE', 'XLI'],
}) => {
  const spyDistancePct = ((spyPrice - spy200dMa) / spy200dMa) * 100;
  const isUptrend = spyPrice >= spy200dMa;
  const totalReturnPct =
    ((systemState.accountEquity - systemState.startingCapital) / systemState.startingCapital) * 100;

  return (
    <div className="bg-[#0B0F19] border-b border-slate-800/80 px-6 py-3">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-xs">
        {/* Metric 1: Total Portfolio Equity */}
        <div className="flex flex-col">
          <div className="text-slate-400 font-medium flex items-center gap-1.5">
            <span>Portfolio Equity</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-mono tabular-nums">
              +{totalReturnPct.toFixed(2)}%
            </span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
            ${systemState.accountEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Metric 2: Daily P&L vs Kill-Switch Limit */}
        <div className="flex flex-col">
          <div className="text-slate-400 font-medium flex items-center gap-1.5">
            <span>Daily P&L</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 text-[11px]">Limit: -3.0%</span>
          </div>
          <div
            className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
              systemState.dailyLossPercent < -2.0
                ? 'text-rose-400'
                : systemState.dailyLossPercent < 0
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {systemState.dailyLossPercent > 0 ? '+' : ''}
            {systemState.dailyLossPercent.toFixed(2)}%
          </div>
        </div>

        {/* Metric 3: SPY 200D MA Regime */}
        <div className="flex flex-col">
          <div className="text-slate-400 font-medium flex items-center gap-1.5">
            <span>Regime Router</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 text-[11px]">SPY 200D</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-sm font-semibold tracking-wide ${
                isUptrend ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isUptrend ? 'BULLISH UPTREND' : 'BEARISH DOWNTREND'}
            </span>
            <span className="font-mono text-xs tabular-nums text-slate-400">
              ({spyDistancePct > 0 ? '+' : ''}
              {spyDistancePct.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Metric 4: Core Engine Allocation (70%) */}
        <div className="flex flex-col">
          <div className="text-slate-400 font-medium flex items-center gap-1.5">
            <span>Core Allocation (70%)</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-base font-bold font-mono text-white">
              {systemState.coreOverride.active
                ? `${systemState.coreOverride.targetAsset} (AI Override)`
                : `${coreAsset} (Core)`}
            </span>
            <span className="text-slate-500 font-mono text-xs tabular-nums">70.0%</span>
          </div>
        </div>

        {/* Metric 5: Tactical Sleeves (30%) */}
        <div className="flex flex-col">
          <div className="text-slate-400 font-medium flex items-center gap-1.5">
            <span>Sleeves (3x 10%)</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 font-mono text-sm font-medium text-slate-300">
            {sleeveTickers.map((ticker, i) => (
              <React.Fragment key={ticker}>
                {i > 0 && <span className="text-slate-600">·</span>}
                <span>{ticker}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Metric 6: FINRA PDT & Broker Gate */}
        <div className="flex flex-col">
          <div className="text-slate-400 font-medium flex items-center gap-1.5">
            <span>PDT Guard</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 text-[11px]">Alpaca Py</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-semibold font-mono tabular-nums text-emerald-400">
              {systemState.pdtCount5Days} / 3 Day Trades
            </span>
            <span className="text-[11px] text-slate-400">Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
