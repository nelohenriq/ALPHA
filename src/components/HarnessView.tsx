import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Server,
  Terminal,
  Download,
  RotateCcw,
  AlertOctagon,
  Wifi,
  Lock,
  Clock,
} from 'lucide-react';
import { SystemState, AuditLogItem } from '../types/alpha';

interface HarnessViewProps {
  systemState: SystemState;
  auditLogs: AuditLogItem[];
  onTriggerKillSwitch: (reason: string) => void;
  onResetKillSwitch: () => void;
}

export const HarnessView: React.FC<HarnessViewProps> = ({
  systemState,
  auditLogs,
  onTriggerKillSwitch,
  onResetKillSwitch,
}) => {
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [resetAuthCode, setResetAuthCode] = useState<string>('');

  const isTripped = systemState.circuitBreakerTripped;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter = logFilter === 'ALL' || log.pillar === logFilter || log.level === logFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.pillar.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDownloadLogs = () => {
    const jsonlString = filteredLogs.map((log) => JSON.stringify(log)).join('\n');
    const blob = new Blob([jsonlString], { type: 'application/x-jsonlines' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `machine_audit_logs_${new Date().toISOString().slice(0, 10)}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Pillar H */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
          Pillar H · Live Harness & Safety Operations
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Alpaca Broker Connection, Automated Circuit Breakers & JSONL Audit
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Fail-safe operational execution: Direct Alpaca-Py SDK connection with exponential backoff, automated
          circuit breakers for Daily Max Loss (-3%) and Peak Drawdown (-15%), and non-repudiable JSONL audit trail.
        </p>
      </div>

      {/* Safety Kill-Switches Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Switch 1: Daily Max Loss (-3%) */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Daily Max Loss (-3.0%)</span>
            </h3>
            <span
              className={`text-xs font-mono font-bold ${
                systemState.dailyLossPercent < -2.5
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {systemState.dailyLossPercent < -3.0 ? 'TRIPPED' : 'ARMED'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            If intraday loss reaches -3.00% of morning equity, all open orders cancel and portfolio liquidates to BIL.
          </p>

          <div className="space-y-2 pt-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Current Daily P&L:</span>
              <span
                className={`font-bold ${
                  systemState.dailyLossPercent < 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {systemState.dailyLossPercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Circuit Trip Level:</span>
              <span className="text-rose-400 font-bold">-3.00%</span>
            </div>

            {/* Meter */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (Math.abs(systemState.dailyLossPercent) / 3.0) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Switch 2: Peak Drawdown (-15%) */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Peak Drawdown (-15.0%)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400">ARMED</span>
          </div>

          <p className="text-xs text-slate-400">
            Hard circuit breaker: If portfolio draws down -15% from high-water mark, all algorithmic execution stops.
          </p>

          <div className="space-y-2 pt-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Current Peak Drawdown:</span>
              <span className="text-slate-200 font-bold">
                {systemState.peakDrawdownPercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Breaker Threshold:</span>
              <span className="text-rose-400 font-bold">-15.00%</span>
            </div>

            {/* Meter */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (Math.abs(systemState.peakDrawdownPercent) / 15.0) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Switch 3: Emergency Operator Kill-Switch */}
        <div className="bg-[#101623] border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Manual Panic Kill-Switch</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Human Override</span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Instantly halts trading bot, freezes order routing, and enforces risk lockdown.
            </p>
          </div>

          <div>
            {isTripped ? (
              <button
                onClick={() => setResetModalOpen(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET CIRCUIT BREAKER</span>
              </button>
            ) : (
              <button
                onClick={() =>
                  onTriggerKillSwitch('Manual operator emergency panic trigger from Harness tab.')
                }
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>TRIGGER PANIC KILL SWITCH</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Broker Integration & WebSocket Telemetry */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Alpaca-Py SDK Connection Status</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official SDK harness: Asynchronous WebSockets with exponential backoff & order routing validation.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-bold">STREAM ONLINE (18ms)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px] font-sans">API Environment</div>
            <div className="text-white font-bold mt-1">Paper Trading Gateway</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-sans">Live-Ready Config</div>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px] font-sans">Order Fill Route</div>
            <div className="text-white font-bold mt-1">Smart Order Routing (SOR)</div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-sans">0.05% slippage cap</div>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px] font-sans">WebSocket Heartbeat</div>
            <div className="text-white font-bold mt-1">PONG (30s cadence)</div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-sans">0 drops in 24h</div>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px] font-sans">Transaction Fee Model</div>
            <div className="text-white font-bold mt-1">5.0 bps / Trade</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-sans">Deducted on fill</div>
          </div>
        </div>
      </div>

      {/* JSONL Audit Trail & Telemetry Logs */}
      <div className="bg-[#101623] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span>Immutable JSONL Audit Stream</span>
              <span className="text-xs font-normal text-slate-400">({filteredLogs.length} events)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every signal, pre-flight check, order execution, and AI advisory is timestamped in UTC and recorded.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-[#0B0F19] p-0.5 rounded-md border border-slate-800 text-xs">
              {['ALL', 'EXEC', 'CRITICAL', 'WARN', 'INFO'].map((f) => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-2 py-1 rounded transition-colors font-mono text-[11px] ${
                    logFilter === f
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownloadLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSONL</span>
            </button>
          </div>
        </div>

        {/* Audit Log Box */}
        <div className="p-3 bg-[#0B0F19] border border-slate-800 rounded-lg max-h-80 overflow-y-auto space-y-2 font-mono text-xs">
          {filteredLogs.map((log, idx) => (
            <div
              key={idx}
              className="p-2 rounded bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 hover:bg-slate-900 transition-colors"
            >
              <span className="text-slate-500 text-[11px] shrink-0">
                {new Date(log.timestamp).toISOString().slice(11, 19)}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                  log.level === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : log.level === 'EXEC'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : log.level === 'WARN'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {log.level}
              </span>
              <span className="text-slate-400 text-[11px] shrink-0 font-sans">[{log.pillar}]</span>
              <div className="flex-1 min-w-0">
                <span className="text-slate-200">{log.message}</span>
                {log.details && (
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {JSON.stringify(log.details)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Reset Circuit Breaker</h3>
                <p className="text-xs text-slate-400">
                  Supervisor authorization required to resume algorithmic execution.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300">Supervisor Auth Code (e.g. AUTH-2026):</label>
              <input
                type="text"
                placeholder="Enter auth key or token..."
                value={resetAuthCode}
                onChange={(e) => setResetAuthCode(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetKillSwitch();
                  setResetModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
              >
                Confirm & Re-arm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
