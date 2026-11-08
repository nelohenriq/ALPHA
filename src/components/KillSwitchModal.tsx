import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, X, AlertOctagon, RotateCcw } from 'lucide-react';
import { SystemState } from '../types/alpha';

interface KillSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemState: SystemState;
  onTriggerKillSwitch: (reason: string) => void;
  onResetKillSwitch: () => void;
}

export const KillSwitchModal: React.FC<KillSwitchModalProps> = ({
  isOpen,
  onClose,
  systemState,
  onTriggerKillSwitch,
  onResetKillSwitch,
}) => {
  if (!isOpen) return null;

  const [panicReason, setPanicReason] = useState<string>('Unscheduled emergency volatility event');
  const [authCode, setAuthCode] = useState<string>('');
  const isTripped = systemState.circuitBreakerTripped;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg ${
              isTripped ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isTripped ? 'Circuit Breaker Active (Safety Halt)' : 'Safety Kill-Switch Controls'}
            </h2>
            <p className="text-xs text-slate-400">
              A.L.P.H.A. Harness Emergency Operational Kill-Switch
            </p>
          </div>
        </div>

        {isTripped ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-950/40 border border-rose-800 rounded-lg text-xs space-y-1.5">
              <div className="font-bold text-rose-300">Algorithmic Execution Halted</div>
              <p className="text-rose-400 text-[11px] leading-relaxed">
                Trigger reason: {systemState.circuitBreakerReason || 'Emergency circuit breaker tripped.'}
              </p>
              <div className="text-[10px] text-rose-500 font-mono pt-1">
                All outstanding orders cancelled · Risk locked
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-medium">
                Supervisor Authorization Code:
              </label>
              <input
                type="text"
                placeholder="Enter auth code (e.g., QUANT-SUPERVISOR-2026)"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onResetKillSwitch();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Circuit Breaker</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              Triggering this kill-switch will immediately cancel all pending Alpaca broker orders,
              close active sector positions, and rotate the portfolio into cash (<span className="font-mono text-emerald-400">BIL</span>).
            </p>

            <div className="p-3 bg-[#0B0F19] border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Equity:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  ${systemState.accountEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Daily Loss:</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {systemState.dailyLossPercent.toFixed(2)}% (Limit: -3.00%)
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Trigger Audit Rationale:</label>
              <input
                type="text"
                value={panicReason}
                onChange={(e) => setPanicReason(e.target.value)}
                className="w-full p-2.5 bg-[#0B0F19] border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onTriggerKillSwitch(panicReason);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-900/40"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>CONFIRM EMERGENCY KILL-SWITCH</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
