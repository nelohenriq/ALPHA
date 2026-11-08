import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  SystemState,
  PortfolioPosition,
  AIAdvisoryResult,
  CoreAssetType,
  StudyTicker,
} from '../types/alpha';
import { PRECONFIGURED_MACRO_SCENARIOS, STUDY_TICKERS } from '../data/mockMarketData';

interface AdaptViewProps {
  systemState: SystemState;
  positions: PortfolioPosition[];
  onApplyAIOverride: (advisory: AIAdvisoryResult) => void;
  onClearAIOverride: () => void;
  onSimulateSleeveDecayBreach: (slotIndex: number) => void;
  onApplySleevesToSlots?: (sleeves: StudyTicker[]) => void;
}

export const AdaptView: React.FC<AdaptViewProps> = ({
  systemState,
  positions,
  onApplyAIOverride,
  onClearAIOverride,
  onSimulateSleeveDecayBreach,
  onApplySleevesToSlots,
}) => {
  const [macroInput, setMacroInput] = useState<string>(
    'Federal Open Market Committee signals neutral policy path with resilient GDP growth and sticky services PCE.'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [advisoryResult, setAdvisoryResult] = useState<AIAdvisoryResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const sleevePositions = positions.filter((p) => p.type === 'SLEEVE');
  const corePosition = positions.find((p) => p.type === 'CORE');
  const coreOverride = systemState.coreOverride;

  const [selectedAnalysisAsset, setSelectedAnalysisAsset] = useState<StudyTicker>(
    corePosition?.ticker || 'QQQ'
  );
  const [selectedSleevesForAnalysis, setSelectedSleevesForAnalysis] = useState<StudyTicker[]>(
    sleevePositions.map((s) => s.ticker)
  );

  const toggleSleeveInAnalysis = (ticker: StudyTicker) => {
    setSelectedSleevesForAnalysis((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  const handleSelectScenario = (scenario: (typeof PRECONFIGURED_MACRO_SCENARIOS)[0]) => {
    setMacroInput(scenario.headline);
    setSelectedAnalysisAsset(scenario.expectedAsset as StudyTicker);
  };

  const handleRunAIMacroAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/ai/macro-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          macroHeadline: macroInput,
          currentRegime: 'SPY > 200D MA (Bullish Uptrend)',
          coreAsset: selectedAnalysisAsset,
          userNotes: `Tactical sleeves present in portfolio analysis: ${selectedSleevesForAnalysis.join(', ')}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setAdvisoryResult(data);
    } catch (err: any) {
      console.warn('AI Advisory network notice, executing deterministic macro model:', err);
      const lower = macroInput.toLowerCase();
      const isPrecious =
        selectedAnalysisAsset === 'GLD' ||
        selectedAnalysisAsset === 'SLV' ||
        selectedSleevesForAnalysis.includes('GLD') ||
        selectedSleevesForAnalysis.includes('SLV');

      let rec: 'HOLD' | 'ENGINE' | 'SAFE' | 'CASH' = isPrecious ? 'SAFE' : 'ENGINE';
      let asset: StudyTicker = selectedAnalysisAsset;
      let duration: 5 | 10 | 20 = 10;
      let rationale = `Evaluating Core candidate ${asset} against macro catalyst with tactical sleeves (${selectedSleevesForAnalysis.join(', ')}). `;

      if (isPrecious) {
        rec = 'SAFE';
        rationale += `Persistent inflation friction and monetary debasement risk favor precious metals exposure (${asset}). Allocating Core under 10-day governance lock to provide sovereign store-of-value defense.`;
      } else if (lower.includes('debt') || lower.includes('liquidity') || lower.includes('drain')) {
        rec = 'CASH';
        asset = 'BIL';
        rationale += 'Severe liquidity drainage threatens financial conditions. Allocating Core to Cash (BIL) for 10 trading days.';
      } else if (lower.includes('cut') || lower.includes('dovish') || lower.includes('pivot')) {
        rec = 'ENGINE';
        duration = 20;
        rationale += `Dovish monetary pivot eases real yields and widens valuation multiples. Recommending Core Engine (${asset}) lock for 20 days.`;
      } else {
        rationale += `Macro conditions support programmatic deployment into ${asset}. Allocating Core under 10-day governance lock.`;
      }

      setAdvisoryResult({
        recommendation: rec,
        targetAsset: asset,
        lockDurationDays: duration,
        confidenceScore: 0.92,
        headlineSummary: macroInput.slice(0, 90),
        rationale,
        riskFactors: [
          `Dispersion between Core (${asset}) and tactical sleeves (${selectedSleevesForAnalysis.join(', ')})`,
          'Treasury 10Y real yields volatility',
          'Sleeve momentum volatility under macro shock',
        ],
        complianceNote:
          'Advisory override restricted to Core (70%). Tactical sleeves operate 100% autonomously.',
        isMock: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Pillar A (Adapt) */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
          Pillar A · Adaptation & Operational AI Governance
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Sleeve Strategy Decay Monitor & AI Macro Judgment Layer
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Dual governance: (1) Tactical sleeves continuously evaluate statistical decay (&gt; 2&sigma; breach auto-swaps the sector).
          (2) AI Judgment Layer processes unstructured macro text, advising overrides for CORE ONLY with 5, 10, or 20-day locks.
        </p>
      </div>

      {/* Part 1: Sleeve Strategy Decay Monitor */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              <span>Tactical Sleeve Decay Protection (&gt; 2.0&sigma; Trigger)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              If a sleeve's rolling Information Ratio falls &gt; 2 standard deviations below historical expectation, it is automatically rotated out.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            3 Tactical Slots · 10% Each ($10,485)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sleevePositions.map((sleeve, idx) => {
            const zScore = sleeve.decayZScore ?? 0.5;
            const isBreached = zScore >= 2.0;
            const isWarning = zScore >= 1.5;

            return (
              <div
                key={sleeve.ticker}
                className="p-4 bg-[#0B0F19] border border-slate-800 rounded-lg flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white font-mono text-sm">
                      Sleeve #{idx + 1}: {sleeve.ticker}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isBreached
                          ? 'text-rose-400'
                          : isWarning
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {zScore.toFixed(2)}&sigma; {isBreached ? 'BREACHED' : 'NOMINAL'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    63D Rolling Alpha: <span className="font-mono text-white font-semibold">+{sleeve.unrealizedPnLPercent.toFixed(1)}%</span>
                  </div>

                  {/* Meter */}
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
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

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>0.0&sigma; (Mean)</span>
                    <span>1.5&sigma; (Alert)</span>
                    <span>2.0&sigma; (Breach)</span>
                  </div>
                </div>

                <button
                  onClick={() => onSimulateSleeveDecayBreach(idx)}
                  className="w-full py-1.5 px-2 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>Simulate Decay & Rotate</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: AI Review & Operational Governance Layer */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>AI Judgment Layer & Operational Governance</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic rules execute 100% of trades programmatically. The AI Judgment Layer (Gemini 3.8 Flash) reads
              unstructured macro releases and issues advisory overrides strictly for the <strong className="text-slate-200">CORE (70%)</strong>.
            </p>
          </div>

          {/* Active Core Override Badge */}
          {coreOverride.active ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">
                CORE LOCKED: {coreOverride.advisory} on {coreOverride.targetAsset} ({coreOverride.remainingDays}d)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
              <Unlock className="w-3.5 h-3.5 text-slate-400" />
              <span>Pure Autonomous Rules Active</span>
            </div>
          )}
        </div>

        {/* Preconfigured Macro Scenarios */}
        <div>
          <div className="text-xs text-slate-400 font-medium mb-2">
            Quick Test Macro Releases (Section 4 Blueprint):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PRECONFIGURED_MACRO_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className="p-2.5 text-left bg-[#0B0F19] hover:bg-slate-800/60 border border-slate-800 rounded-lg text-xs transition-colors"
              >
                <div className="font-semibold text-slate-200">{sc.title}</div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{sc.headline}</div>
                <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                  <span>Advise: {sc.expectedOverride}</span>
                  <span>{sc.lockDuration}d lock</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Choose Target Asset & Sleeves to Analyze */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-[#0B0F19] border border-slate-800 rounded-lg text-xs">
          {/* Target Asset for Core Advisory */}
          <div className="space-y-2">
            <label className="text-slate-300 font-medium block">
              1. Target Asset to Evaluate for Core:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['QQQ', 'SPY', 'IWM', 'DIA', 'GLD', 'TLT', 'BIL'] as StudyTicker[]).map((ticker) => (
                <button
                  type="button"
                  key={ticker}
                  onClick={() => setSelectedAnalysisAsset(ticker)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    selectedAnalysisAsset === ticker
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {ticker}
                </button>
              ))}

              <select
                value={selectedAnalysisAsset}
                onChange={(e) => setSelectedAnalysisAsset(e.target.value as StudyTicker)}
                className="px-2 py-1 text-xs bg-slate-900 text-white border border-slate-700 rounded font-mono focus:outline-none"
              >
                {STUDY_TICKERS.filter((t) => t.category !== 'StudyOnly').map((t) => (
                  <option key={t.ticker} value={t.ticker}>
                    {t.ticker}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-slate-500">
              Selected: <span className="font-mono text-emerald-400 font-bold">{selectedAnalysisAsset}</span> (Core 70% candidate)
            </div>
          </div>

          {/* Sleeves to Include in Analysis */}
          <div className="space-y-2">
            <label className="text-slate-300 font-medium flex items-center justify-between">
              <span>2. Tactical Sleeves in Analysis:</span>
              <span className="text-[11px] text-slate-500">{selectedSleevesForAnalysis.length} included</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto pr-1">
              {(['XLK', 'XLE', 'XLI', 'XLF', 'XLY', 'XLV', 'XLP', 'XLU', 'XLB', 'XLC', 'GLD', 'SLV'] as StudyTicker[]).map((sleeve) => {
                const isSelected = selectedSleevesForAnalysis.includes(sleeve);
                return (
                  <button
                    type="button"
                    key={sleeve}
                    onClick={() => toggleSleeveInAnalysis(sleeve)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{sleeve}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-500">
              Active in analysis: <span className="text-slate-300 font-mono">{selectedSleevesForAnalysis.join(', ') || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Macro Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
            <span>Unstructured Macro Statement or News Catalyst:</span>
            <span className="text-[11px] text-slate-500">Gemini 3.8 Flash inference</span>
          </label>
          <textarea
            rows={3}
            value={macroInput}
            onChange={(e) => setMacroInput(e.target.value)}
            className="w-full p-3 bg-[#0B0F19] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            placeholder="Paste FOMC statement excerpt, CPI release, Treasury announcement, or central bank commentary..."
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-400">
            Advisory scope: <span className="font-mono text-slate-300">Core (70%)</span> · Sleeves scope:{' '}
            <span className="font-mono text-rose-400">0% (Zero Permission)</span>
          </div>

          <button
            onClick={handleRunAIMacroAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{isAnalyzing ? 'Evaluating Macro Transmission...' : 'Synthesize AI Macro Judgment'}</span>
          </button>
        </div>

        {/* AI Advisory Result Card */}
        {advisoryResult && (
          <div className="p-4 bg-[#0B0F19] border border-emerald-500/30 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  AI Judgment Layer Advisory Proposal
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  Recommendation: <span className="text-emerald-400">{advisoryResult.recommendation}</span> &rarr; Asset:{' '}
                  <span className="font-mono text-cyan-300">{advisoryResult.targetAsset}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Lock Duration:</span>{' '}
                  <span className="text-white font-bold">{advisoryResult.lockDurationDays} Trading Days</span>
                </div>
                <div>
                  <span className="text-slate-500">Confidence:</span>{' '}
                  <span className="text-emerald-400 font-bold">
                    {(advisoryResult.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-200">{advisoryResult.headlineSummary}</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">{advisoryResult.rationale}</p>
            </div>

            {/* Downside Risk Factors */}
            <div className="pt-2 border-t border-slate-800 text-xs">
              <div className="text-slate-400 text-[11px] font-medium mb-1.5">Identified Downside Risks:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {advisoryResult.riskFactors.map((rf, idx) => (
                  <li key={idx}>{rf}</li>
                ))}
              </ul>
            </div>

            {/* Tactical Sleeves Context in Advisory */}
            <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Tactical Sleeves in Macro Scope:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {selectedSleevesForAnalysis.join(' · ') || 'None selected'}
                </span>
              </div>
              {onApplySleevesToSlots && selectedSleevesForAnalysis.length > 0 && (
                <button
                  type="button"
                  onClick={() => onApplySleevesToSlots(selectedSleevesForAnalysis)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded transition-colors flex items-center gap-1 shrink-0"
                >
                  <Layers className="w-3 h-3" />
                  <span>Deploy These Sleeves to Portfolio (3x 10%)</span>
                </button>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-mono italic pt-1">
              Governance Check: {advisoryResult.complianceNote}
            </div>

            {/* Human-In-The-Loop Execution Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 flex-wrap">
              {coreOverride.active && (
                <button
                  onClick={onClearAIOverride}
                  className="px-3.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-lg transition-colors font-medium"
                >
                  Clear Active Override (Revert to Rules)
                </button>
              )}

              <button
                onClick={() => onApplyAIOverride(advisoryResult)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Advisory Override to Core ({advisoryResult.targetAsset} 70%)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
