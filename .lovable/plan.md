

# Full FMP Integration + Stock Comparison + Collapsible Company Profile

## What This Plan Covers

Two new user requests on top of the previously approved 8-step FMP integration:
- **Stock Comparison page**: Pick 2-4 tickers and compare their key metrics side-by-side using live FMP data
- **Collapsible Company Detail**: Reorganize CompanyDetail.tsx so dense sections (Supply Chain, Competitive Position, Valuation, Risk) are collapsed behind simple toggle buttons instead of all showing at once

Plus all 8 steps from the approved plan (service layer, analyst data, ownership, congressional trades, transcripts, expanded calendar, ticker search, live valuation).

---

## Implementation Steps

### Step 1: Extend FMP Service Layer
Add ~14 new fetch functions and TypeScript interfaces to `src/services/fmpService.ts`, plus matching React Query hooks in `src/hooks/useFMPData.ts`.

New endpoints: `/analyst-estimates`, `/price-target-consensus`, `/analyst-stock-recommendations`, `/dcf`, `/institutional-holder`, `/mutual-fund-holder`, `/senate-latest`, `/house-latest`, `/insider-trading/statistics`, `/earning-call-transcript`, `/ipo-calendar`, `/dividend-calendar`, `/stock-split-calendar`, `/search`.

All use the existing `fmpGeneric` passthrough -- no changes to the edge function needed.

### Step 2: Collapsible Company Detail Page
Refactor `CompanyDetail.tsx` to wrap each major section in a Collapsible (from Radix, already installed). The page will show:
- Price + key metrics cards: always visible at top
- 30-Day Price Chart: always visible
- **"Supply Chain"** button -- expands to show Suppliers/Customers cards
- **"Competitive Position"** button -- expands CompetitivePosition component
- **"M&A Valuation"** button -- expands ValuationBreakdown component
- **"Analyst & DCF"** button -- expands new analyst consensus, price targets, and FMP DCF cards
- **"Ownership"** button -- expands institutional holders, mutual fund holders, insider stats
- **"Risk Score"** button -- expands risk card

Each button shows a chevron icon and the section title. Uses `@radix-ui/react-collapsible` which is already in the project.

### Step 3: Analyst Consensus + DCF Cards (inside Company Detail)
New cards rendered inside the "Analyst & DCF" collapsible:
- Analyst Recommendations: buy/hold/sell bar from `/analyst-stock-recommendations`
- Price Target Consensus: high/low/median from `/price-target-consensus`
- FMP DCF Fair Value: intrinsic value vs current price from `/dcf`
- Forward Estimates: next-year revenue/EPS from `/analyst-estimates`

### Step 4: Institutional Ownership Section (inside Company Detail)
Inside the "Ownership" collapsible:
- Top 10 institutional holders table from `/institutional-holder`
- Top 10 mutual fund holders from `/mutual-fund-holder`
- Insider trade statistics summary from `/insider-trading/statistics`

### Step 5: Congressional Trading on News Page
Add a new tab on `News.tsx` showing Senate and House trades from `/senate-latest` and `/house-latest`.

### Step 6: Earnings Transcripts in Research Chat
Add `get_earnings_transcript` tool to `supabase/functions/ai-research/index.ts` that calls `/earning-call-transcript`.

### Step 7: Expanded Calendar Events
Extend `DashboardLayout.tsx` calendar sidebar to show IPOs, dividends, and stock splits with color-coded event types.

### Step 8: Ticker Search Bar
Add debounced search input in the dashboard header using FMP `/search` endpoint. Results link to `/company/:id`.

### Step 9: Stock Comparison Page
New page at `/compare` accessible from the navigation sidebar.

**How it works:**
- User picks 2-4 tickers from a multi-select dropdown (populated from the watchlist + FMP search)
- Fetches live FMP data for all selected tickers in parallel
- Displays a side-by-side comparison table with rows for: Price, Change %, Market Cap, Revenue, Earnings, Gross Margin, P/E, EV/EBITDA, Debt, Cash, DCF Fair Value, Analyst Consensus
- Overlaid 30-day price chart (normalized to %) showing all selected tickers on one chart with different colors
- All data from FMP API, no hardcoded values

**Files:**
- New: `src/pages/StockComparison.tsx`
- Modified: `src/App.tsx` (add route), `src/components/DashboardLayout.tsx` (add nav link)

### Step 10: Wire Live Data into ValuationBreakdown
Update `ValuationBreakdown.tsx` to accept live FMP financial statement data instead of relying solely on `src/data/valuation.ts`. Add an "FMP DCF" row showing the API's pre-computed fair value. Keep mock data as fallback.

---

## Technical Details

### Files Created
- `src/pages/StockComparison.tsx` -- new comparison page

### Files Modified
- `src/services/fmpService.ts` -- ~14 new interfaces + fetch functions
- `src/hooks/useFMPData.ts` -- ~14 new hooks
- `src/pages/CompanyDetail.tsx` -- collapsible sections + analyst/ownership cards
- `src/pages/News.tsx` -- congressional trades tab
- `src/components/DashboardLayout.tsx` -- search bar, calendar expansion, comparison nav link
- `src/components/ValuationBreakdown.tsx` -- live data wiring
- `src/App.tsx` -- `/compare` route
- `supabase/functions/ai-research/index.ts` -- transcript tool

### No Hardcoded Data
Every new number flows through `fmp-proxy` edge function. Mock data in `companies.ts` and `valuation.ts` remains only as fallback when API returns null/error. All displays show Live/Mock indicator.

