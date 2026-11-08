import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRight, DollarSign, Activity } from 'lucide-react';
import { STUDY_TICKERS } from '../data/mockMarketData';
import { SystemState, StudyTicker } from '../types/alpha';

interface TradeExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemState: SystemState;
  onExecuteTrade: (trade: {
    ticker: StudyTicker;
    action: 'BUY' | 'SELL';
    shares: number;
    price: number;
    targetSlot: 'CORE' | 'SLEEVE_1' | 'SLEEVE_2' | 'SLEEVE_3';
    fee: number;
  }) => void;
}

export const TradeExecutionModal: React.FC<TradeExecutionModalProps> = ({
  isOpen,
  onClose,
  systemState,
  onExecuteTrade,
}) => {
  if (!isOpen) return null;

  const [selectedTicker, setSelectedTicker] = useState<StudyTicker>('QQQ');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<number>(20);
  const [targetSlot, setTargetSlot] = useState<'CORE' | 'SLEEVE_1' | 'SLEEVE_2' | 'SLEEVE_3'>('SLEEVE_1');

  const currentTickerData = STUDY_TICKERS.find((t) => t.ticker === selectedTicker) || STUDY_TICKERS[0];
  const unitPrice = currentTickerData.price;
  const notionalValue = unitPrice * shares;
  // House rule: Transaction Cost: 0.05% (5 bps) of traded value on every buy and sell
  const transactionFee = notionalValue * 0.0005;
  const totalCost = notionalValue + transactionFee;

  const hasSufficientBuyingPower = systemState.buyingPower >= totalCost;
  const isPdtRisk = systemState.accountEquity < 25000 && systemState.pdtCount5Days >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSufficientBuyingPower) return;

    onExecuteTrade({
      ticker: selectedTicker,
      action,
      shares,
      price: unitPrice,
      targetSlot,
      fee: transactionFee,
    });
    onClose();
  };

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
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Order Routing & Pre-Flight Execution Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Alpaca-Py SDK Broker Harness · 0.05% Fee Model
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Action and Ticker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium mb-1 block">Side:</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#0B0F19] border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAction('BUY')}
                  className={`py-1.5 rounded font-bold transition-colors ${
                    action === 'BUY'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setAction('SELL')}
                  className={`py-1.5 rounded font-bold transition-colors ${
                    action === 'SELL'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium mb-1 block">Study Asset:</label>
              <select
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value as StudyTicker)}
                className="w-full p-2 bg-[#0B0F19] border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              >
                {STUDY_TICKERS.filter((t) => t.category !== 'StudyOnly').map((t) => (
                  <option key={t.ticker} value={t.ticker}>
                    {t.ticker} · ${t.price.toFixed(2)} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Allocation Slot Target */}
          <div>
            <label className="text-slate-300 font-medium mb-1 block">
              Portfolio Slot Destination:
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#0B0F19] border border-slate-800 rounded-lg font-mono">
              {[
                { id: 'CORE', label: 'Core (70%)' },
                { id: 'SLEEVE_1', label: 'Sleeve 1 (10%)' },
                { id: 'SLEEVE_2', label: 'Sleeve 2 (10%)' },
                { id: 'SLEEVE_3', label: 'Sleeve 3 (10%)' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setTargetSlot(s.id as any)}
                  className={`py-1 text-[11px] rounded transition-colors ${
                    targetSlot === s.id
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shares Quantity */}
          <div>
            <label className="text-slate-300 font-medium mb-1 block">Shares Count:</label>
            <input
              type="number"
              min="1"
              max="5000"
              value={shares}
              onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2.5 bg-[#0B0F19] border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Pre-Flight Calculation Box */}
          <div className="p-3 bg-[#0B0F19] border border-slate-800 rounded-lg space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Market Price:</span>
              <span className="text-white">${unitPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Notional Traded Value:</span>
              <span className="text-white font-bold">
                ${notionalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Transaction Fee (0.05%):</span>
              <span className="text-slate-300">${transactionFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
              <span className="text-slate-200 font-sans font-semibold">Total Order Requirement:</span>
              <span className="text-emerald-400 font-bold">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Pre-Flight Checks Summary */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Available Buying Power:</span>
              <span className="font-mono text-white">
                ${systemState.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">FINRA PDT Guard:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {systemState.pdtCount5Days}/3 Trades (SAFE)
              </span>
            </div>
            {isPdtRisk && (
              <div className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>PDT Warning: Intraday round-trip trade would breach FINRA PDT limit!</span>
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasSufficientBuyingPower}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 ${
                action === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {action} {shares} {selectedTicker} (${notionalValue.toFixed(0)})
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
