# SYSTEM SPECIFICATION & IMPLEMENTATION MASTER BLUEPRINT

## PROJECT: "THE MACHINE" (A.L.P.H.A. BLUEPRINT V2.1.0 - COURSE ALIGNED)

---

## 1. HOUSE RULES & SYSTEM SETTINGS

### Base Parameters

* **Bar size:** Daily. A "day" in these rules means one bar (e.g., with hourly bars, the 200-day line is the 200-bar line).
* **Data Range:** From `2020-07-01` through `2026-10-23`, via Yahoo Finance (`yfinance` library), adjusted for splits and dividends. (`yfinance` treats the end date as exclusive, pass the day after).
* **Training Window:** `2022-01-03` to `2024-12-31` (Modern market regimes priority).
* **Locked Test Window:** `2025-01-02` to `2026-10-23`.
* **Study Tickers:** `SPY QQQ IWM DIA XLK XLF XLE XLV XLI XLY XLP XLU XLB XLC XLRE TLT IEF SHY BIL GLD SLV USO DBC BTC-USD`.
* **Market Ticker:** `SPY`. Its uptrend and downtrend days represent the entire market.
* **Engine Candidates:** `SPY QQQ IWM DIA`.
* **Safe Candidates:** `BIL SHY IEF TLT GLD`.
* **Cash Ticker:** `BIL`. Idle money sits in it; every safe candidate must beat it.
* **Studied but Never Traded:** `BTC-USD`.
* **Sleeve Tickers:** Every study ticker except the cash ticker and non-traded tickers.
* **Transaction Cost:** `0.05%` of traded value on every buy and sell.
* **Starting Capital:** `$100,000`.

---

## 2. PORTFOLIO ARCHITECTURE: CORE & SLEEVES

```
+-------------------------------------------------------------------------+
|                          PORTFOLIO CAPITAL ALLOCATION                    |
+----------------------------------------------------+--------------------+
| CORE ENGINE (70% Capital)                          | SLEEVES (30% Cap)  |
| - Low turnover / Switches rarely                   | - 3 x 10% slots    |
| - Allocates to Engine Ticker, Safe Asset, or Cash  | - Trade frequently |
| - Trend & Macro Driven                             | - Tactical Alpha   |
+----------------------------------------------------+--------------------+
```

### Capital Division & Execution Frequency

1. **Core Allocation (70% Capital):**
   * **Purpose:** Provides long-term market exposure, trend capture, and capital preservation.
   * **Behavior:** Low turnover. Position changes occur rarely (triggered by 200-day trend regime transitions or macro overrides).
   * **Assets:** Rotates between Primary Engine (e.g., `QQQ`), Safe Assets (e.g., `GLD`, `TLT`), or Cash (`BIL`).

2. **Tactical Sleeves (30% Capital):**
   * **Purpose:** Captures short-term relative momentum and tactical alpha across sector ETFs.
   * **Structure:** Divided into discrete slots (3 sleeves at 10% capital allocation each).
   * **Behavior:** High frequency / tactical swapping based on dynamic momentum ranking and relative strength indicators without disturbing the 70% Core position.
   * **Strategy Decay Protection:** Monitored continuously for performance decay. If a sleeve's alpha degrades beyond statistical thresholds ($>2\sigma$), it is automatically deactivated and swapped out.

---

## 3. SYSTEM DATA FLOW & SINGLE SOURCE OF TRUTH

```
+------+    +--------+    +----------------+    +------+    +--------+    +--------+
| Data |--->| Regime |--->| Core (70%)     |--->| Risk |--->| Orders |--->| Broker |
+------+    +--------+    | Sleeves (30%)  |    +------+    +--------+    +--------+
                          +----------------+                    |
                                                                v
+-----------+    +--------+    +------+                         |
| Dashboard |<---| Alerts |<---| Log  |<------------------------+
+-----------+    +--------+    +------+

              [ SAME CODE / SINGLE SOURCE OF TRUTH ]
              +----------------+    +--------------+
              | Backtest Engine|    | Live Trading |
              +----------------+    +--------------+
```

1. **Pipeline Order:** Data Ingestion $\to$ Regime Detection $\to$ Core/Sleeve Allocation $\to$ Risk Checks $\to$ Order Generation $\to$ Broker Execution $\to$ Logging $\to$ Alerting $\to$ Dashboard Render.
2. **Single Codebase Mandate:** Backtest and Live Bot import identical signal definitions (`src/signals.py`) and execution logic to prevent implementation mismatch.

---

## 4. RULES vs. AI JUDGMENT LAYER & WORKFLOW

```
+--------------------------------------------------------------------------+
|                            DETERMINISTIC RULES                           |
|  - Quantitative signals execute 100% of trades programmatically          |
+--------------------------------------------------------------------------+
                                     ^
                                     | (Modifies Core Allocation Only)
+--------------------------------------------------------------------------+
|                             AI JUDGMENT LAYER                            |
|  - Reads unstructured macro inputs (e.g., Fed statements, CPI data)      |
|  - Issues advisory overrides for CORE ONLY: [HOLD, ENGINE, SAFE, CASH]   |
|  - Lock Durations: 5, 10, or 20 trading days                              |
|  - Immutable Execution: Saved to DB first; zero write permissions to     |
|    tactical sleeves or core code.                                        |
+--------------------------------------------------------------------------+
```

