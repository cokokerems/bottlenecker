

# Add Market Indices Banner to Dashboard

## What Changes
Add a row of three index/ETF cards at the very top of the dashboard showing live prices and percentage changes.

## Tickers and Labels
- **QQQ** -- "Invesco QQQ Trust, Series 1"
- **SPY** -- "SPDR S&P 500 ETF"
- **DIA** -- "SPDR Dow Jones ETF"

## File Modified: `src/pages/Index.tsx`

1. Define the index tickers as a constant array and merge them with the existing watchlist tickers in the `useFMPQuotes` call so everything fetches in one query
2. Insert a new 3-column grid row above Sector Performance with one card per index showing:
   - Ticker + full name (e.g. "QQQ -- Invesco QQQ Trust, Series 1")
   - Live price in large mono font
   - Color-coded percentage change with arrow icon
3. Show a skeleton/pulse state while data is loading

## Layout

```text
[ QQQ                 ] [ SPY                ] [ DIA                 ]
[ Invesco QQQ Trust   ] [ SPDR S&P 500 ETF   ] [ SPDR Dow Jones ETF  ]
[ $523.45   +1.24%    ] [ $598.12   -0.31%   ] [ $425.80   +0.52%   ]

[ Sector Performance cards... ]
[ Watchlist + Alerts grid...  ]
```

## No New Files
All changes in `src/pages/Index.tsx`. Reuses existing `useFMPQuotes` hook and `getLivePrice`/`getLiveChange` helpers.

