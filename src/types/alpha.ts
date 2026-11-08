export type StudyTicker =
  | 'SPY'
  | 'QQQ'
  | 'IWM'
  | 'DIA'
  | 'XLK'
  | 'XLF'
  | 'XLE'
  | 'XLV'
  | 'XLI'
  | 'XLY'
  | 'XLP'
  | 'XLU'
  | 'XLB'
  | 'XLC'
  | 'XLRE'
  | 'TLT'
  | 'IEF'
  | 'SHY'
  | 'BIL'
  | 'GLD'
  | 'SLV'
  | 'USO'
  | 'DBC'
  | 'BTC-USD';

export type RegimeType = 'BULLISH_UPTREND' | 'BEARISH_DOWNTREND' | 'TRANSITION_WHIPSAW';

export type CoreAssetType = StudyTicker;

export interface TickerData {
  ticker: StudyTicker;
  name: string;
  category: 'Engine' | 'Safe' | 'Cash' | 'Sleeve' | 'Benchmark' | 'StudyOnly';
  price: number;
  changePercent: number;
  ma200: number;
  momentumScore63d: number;
  volatility30d: number;
}

export interface PortfolioPosition {
  ticker: StudyTicker;
  name: string;
  type: 'CORE' | 'SLEEVE';
  slotIndex?: number; // 0, 1, 2 for the 3 sleeves
  allocationWeight: number; // e.g. 0.70 for Core, 0.10 for Sleeve
  shares: number;
  avgEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  decayZScore?: number; // For sleeves: strategy decay score
  decayStatus?: 'NOMINAL' | 'WARNING' | 'BREACHED'; // > 2 sigma
}

export interface SystemState {
  circuitBreakerTripped: boolean;
  circuitBreakerReason: string | null;
  dailyLossPercent: number;
  peakDrawdownPercent: number;
  pdtCount5Days: number;
  accountEquity: number;
  startingCapital: number;
  buyingPower: number;
  pdtGuardActive: boolean;
  aiGovernanceEnabled: boolean;
  coreOverride: {
    active: boolean;
    advisory: 'HOLD' | 'ENGINE' | 'SAFE' | 'CASH';
    targetAsset: CoreAssetType;
    remainingDays: number;
    lockDurationDays: number;
    timestamp: string | null;
    rationale: string;
  };
}

export interface AuditLogItem {
  timestamp: string;
  pillar: 'ARCHITECTURE' | 'LOGIC' | 'PROOF' | 'HARNESS' | 'ADAPT';
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'EXEC';
  message: string;
  details?: Record<string, any>;
}

export interface HistoricalBar {
  date: string;
  spyPrice: number;
  spy200dMa: number;
  portfolioEquity: number;
  benchmarkEquity: number;
  coreAsset: string;
  regime: RegimeType;
}

export interface MonteCarloPath {
  percentile: 'p95' | 'p90' | 'p50' | 'p10' | 'worst';
  label: string;
  maxDrawdown: number;
  finalEquity: number;
  values: number[]; // Sequence of equity values over simulated 252 bars
}

export interface AIAdvisoryResult {
  recommendation: 'HOLD' | 'ENGINE' | 'SAFE' | 'CASH';
  targetAsset: CoreAssetType;
  lockDurationDays: 5 | 10 | 20;
  confidenceScore: number;
  headlineSummary: string;
  rationale: string;
  riskFactors: string[];
  complianceNote: string;
  isMock?: boolean;
}
