
# Replace All Mock Data with Live FMP API Data

## Summary of Mock Data Currently in Use

| Data | Source | Used In |
|------|--------|---------|
| Company financials (revenue, earnings, margins, debt, cash, etc.) | `src/data/companies.ts` | Dashboard watchlist, CompanyDetail, ValuationBreakdown |
| Price history (sparklines) | `generatePriceHistory()` in companies.ts | Dashboard watchlist sparklines |
| Alerts | Hardcoded `alerts[]` in companies.ts | Dashboard alerts panel |
| Sector performance | `sectorPerformance` in categories.ts | Dashboard (fallback -- already has live hook but FMP returns 403 "Legacy Endpoint") |
| Competitive position (market share, moat, trend) | companies.ts `competitivePosition` field | CompetitivePosition component |
| Supply chain relationships (suppliers/customers) | companies.ts `suppliers`/`customers` arrays | CompanyDetail supply chain section, SupplyChainGraph |
| Risk scores | companies.ts `riskScore` field | CompanyDetail risk section |
| Valuation model inputs (WACC, projected FCF, exit multiples, synergies, accretion/dilution) | `src/data/valuation.ts` | ValuationBreakdown component |

## What CAN Be Replaced with Live FMP Data

### 1. Company Financial Metrics (already partially done, complete it)
- **Current state**: CompanyDetail merges live data with mock fallbacks. Dashboard watchlist uses live quotes for price/change but falls back to mock for everything else.
- **Change**: Fetch `profile`, `income-statement`, `balance-sheet-statement`, `key-metrics` for each company. Remove the hardcoded `revenue`, `earnings`, `grossMargin`, `peRatio`, `totalDebt`, `cashAndEquivalents`, `marketCap`, `currentPrice`, `priceChange` fields from companies.ts -- always use API data instead of fallback.
- **Files**: `src/data/companies.ts`, `src/pages/Index.tsx`, `src/pages/CompanyDetail.tsx`

### 2. Sparkline Price History
- **Current state**: `generatePriceHistory()` creates random data.
- **Change**: Use `fetchHistoricalPrices(ticker, from, to)` (already exists) to fetch 30-day EOD prices for each watchlist ticker. Create a new hook `useFMPSparklines(tickers)` that batch-fetches 30-day history for all tickers. Replace the sparkline data in the watchlist.
- **Files**: `src/hooks/useFMPData.ts`, `src/services/fmpService.ts` (add batch sparkline fetch), `src/pages/Index.tsx`
- **Note**: This will make ~45 extra API calls (one per ticker). With the 3000 calls/min limit this is fine, but we should cache aggressively (10-minute stale time).

### 3. Alerts -- Replace with Live Signals
- **Current state**: 5 hardcoded alerts.
- **Change**: Generate alerts dynamically from live data:
  - **Price drops**: Any watchlist stock with `changePercentage < -3%` from quotes
  - **Earnings surprises**: From FMP earnings calendar data (eps vs epsEstimated)
  - **Insider activity spikes**: From insider trading data for watchlist tickers
- **Files**: `src/pages/Index.tsx` (replace `alertData` usage with computed alerts from live quote/news data)

### 4. Valuation Inputs (Partial)
- **Current state**: `src/data/valuation.ts` has ~45 companies with hand-curated EBITDA, EBIT, D&A, capex, WACC, projected FCF, exit multiples, synergies, etc.
- **What can go live**: EBITDA, EBIT, D&A, capex, tax rate, shares outstanding -- all available from FMP `income-statement`, `balance-sheet-statement`, `cash-flow-statement`, and `key-metrics` endpoints.
- **Files**: `src/data/valuation.ts`, `src/components/ValuationBreakdown.tsx`, `src/services/fmpService.ts` (add cash-flow-statement fetch)

### 5. Sector Performance -- Fix the 403
- **Current state**: FMP returns 403 "Legacy Endpoint" for `/sector-performance`.
- **Change**: Compute sector performance ourselves. Group watchlist tickers by category, average their `changePercentage` from live quotes, and display that as "sector" performance. Remove the broken FMP sector endpoint call.
- **Files**: `src/pages/Index.tsx`, `src/data/categories.ts` (remove mock `sectorPerformance`)

## What CANNOT Be Replaced with FMP API Data

These are **strategic/qualitative assessments** that no financial data API provides:

| Data | Why It Can't Be Live |
|------|---------------------|
| **Competitive position** (monopoly/duopoly/leader, market share %, moat description, trend) | This is qualitative analyst opinion, not financial data. FMP has no equivalent endpoint. |
| **Supply chain relationships** (who supplies/buys from whom) | FMP doesn't provide supply chain mapping. This requires proprietary datasets (e.g., Bloomberg SPLC, FactSet Revere). |
| **Risk scores** | Custom composite metric -- no FMP equivalent. |
| **Valuation: WACC assumptions** (cost of equity, cost of debt, terminal growth rate) | These are modeled assumptions, not reported data. Analysts choose these. |
| **Valuation: Projected FCF** (5-year forward estimates) | FMP has analyst revenue/EPS estimates but not full projected FCF streams. |
| **Valuation: M&A-specific inputs** (offer premium, synergies, exit multiple, accretion/dilution) | These are deal-specific assumptions -- no API provides them generically. |
| **Company categories** (chip-designers, foundries, etc.) | Custom taxonomy for this app's supply chain view. |

**Recommendation**: Keep these as curated data but clearly label them as "Curated / Strategic Assessment" in the UI rather than presenting them as live data.

## Implementation Steps

### Step 1: Add cash-flow-statement endpoint
Add `fetchCashFlowStatement` to `fmpService.ts` and include it in `fetchFullCompanyData`. This gives us CapEx and change in working capital live.

### Step 2: Replace dashboard sparklines with live historical prices
Create a new service function that batch-fetches 30-day historical prices for all watchlist tickers. Add a hook and wire it into the Index page to replace `generatePriceHistory()`.

### Step 3: Compute live alerts from quote data
Replace the hardcoded `alerts` array. Derive alerts from:
- Live quote data (big movers)
- Recent stock news for watchlist tickers
Show "No alerts" if everything is calm.

### Step 4: Compute sector performance from watchlist quotes
Group tickers by category, compute average daily change per category from live quotes, and display that instead of the broken FMP sector endpoint.

### Step 5: Make ValuationBreakdown use live financials for computable fields
Pull EBITDA, EBIT, D&A, CapEx, tax rate, shares outstanding from live FMP data. Keep WACC, projected FCF, synergies, and M&A assumptions as curated inputs.

### Step 6: Clean up mock data files
- Remove `generatePriceHistory()`, remove hardcoded financial fields from companies.ts (keep only: id, name, ticker, categories, description, suppliers, customers, competitivePosition, riskScore)
- Remove mock `sectorPerformance` from categories.ts
- Remove computable fields from valuation.ts (keep only model assumptions)
- Remove hardcoded `alerts` array

## API Call Budget
With ~45 watchlist tickers and the new sparkline fetches, each dashboard load will make roughly:
- 1 batch quote call (existing)
- ~45 historical price calls (new, cached 10min)
- Total: ~50 calls per fresh load, well within the 3000/min limit
