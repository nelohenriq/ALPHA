import React, { useState } from 'react';
import { Database, Server, RefreshCw, HardDrive, CheckCircle2, FileText, Search } from 'lucide-react';
import { STUDY_TICKERS } from '../data/mockMarketData';
import { StudyTicker } from '../types/alpha';

export const ArchitectureView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [harnessMode, setHarnessMode] = useState<'BACKTEST' | 'LIVE_BOT'>('LIVE_BOT');

  const filteredTickers = STUDY_TICKERS.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesQuery =
      item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Architecture Overview */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
              Pillar A · System Architecture
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Unified Data Pool, Persistence Engine & Execution Harness
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Strict single-source-of-truth mandate: Backtest and Live Bot share identical signal definitions
              and execution logic to prevent implementation mismatch. Parquet cached in UTC; persistent state maintained in SQLite WAL.
            </p>
          </div>

          {/* Single Code Harness Mode Switch */}
          <div className="p-1 bg-[#0B0F19] border border-slate-800 rounded-lg flex items-center shrink-0">
            <button
              onClick={() => setHarnessMode('LIVE_BOT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                harnessMode === 'LIVE_BOT'
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Bot Harness (Alpaca)
            </button>
            <button
              onClick={() => setHarnessMode('BACKTEST')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                harnessMode === 'BACKTEST'
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Backtest Engine (yfinance)
            </button>
          </div>
        </div>
      </div>

      {/* 3 Architecture Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Component 1: Data Engine */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
            <span>Data Ingestion Engine</span>
          </div>

          <p className="text-xs text-slate-400">
            Dual data source layer ensuring zero discrepancies between historical research and real-time execution.
          </p>

          <div className="space-y-2 text-xs pt-1">
            <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800/80">
              <div className="font-semibold text-slate-200">Backtest Ingestion</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Yahoo Finance (yfinance) · 2020-07-01 to 2026-10-23
              </div>
              <div className="text-[10px] text-emerald-400/90 font-mono mt-1">
                Dividends & Splits Adjusted · Daily Bars
              </div>
            </div>

            <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800/80">
              <div className="font-semibold text-slate-200">Live Ingestion</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Alpaca API (REST + WebSocket Stream)
              </div>
              <div className="text-[10px] text-emerald-400/90 font-mono mt-1">
                Sub-second 18ms latency · Real-time quotes
              </div>
            </div>
          </div>
        </div>

        {/* Component 2: Unified Parquet Pool */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <span>Unified Parquet Data Pool</span>
          </div>

          <p className="text-xs text-slate-400">
            Columnar storage with strict UTC timestamps, preventing lookahead bias and timezone synchronization errors.
          </p>

          <div className="space-y-2 text-xs pt-1 font-mono text-[11px]">
            <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800/80">
              <div className="text-slate-300 font-semibold">data/prices.parquet</div>
              <div className="text-slate-500 text-[10px] mt-0.5 font-sans">
                Historical database: 24 tickers x 1,580 daily bars
              </div>
              <div className="text-cyan-400 text-[10px] mt-1">Compression: Snappy · Schema: UTC float64</div>
            </div>

            <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800/80">
              <div className="text-slate-300 font-semibold">data/live_prices.parquet</div>
              <div className="text-slate-500 text-[10px] mt-0.5 font-sans">
                Intraday cache refreshed on every bar close
              </div>
              <div className="text-cyan-400 text-[10px] mt-1">Zero Lookahead Window Enforcement</div>
            </div>
          </div>
        </div>

        {/* Component 3: SQLite WAL Persistent DB */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
            <span>Persistent State DB (SQLite WAL)</span>
          </div>

          <p className="text-xs text-slate-400">
            Survives process crashes, bot restarts, and network partitions with Write-Ahead Logging (WAL) concurrency.
          </p>

          <div className="space-y-2 text-xs pt-1 font-mono text-[11px]">
            <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800/80">
              <div className="text-slate-300 font-semibold">state.db (PRAGMA journal_mode=WAL)</div>
              <div className="text-slate-500 text-[10px] mt-0.5 font-sans">
                Tables: orders, held_positions, pdt_counter, audit_trail
              </div>
              <div className="text-indigo-400 text-[10px] mt-1">SHA-256 Config Hash Verification</div>
            </div>

            <div className="p-2.5 bg-[#0B0F19] rounded-lg border border-slate-800/80">
              <div className="text-slate-300 font-semibold">Rolling PDT Counter</div>
              <div className="text-slate-500 text-[10px] mt-0.5 font-sans">
                Tracks 5-business-day rolling window round-trip day trades
              </div>
              <div className="text-emerald-400 text-[10px] mt-1">Active Guard: 1/3 Used (Safe)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Study Tickers Universe (24 assets per Master Blueprint) */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Study Tickers Universe (24 Assets)</span>
              <span className="text-xs font-normal text-slate-400">· Section 1 House Rules</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Engine Candidates (SPY, QQQ, IWM, DIA), Safe Candidates (BIL, SHY, IEF, TLT, GLD), Cash (BIL), Sectors, and BTC-USD (studied only).
            </p>
          </div>

          {/* Category Filter and Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[#0B0F19] border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#0B0F19] p-0.5 rounded-md border border-slate-800 text-xs">
              {['ALL', 'Engine', 'Safe', 'Cash', 'Sleeve', 'StudyOnly'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickers Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 font-medium">Symbol</th>
                <th className="pb-2.5 font-medium">Full Name</th>
                <th className="pb-2.5 font-medium">Blueprint Category</th>
                <th className="pb-2.5 font-medium text-right">Price</th>
                <th className="pb-2.5 font-medium text-right">24h Change</th>
                <th className="pb-2.5 font-medium text-right">200D MA</th>
                <th className="pb-2.5 font-medium text-right">63D Momentum</th>
                <th className="pb-2.5 font-medium text-right">30D Volatility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
              {filteredTickers.map((t) => {
                const isPositive = t.changePercent >= 0;
                return (
                  <tr key={t.ticker} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-2.5 font-bold text-white flex items-center gap-2">
                      <span>{t.ticker}</span>
                      {t.ticker === 'BTC-USD' && (
                        <span className="text-[10px] font-sans font-normal text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          Observed Only
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 font-sans text-slate-300">{t.name}</td>
                    <td className="py-2.5 font-sans">
                      <span
                        className={`text-[11px] font-semibold ${
                          t.category === 'Engine'
                            ? 'text-emerald-400'
                            : t.category === 'Safe'
                            ? 'text-cyan-400'
                            : t.category === 'Cash'
                            ? 'text-amber-400'
                            : t.category === 'Sleeve'
                            ? 'text-indigo-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-white">
                      ${t.price > 1000 ? t.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : t.price.toFixed(2)}
                    </td>
                    <td
                      className={`py-2.5 text-right font-semibold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {t.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      ${t.ma200 > 1000 ? t.ma200.toLocaleString('en-US') : t.ma200.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right text-slate-200">
                      {t.momentumScore63d > 0 ? '+' : ''}
                      {t.momentumScore63d.toFixed(1)}
                    </td>
                    <td className="py-2.5 text-right text-slate-400">{t.volatility30d.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
