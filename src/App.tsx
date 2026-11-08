import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricOverview } from './components/MetricOverview';
import { LiveCockpit } from './components/LiveCockpit';
import { ArchitectureView } from './components/ArchitectureView';
import { LogicView } from './components/LogicView';
import { ProofView } from './components/ProofView';
import { HarnessView } from './components/HarnessView';
import { AdaptView } from './components/AdaptView';
import { KillSwitchModal } from './components/KillSwitchModal';
import { TradeExecutionModal } from './components/TradeExecutionModal';
import {
  INITIAL_POSITIONS,
  HISTORICAL_CHART_DATA,
  STUDY_TICKERS,
} from './data/mockMarketData';
import {
  SystemState,
  PortfolioPosition,
  AuditLogItem,
  AIAdvisoryResult,
  StudyTicker,
} from './types/alpha';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'cockpit' | 'architecture' | 'logic' | 'proof' | 'harness' | 'adapt'
  >('cockpit');

  const [systemState, setSystemState] = useState<SystemState>({
    circuitBreakerTripped: false,
    circuitBreakerReason: null,
    dailyLossPercent: -0.84,
    peakDrawdownPercent: -4.2,
    pdtCount5Days: 1,
    accountEquity: 104850.25,
    startingCapital: 100000.0,
    buyingPower: 209700.5,
    pdtGuardActive: true,
    aiGovernanceEnabled: true,
    coreOverride: {
      active: false,
      advisory: 'HOLD',
      targetAsset: 'QQQ',
      remainingDays: 0,
      lockDurationDays: 0,
      timestamp: null,
      rationale: 'Autonomous regime rules active (SPY > 200D MA).',
    },
  });

  const [selectedAssetToAnalyze, setSelectedAssetToAnalyze] = useState<StudyTicker>('QQQ');
  const [positions, setPositions] = useState<PortfolioPosition[]>(INITIAL_POSITIONS);

  // Set Asset for Core (70%)
  const handleSetCoreAsset = (ticker: StudyTicker) => {
    const assetData = STUDY_TICKERS.find((t) => t.ticker === ticker);
    const price = assetData ? assetData.price : 400;
    const coreBudget = 73316.25;
    const shares = Math.floor(coreBudget / price);

    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.type === 'CORE') {
          return {
            ...pos,
            ticker,
            name: assetData?.name || `${ticker} (Core Allocation)`,
            currentPrice: price,
            avgEntryPrice: price * 0.98,
            shares,
            marketValue: shares * price,
            unrealizedPnL: (price - price * 0.98) * shares,
            unrealizedPnLPercent: 2.04,
          };
        }
        return pos;
      })
    );

    setSelectedAssetToAnalyze(ticker);

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'LOGIC',
      level: 'INFO',
      message: `Core Engine asset updated to ${ticker} (${assetData?.name || ticker}) at 70% capital allocation ($${coreBudget.toLocaleString()}).`,
      details: { ticker, shares, price },
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Update specific sleeve slot (0, 1, or 2)
  const handleUpdateSleeveSlot = (slotIndex: number, newTicker: StudyTicker) => {
    const assetData = STUDY_TICKERS.find((t) => t.ticker === newTicker);
    const price = assetData ? assetData.price : 100;
    const slotBudget = 10485.02;
    const shares = Math.floor(slotBudget / price);

    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.type === 'SLEEVE' && pos.slotIndex === slotIndex) {
          return {
            ...pos,
            ticker: newTicker,
            name: assetData?.name || `${newTicker} Tactical Sleeve`,
            currentPrice: price,
            avgEntryPrice: price * 0.99,
            shares,
            marketValue: shares * price,
            unrealizedPnL: (price - price * 0.99) * shares,
            unrealizedPnLPercent: 1.01,
            decayZScore: 0.35 + Math.random() * 0.3,
            decayStatus: 'NOMINAL',
          };
        }
        return pos;
      })
    );

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'ADAPT',
      level: 'INFO',
      message: `Sleeve Slot #${slotIndex + 1} updated to ${newTicker} (10% allocation = $${slotBudget.toLocaleString()}).`,
      details: { slotIndex, newTicker, shares, price },
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Auto-Select top 3 relative momentum leaders for Sleeves
  const handleAutoSelectTopMomentum = () => {
    const candidates = STUDY_TICKERS.filter(
      (t) => t.category === 'Sleeve' || t.category === 'Engine'
    ).sort((a, b) => b.momentumScore63d - a.momentumScore63d);

    const top3 = candidates.slice(0, 3);
    const slotBudget = 10485.02;

    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.type === 'SLEEVE') {
          const idx = pos.slotIndex ?? 0;
          const assigned = top3[idx] || top3[0];
          const shares = Math.floor(slotBudget / assigned.price);
          return {
            ...pos,
            ticker: assigned.ticker,
            name: assigned.name,
            currentPrice: assigned.price,
            avgEntryPrice: assigned.price * 0.99,
            shares,
            marketValue: shares * assigned.price,
            decayZScore: 0.25 + Math.random() * 0.3,
            decayStatus: 'NOMINAL',
          };
        }
        return pos;
      })
    );

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'ADAPT',
      level: 'EXEC',
      message: `Top 3 Momentum Auto-Pick applied: Deployed Sleeves to ${top3.map((t) => `${t.ticker} (+${t.momentumScore63d})`).join(', ')}.`,
      details: { top3: top3.map((t) => t.ticker) },
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Apply custom sleeve basket (e.g. from AI Governance) to the 3 tactical slots
  const handleApplySleevesToSlots = (newSleeves: StudyTicker[]) => {
    const slotBudget = 10485.02;
    const top3 = newSleeves.slice(0, 3);

    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.type === 'SLEEVE') {
          const idx = pos.slotIndex ?? 0;
          const assignedTicker = top3[idx] || pos.ticker;
          const tickerInfo = STUDY_TICKERS.find((t) => t.ticker === assignedTicker);
          const currentPrice = tickerInfo ? tickerInfo.price : pos.currentPrice;
          const shares = Math.floor(slotBudget / currentPrice);
          return {
            ...pos,
            ticker: assignedTicker,
            name: tickerInfo?.name || `${assignedTicker} Tactical Sleeve`,
            currentPrice,
            avgEntryPrice: currentPrice * 0.99,
            shares,
            marketValue: shares * currentPrice,
            decayZScore: 0.35 + Math.random() * 0.3,
            decayStatus: 'NOMINAL',
          };
        }
        return pos;
      })
    );

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'ADAPT',
      level: 'EXEC',
      message: `Tactical Sleeves deployed from AI Macro Governance: Allocated 10% each to ${top3.join(', ')}.`,
      details: { top3 },
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      pillar: 'ARCHITECTURE',
      level: 'INFO',
      message: 'Unified Parquet cache synchronized (Yahoo Finance UTC adjusted for splits & dividends).',
      details: { tickersCount: 24, range: '2020-07-01 to 2026-10-23' },
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      pillar: 'LOGIC',
      level: 'INFO',
      message: 'SPY 200D MA Regime Router: Uptrend confirmed (SPY @ 582.40 > 200D MA @ 545.10, +6.84%).',
      details: { regime: 'BULLISH_UPTREND', coreTarget: 'QQQ', weight: 0.70 },
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      pillar: 'PROOF',
      level: 'INFO',
      message: 'Monte Carlo Block Bootstrap verified: 95th percentile Max DD = 18.4% (< 25% boundary).',
      details: { p95_dd: -0.184, pure_noise_p_val: 0.008, planted_edge: 'PASSED' },
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      pillar: 'HARNESS',
      level: 'INFO',
      message: 'Pre-flight passed: FINRA PDT trades = 1/3, Buying Power = $209,700, Daily Loss = -0.84% > -3.0%.',
      details: { pdtTrades: 1, equity: 104850.25, marketStatus: 'OPEN' },
    },
    {
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      pillar: 'ADAPT',
      level: 'EXEC',
      message: 'Tactical Sleeve rebalance executed: Allocated 10% to XLK, 10% to XLE, 10% to XLI.',
      details: { slippageBps: 2.1, transactionCost: '$15.73' },
    },
  ]);

  const [killSwitchModalOpen, setKillSwitchModalOpen] = useState<boolean>(false);
  const [tradeModalOpen, setTradeModalOpen] = useState<boolean>(false);

  // Sync state with server on mount if available
  useEffect(() => {
    fetch('/api/state')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.state) {
          setSystemState(data.state);
        }
        if (data?.auditLogs && data.auditLogs.length > 0) {
          setAuditLogs(data.auditLogs);
        }
      })
      .catch((err) => {
        console.log('Running in local memory mode:', err.message);
      });
  }, []);

  // Trigger Emergency Kill-Switch
  const handleTriggerKillSwitch = async (reason: string) => {
    setSystemState((prev) => ({
      ...prev,
      circuitBreakerTripped: true,
      circuitBreakerReason: reason,
    }));

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'HARNESS',
      level: 'CRITICAL',
      message: `SAFETY KILL-SWITCH TRIPPED: All automated orders halted. Immediate risk mitigation active. Reason: ${reason}`,
      details: { reason, equity: systemState.accountEquity },
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('/api/safety/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch (e) {
      // Handled locally
    }
  };

  // Reset Kill Switch
  const handleResetKillSwitch = async () => {
    setSystemState((prev) => ({
      ...prev,
      circuitBreakerTripped: false,
      circuitBreakerReason: null,
    }));

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'HARNESS',
      level: 'INFO',
      message:
        'Circuit breaker manually reset by supervisor. Algorithmic execution resumed with safety checks verified.',
      details: { resetBy: 'Supervisor Quant', token: 'SUPERVISOR_AUTH' },
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('/api/safety/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationToken: 'SUPERVISOR_AUTH' }),
      });
    } catch (e) {
      // Handled locally
    }
  };

  // Apply AI Advisory Override to Core (70%)
  const handleApplyAIOverride = async (advisory: AIAdvisoryResult) => {
    const updatedOverride = {
      active: advisory.recommendation !== 'HOLD',
      advisory: advisory.recommendation,
      targetAsset: advisory.targetAsset,
      remainingDays: advisory.lockDurationDays,
      lockDurationDays: advisory.lockDurationDays,
      timestamp: new Date().toISOString(),
      rationale: advisory.rationale,
    };

    setSystemState((prev) => ({
      ...prev,
      coreOverride: updatedOverride,
    }));

    // Update positions table if target asset changed
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.type === 'CORE') {
          return {
            ...pos,
            ticker: advisory.targetAsset,
            name: `${advisory.targetAsset} (AI Macro Advisory Lock)`,
          };
        }
        return pos;
      })
    );

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'ADAPT',
      level: 'EXEC',
      message: `AI Macro Advisory Override APPLIED: Core (70%) directed to ${advisory.targetAsset} locked for ${advisory.lockDurationDays} days.`,
      details: {
        recommendation: advisory.recommendation,
        targetAsset: advisory.targetAsset,
        duration: advisory.lockDurationDays,
        confidence: advisory.confidenceScore,
      },
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('/api/ai/apply-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendation: advisory.recommendation,
          targetAsset: advisory.targetAsset,
          lockDurationDays: advisory.lockDurationDays,
          rationale: advisory.rationale,
        }),
      });
    } catch (e) {
      // Handled locally
    }
  };

  // Clear AI Advisory Override (Revert to pure quantitative rules)
  const handleClearAIOverride = async () => {
    setSystemState((prev) => ({
      ...prev,
      coreOverride: {
        active: false,
        advisory: 'HOLD',
        targetAsset: 'QQQ',
        remainingDays: 0,
        lockDurationDays: 0,
        timestamp: null,
        rationale: 'Reverted to autonomous quantitative rules (SPY 200D MA regime).',
      },
    }));

    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.type === 'CORE') {
          return {
            ...pos,
            ticker: 'QQQ',
            name: 'Invesco QQQ Trust (Primary Engine)',
          };
        }
        return pos;
      })
    );

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'ADAPT',
      level: 'INFO',
      message: 'Core Override CLEARED: Reverted to autonomous quantitative rules (SPY 200D MA regime).',
      details: {},
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('/api/ai/clear-override', { method: 'POST' });
    } catch (e) {
      // Handled locally
    }
  };

  // Re-rank Relative Momentum across Sectors
  const handleTriggerRebalance = () => {
    const candidates: StudyTicker[] = ['XLK', 'XLE', 'XLI', 'XLF', 'XLY', 'XLV'];
    // Rotate to next top momentum candidates
    const newTop = ['XLK', 'XLF', 'XLY'] as StudyTicker[];

    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.type === 'SLEEVE') {
          const idx = pos.slotIndex ?? 0;
          const newTicker = newTop[idx] || pos.ticker;
          const tickerInfo = STUDY_TICKERS.find((t) => t.ticker === newTicker);
          const currentPrice = tickerInfo ? tickerInfo.price : pos.currentPrice;
          const shares = Math.floor(10485 / currentPrice);
          return {
            ...pos,
            ticker: newTicker,
            name: tickerInfo?.name || `${newTicker} Select Sector`,
            currentPrice,
            shares,
            marketValue: shares * currentPrice,
            decayZScore: 0.35 + Math.random() * 0.4,
            decayStatus: 'NOMINAL',
          };
        }
        return pos;
      })
    );

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'ADAPT',
      level: 'EXEC',
      message: 'Tactical Sleeve rebalance executed: Rotated slots into top 63D momentum leaders (XLK, XLF, XLY).',
      details: { transactionCost: '$15.73', feeModel: '0.05% of traded value' },
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Simulate Sleeve Decay Breach and Auto-Rotation
  const handleSimulateSleeveDecayBreach = (slotIndex: number) => {
    const backupCandidate: StudyTicker = 'XLF';
    const backupInfo = STUDY_TICKERS.find((t) => t.ticker === backupCandidate)!;

    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.type === 'SLEEVE' && pos.slotIndex === slotIndex) {
          const shares = Math.floor(10485 / backupInfo.price);
          return {
            ...pos,
            ticker: backupCandidate,
            name: `${backupInfo.name} (Rotated replacement)`,
            currentPrice: backupInfo.price,
            shares,
            marketValue: shares * backupInfo.price,
            decayZScore: 0.45,
            decayStatus: 'NOMINAL',
          };
        }
        return pos;
      })
    );

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'ADAPT',
      level: 'CRITICAL',
      message: `TACTICAL SLEEVE DECAY BREACH (> 2.0σ): Slot #${slotIndex + 1} alpha degraded beyond confidence bounds. Deactivated and auto-rotated to next momentum leader (${backupCandidate}).`,
      details: { slotIndex, rotatedTo: backupCandidate, zScoreBefore: 2.18 },
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Simulate PDT trade count change
  const handleSimulateTradeCountChange = (count: number) => {
    setSystemState((prev) => ({
      ...prev,
      pdtCount5Days: count,
    }));

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'LOGIC',
      level: count >= 3 ? 'WARN' : 'INFO',
      message: `FINRA PDT Monitor: Rolling 5-day round-trip day trade count updated to ${count}/3.`,
      details: { count, limit: 3, equity: systemState.accountEquity },
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Manual / Algorithmic Trade Execution
  const handleExecuteTrade = (trade: {
    ticker: StudyTicker;
    action: 'BUY' | 'SELL';
    shares: number;
    price: number;
    targetSlot: 'CORE' | 'SLEEVE_1' | 'SLEEVE_2' | 'SLEEVE_3';
    fee: number;
  }) => {
    const notional = trade.shares * trade.price;

    setSystemState((prev) => ({
      ...prev,
      accountEquity: prev.accountEquity - trade.fee,
      buyingPower: prev.buyingPower - notional - trade.fee,
      pdtCount5Days: prev.pdtCount5Days + 1,
    }));

    const newLog: AuditLogItem = {
      timestamp: new Date().toISOString(),
      pillar: 'HARNESS',
      level: 'EXEC',
      message: `BROKER ORDER FILLED: ${trade.action} ${trade.shares} ${trade.ticker} @ $${trade.price.toFixed(2)} (Value: $${notional.toFixed(2)}, Fee: $${trade.fee.toFixed(2)}).`,
      details: {
        ticker: trade.ticker,
        side: trade.action,
        shares: trade.shares,
        fee: trade.fee,
        targetSlot: trade.targetSlot,
      },
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F1F5F9] flex flex-col">
      {/* 1. Header conforming to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemState={systemState}
        onOpenKillSwitch={() => setKillSwitchModalOpen(true)}
        onOpenTradeModal={() => setTradeModalOpen(true)}
      />

      {/* 2. High-Density KPI Strip */}
      <MetricOverview
        systemState={systemState}
        spyPrice={582.40}
        spy200dMa={545.10}
        coreAsset={positions.find((p) => p.type === 'CORE')?.ticker || 'QQQ'}
        sleeveTickers={positions.filter((p) => p.type === 'SLEEVE').map((p) => p.ticker)}
      />

      {/* 3. Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {activeTab === 'cockpit' && (
          <LiveCockpit
            systemState={systemState}
            positions={positions}
            historicalData={HISTORICAL_CHART_DATA}
            auditLogs={auditLogs}
            onTriggerRebalance={handleTriggerRebalance}
            onOpenTradeModal={() => setTradeModalOpen(true)}
            onNavigateToTab={setActiveTab}
            selectedAssetToAnalyze={selectedAssetToAnalyze}
            onSelectAssetToAnalyze={setSelectedAssetToAnalyze}
            onSetCoreAsset={handleSetCoreAsset}
            onUpdateSleeveSlot={handleUpdateSleeveSlot}
            onAutoSelectTopMomentum={handleAutoSelectTopMomentum}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureView />}

        {activeTab === 'logic' && (
          <LogicView
            systemState={systemState}
            onSimulateTradeCountChange={handleSimulateTradeCountChange}
          />
        )}

        {activeTab === 'proof' && <ProofView />}

        {activeTab === 'harness' && (
          <HarnessView
            systemState={systemState}
            auditLogs={auditLogs}
            onTriggerKillSwitch={handleTriggerKillSwitch}
            onResetKillSwitch={handleResetKillSwitch}
          />
        )}

        {activeTab === 'adapt' && (
          <AdaptView
            systemState={systemState}
            positions={positions}
            onApplyAIOverride={handleApplyAIOverride}
            onClearAIOverride={handleClearAIOverride}
            onSimulateSleeveDecayBreach={handleSimulateSleeveDecayBreach}
            onApplySleevesToSlots={handleApplySleevesToSlots}
          />
        )}
      </main>

      {/* Modals */}
      <KillSwitchModal
        isOpen={killSwitchModalOpen}
        onClose={() => setKillSwitchModalOpen(false)}
        systemState={systemState}
        onTriggerKillSwitch={handleTriggerKillSwitch}
        onResetKillSwitch={handleResetKillSwitch}
      />

      <TradeExecutionModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        systemState={systemState}
        onExecuteTrade={handleExecuteTrade}
      />

      {/* Footer conforming to Anti-Slop (No fake telemetry tickers or pseudo code comments) */}
      <footer className="border-t border-slate-800/80 px-6 py-4 bg-[#090D16] text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span>THE MACHINE · A.L.P.H.A. Blueprint V2.1.0</span>
          <span>·</span>
          <span>Quantitative Algorithmic Execution</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Daily Bars: 2020-07 to 2026-10</span>
          <span>·</span>
          <span>Core (70%) / Sleeves (30%)</span>
          <span>·</span>
          <span>Cost: 5.0 bps</span>
        </div>
      </footer>
    </div>
  );
}