### Engineering Workflow ("One Job Per Prompt")
* All codebase modifications must follow strict single-prompt modularity:
  * **Prompt 1:** Data engine and local storage setup.
  * **Prompt 2:** Signal generation & Core/Sleeve logic implementation.
  * **Prompt 3:** Pre-flight validation, FINRA PDT Guard, and safety kill-switches.
  * **Prompt 4:** Harness, broker integration (Alpaca API), and logging.

---

## 5. A.L.P.H.A. ARCHITECTURE SPECIFICATIONS (V2.1.0)

```
===================================================================================================================================
                                   'THE MACHINE' (V2.1.0) - A.L.P.H.A. SOFTWARE ENGINEERING BLUEPRINT
===================================================================================================================================

  A - ARCHITECTURE             L - LOGIC                  P - PROOF                 H - HARNESS                A - ADAPT
   (System Overview)      (Strategy & Regimes)       (Strategy Validation)         (Live Operations)      (Governance & Limits)
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│ DATA ENGINE LAYER     │ │ REGIME ROUTER         │ │ ZERO ALPHA PROOF      │ │ ALARM & AUDIT         │ │ SLEEVE MANAGEMENT     │
│  - Primary: Alpaca API│ │  - SPY >= 200D MA     │ │  - Pure Noise Test    │ │  - JSONL Audit Logs   │ │  - Hit Line Breach    │
│  - Backtest: yfinance │ │  - Trend Whipsaw Filter│ │    (IID & Block Boot) │ │  - Mobile Alerts      │ │  - Strategy Decay     │
│                       │ │                       │ │  - Planted Edge Check │ │                       │ │    Tracker (>2σ)      │
│ UNIFIED DATA POOL     │ │ CORE / SLEEVE ROUTER  │ │                       │ │ BROKER CONNECTION     │ │                       │
│  - Parquet Cache      │ │  - Core (70%): Low    │ │ NO OVERFITTING        │ │  - Alpaca-Py SDK      │ │ AI REVIEW GOVERNANCE  │
│  - UTC Normalization  │ │    Turnover / Regime  │ │  - Walk-Forward (WFA) │ │  - Async WebSockets   │ │  - Human-in-the-Loop  │
│                       │ │  - Sleeves (30%): 3x  │ │  - Post-2022 Focus    │ │  - Exponential Backoff│ │  - Code Review Only   │
│ PERSISTENT STATE DB   │ │    10% Tactical Swap  │ │  - Parameter Stability│ │                       │ │  - NO Direct Deploy   │
│  - SQLite (WAL Mode)  │ │                       │ │                       │ │ SAFETY KILL-SWITCHES  │ │                       │
│  - Orders/Positions   │ │ PRE-FLIGHT CHECKS     │ │ RISK TAIL BOUNDS      │ │  - Daily Max Loss (-3%)│ │ REAL-TIME MONITORING  │
│  - Config Hashing     │ │  - Buying Power Check │ │  - Monte Carlo (Block)│ │  - Peak Drawdown (-15%)│ │  - Dashboard (HTML)   │
│                       │ │  - Market Timezone/DST│ │  - Max DD at p95 <25% │ │  - FINRA PDT Guard    │ │  - Slippage Tracking │
│                       │ │  - FINRA PDT (<$25k)  │ │                       │ │    (Count <= 3 trades)│ │                       │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

### Detailed Pillar Rules

#### A — Architecture
* **Data Persistence:** Offline historical prices stored in `data/prices.parquet`. Real-time execution cache stored in `data/live_prices.parquet`.
* **SQLite State DB:** Maintains persistent tracking of active orders, held positions, day trade counters, and execution history across bot restarts.

#### L — Logic & Pre-Flight
* **Core vs. Sleeves Execution:** Core holds 70% of portfolio value. Remaining 30% is split equally across 3 tactical sleeve slots (10% each).
* **FINRA PDT Guard (< $25,000 Equity):** Tracks round-trip day trades within 5-business-day rolling windows. If equity $< \$25,000$ and 3 day trades have occurred, intraday opening signals are automatically blocked.

#### P — Proof
* **Modern Regime Backtesting:** Parameter selection relies on post-2022 data structures to ensure robustness in current macro environments.
* **Validation Funnel:** Every strategy must pass (1) Pure Noise Test ($p < 0.05$), (2) Walk-Forward Analysis, and (3) Monte Carlo Fan-Chart ($\text{Max DD}_{p95} < 25\%$).

#### H — Harness
* **Alpaca Connector:** Direct REST/WebSocket integration via official `alpaca-py` SDK.
* **Emergency Circuit Breakers:** Disparos automáticos por perda diária ($-3\%$) ou drawdown de pico ($-15\%$), executando liquidação e cancelamento de ordens abertas.

#### A — Adapt
* **Strategy Decay & Sleeve Rotation:** Regular automated evaluations of sleeve performance. If performance falls below historical confidence intervals, the sleeve is retired and swapped.

---

## 6. REPOSITORY CONFIGURATION & STRUCTURE

### `config/system.yaml`
```yaml
core_weight: 0.70
sleeve_weight: 0.30
num_sleeves: 3
sleeve_slot_size: 0.10
engine: QQQ
safe_asset: BIL
cash: BIL
line_length: 200
starting_money: 100000
transaction_cost: 0.0005
pdt_guard_enabled: true
min_equity_pdt: 25000
```