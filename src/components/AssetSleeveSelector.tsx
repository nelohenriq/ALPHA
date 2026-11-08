import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  ArrowRight,
} from 'lucide-react';
import { StudyTicker, TickerData, PortfolioPosition } from '../types/alpha';
import { STUDY_TICKERS } from '../data/mockMarketData';

interface AssetSleeveSelectorProps {
  selectedAsset: StudyTicker;
  onSelectAsset: (ticker: StudyTicker) => void;
  coreAsset: StudyTicker;
  onSetCoreAsset: (ticker: StudyTicker) => void;
  sleevePositions: PortfolioPosition[];
  onUpdateSleeve: (slotIndex: number, newTicker: StudyTicker) => void;
  onAutoSelectTopMomentum: () => void;
}

export const AssetSleeveSelector: React.FC<AssetSleeveSelectorProps> = ({
  selectedAsset,
  onSelectAsset,
  coreAsset,
  onSetCoreAsset,
  sleevePositions,
  onUpdateSleeve,
  onAutoSelectTopMomentum,
}) => {
  const [isConfigExpanded, setIsConfigExpanded] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const currentAssetData =
    STUDY_TICKERS.find((t) => t.ticker === selectedAsset) || STUDY_TICKERS[0];

  const distanceToMa200Pct =
    ((currentAssetData.price - currentAssetData.ma200) / currentAssetData.ma200) * 100;
  const isAboveMa = currentAssetData.price >= currentAssetData.ma200;

  // Filter study tickers for sleeve dropdowns (exclude cash and study-only)
  const availableSleeveTickers = STUDY_TICKERS.filter(
    (t) => t.category === 'Sleeve' || t.category === 'Engine' || t.category === 'Safe'
  );

  const quickPicks: StudyTicker[] = ['QQQ', 'SPY', 'IWM', 'DIA', 'GLD', 'TLT', 'XLK', 'XLE'];

  return (
    <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Top Header: Analyzed Asset Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Asset & Sleeve Analysis Configurator</span>
            </h2>
            <span className="text-xs text-slate-400">· Active Target:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">
              {currentAssetData.ticker}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any engine or sector asset to run deep quantitative diagnostic, or configure which 3 sleeves occupy tactical slots.
          </p>
        </div>

        {/* Quick Asset Switcher Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Inspect:</span>
          {quickPicks.map((ticker) => (
            <button
              key={ticker}
              onClick={() => onSelectAsset(ticker)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                selectedAsset === ticker
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 shadow-sm'
                  : 'bg-[#0B0F19] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {ticker}
            </button>
          ))}

          {/* Full Asset Dropdown Selector */}
          <select
            value={selectedAsset}
            onChange={(e) => onSelectAsset(e.target.value as StudyTicker)}
            className="px-2.5 py-1 text-xs bg-[#0B0F19] text-white border border-slate-700 rounded font-mono focus:outline-none focus:border-emerald-500"
          >
            {STUDY_TICKERS.map((t) => (
              <option key={t.ticker} value={t.ticker}>
                {t.ticker} ({t.name.split(' ')[0]})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsConfigExpanded(!isConfigExpanded)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ml-2 whitespace-nowrap ${
              isConfigExpanded
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isConfigExpanded ? 'Hide Sleeve Customizer' : 'Configure Sleeves (3x)'}
          </button>
        </div>
      </div>

      {/* Deep-Dive Inspection Card for Selected Asset */}
      <div className="p-4 bg-[#0B0F19] border border-slate-800/90 rounded-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-mono">
          <div>
            <div className="text-slate-400 font-sans text-[11px]">Asset & Category</div>
            <div className="font-bold text-white text-sm mt-0.5">{currentAssetData.ticker}</div>
            <div className="text-slate-400 font-sans text-[11px] truncate">
              {currentAssetData.name}
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-sans text-[11px]">Market Price</div>
            <div className="font-bold text-white text-sm mt-0.5 tabular-nums">
              ${currentAssetData.price.toFixed(2)}
            </div>
            <div
              className={`text-[11px] tabular-nums ${
                currentAssetData.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentAssetData.changePercent >= 0 ? '+' : ''}
              {currentAssetData.changePercent.toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-sans text-[11px]">200-Day Moving Avg</div>
            <div className="font-bold text-slate-200 text-sm mt-0.5 tabular-nums">
              ${currentAssetData.ma200.toFixed(2)}
            </div>
            <div
              className={`text-[11px] font-semibold tabular-nums ${
                isAboveMa ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {distanceToMa200Pct >= 0 ? '+' : ''}
              {distanceToMa200Pct.toFixed(2)}% ({isAboveMa ? 'Bullish' : 'Bearish'})
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-sans text-[11px]">63D Momentum Score</div>
            <div className="font-bold text-white text-sm mt-0.5 tabular-nums">
              {currentAssetData.momentumScore63d > 0 ? '+' : ''}
              {currentAssetData.momentumScore63d.toFixed(1)}
            </div>
            <div className="text-slate-500 text-[11px] font-sans">
              Rank: #{STUDY_TICKERS.filter((t) => t.momentumScore63d > currentAssetData.momentumScore63d).length + 1} of 24
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-sans text-[11px]">30D Realized Volatility</div>
            <div className="font-bold text-slate-200 text-sm mt-0.5 tabular-nums">
              {currentAssetData.volatility30d.toFixed(1)}%
            </div>
            <div className="text-slate-500 text-[11px] font-sans">Annualized</div>
          </div>

          <div className="flex flex-col justify-center">
            {coreAsset === currentAssetData.ticker ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold font-sans">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Core (70%)</span>
              </div>
            ) : (
              <button
                onClick={() => onSetCoreAsset(currentAssetData.ticker)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
              >
                <span>Set as Core (70%)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Tactical Sleeves Customizer (3 x 10% Slots) */}
      {isConfigExpanded && (
        <div className="p-4 bg-[#0B0F19] border border-cyan-500/30 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Tactical Sleeves Selection (3 Slots x 10% Capital = $10,485 Each)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose which 3 sector or asset sleeves are deployed in the tactical momentum basket.
              </p>
            </div>

            <button
              onClick={onAutoSelectTopMomentum}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Pick Top 3 Momentum</span>
            </button>
          </div>

          {/* 3 Slot Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sleevePositions.map((pos, idx) => {
              const tickerInfo = STUDY_TICKERS.find((t) => t.ticker === pos.ticker);
              return (
                <div
                  key={idx}
                  className="p-3 bg-[#111827] border border-slate-700 rounded-lg space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-400">Sleeve Slot #{idx + 1} (10%)</span>
                    <span className="font-mono text-slate-400">${pos.marketValue.toFixed(0)}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Assigned Ticker:</label>
                    <select
                      value={pos.ticker}
                      onChange={(e) => onUpdateSleeve(idx, e.target.value as StudyTicker)}
                      className="w-full p-2 bg-[#0B0F19] border border-slate-700 rounded text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                    >
                      {availableSleeveTickers.map((t) => (
                        <option key={t.ticker} value={t.ticker}>
                          {t.ticker} · Mom: {t.momentumScore63d > 0 ? '+' : ''}
                          {t.momentumScore63d} ({t.name.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  {tickerInfo && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-400 border-t border-slate-800">
                      <div>
                        <span>Price: </span>
                        <span className="text-white">${tickerInfo.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span>Mom: </span>
                        <span className="text-emerald-400 font-semibold">
                          +{tickerInfo.momentumScore63d}
                        </span>
                      </div>
                      <div>
                        <span>Shares: </span>
                        <span className="text-white">{pos.shares}</span>
                      </div>
                      <div>
                        <span>Decay: </span>
                        <span className="text-slate-300">{pos.decayZScore?.toFixed(2)}&sigma;</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
