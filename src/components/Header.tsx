import React from 'react';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';
import { SystemState } from '../types/alpha';

interface HeaderProps {
  activeTab: 'cockpit' | 'architecture' | 'logic' | 'proof' | 'harness' | 'adapt';
  setActiveTab: (tab: 'cockpit' | 'architecture' | 'logic' | 'proof' | 'harness' | 'adapt') => void;
  systemState: SystemState;
  onOpenKillSwitch: () => void;
  onOpenTradeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  systemState,
  onOpenKillSwitch,
  onOpenTradeModal,
}) => {
  const isTripped = systemState.circuitBreakerTripped;

  return (
    <header className="sticky top-0 z-50 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark in display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              THE MACHINE <span className="text-emerald-400 font-mono text-xs font-normal">v2.1.0</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line text navigation links) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'cockpit'
                ? 'text-white border-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Terminal Cockpit
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'architecture'
                ? 'text-white border-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            A · Architecture
          </button>
          <button
            onClick={() => setActiveTab('logic')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'logic'
                ? 'text-white border-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            L · Logic & Regimes
          </button>
          <button
            onClick={() => setActiveTab('proof')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'proof'
                ? 'text-white border-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            P · Proof & Validation
          </button>
          <button
            onClick={() => setActiveTab('harness')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'harness'
                ? 'text-white border-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            H · Harness & Safety
          </button>
          <button
            onClick={() => setActiveTab('adapt')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'adapt'
                ? 'text-white border-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            A · Adapt & AI Governance
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (with status indicator) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenTradeModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Order</span>
          </button>

          <button
            onClick={onOpenKillSwitch}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              isTripped
                ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-900/40 animate-pulse'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {isTripped ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>CIRCUIT TRIPPED (RESET)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KILL SWITCH</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
