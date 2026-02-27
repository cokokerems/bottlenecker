
Goal: make Refresh reliably produce fresh results (or clearly show when upstream has no new records) for News, Insider Trades, and Congress, and remove the “it spins but nothing changed” ambiguity.

What I found from investigation:
- The refresh button is wired and firing requests correctly.
- Manual refresh requests are reaching the backend with `noCache: true` for:
  - `/news/stock-latest`
  - `/news/general-latest`
  - `/insider-trading/latest`
  - `/senate-latest`
  - `/house-latest`
- So the current issue is not “button click not working”; it is a freshness/visibility problem caused by:
  1) layered caching behavior, and
  2) provider datasets that often remain unchanged between close refreshes.
- There is also a separate UI warning (`Badge` ref warning) that should be fixed to avoid runtime noise while testing refresh behavior.

Implementation plan:

1) Make high-velocity feeds bypass local in-memory browser cache
- File: `src/services/fmpService.ts`
- Add endpoint-level cache strategy so News/Insider/Congress fetches do not use the `localCache` Map.
- Keep local cache for slower endpoints (company fundamentals, historical, etc.).
- Why: React Query already caches; the extra local cache adds a second stale layer and makes behavior less predictable.

2) Add explicit forced-refresh token to requests
- Files: `src/services/fmpService.ts`, `src/pages/News.tsx`
- Introduce a `refreshToken` (timestamp/nonce) passed into fetchers for manual refresh.
- Include that token in request params when refreshing so every manual refresh is guaranteed to be a unique upstream request, even if providers/intermediaries behave aggressively.
- Why: this makes manual refresh deterministic and independent of implicit timing windows.

3) Replace broad `refetchQueries` with explicit `fetchQuery` for the exact active keys
- File: `src/pages/News.tsx`
- On refresh, call `queryClient.fetchQuery` (or `refetchQueries` with exact keys) for each exact key currently displayed:
  - `["fmp-stock-news", undefined, 25]`
  - `["fmp-general-news", 25]`
  - `["fmp-insider-trades", 15]`
  - `["fmp-senate-trades", 15]`
  - `["fmp-house-trades", 15]`
- Why: removes ambiguity with partial-key matching and guarantees the exact datasets on screen are fetched now.

4) Add freshness UX so users can see refresh succeeded even when content is unchanged
- File: `src/pages/News.tsx`
- Add:
  - “Last refreshed: HH:MM:SS”
  - “No new items since last refresh” OR “X new items”
- Compute diff by stable IDs:
  - News: prefer `url`, fallback `title + publishedDate`
  - Insider/Congress: use `link + transactionDate + symbol/ticker`
- Why: if provider has no new rows, user still gets clear success feedback instead of assuming refresh is broken.

5) Tighten backend cache policy for live feeds (optional but recommended)
- File: `supabase/functions/fmp-proxy/index.ts`
- Move from one global TTL to per-endpoint TTL:
  - news/insider/senate/house: very short TTL (e.g., 30–60s) or no cache
  - slower endpoints keep longer TTL
- Keep manual `noCache` path as hard bypass.
- Why: improves background auto-refresh realism without overloading the API.

6) Fix the Badge ref warning (separate but quick cleanup)
- File: `src/components/ui/badge.tsx`
- Convert `Badge` to `React.forwardRef` (matching other UI primitives).
- Why: removes console warnings that can hide real debugging signals.

Validation plan (end-to-end):
1. Open `/news`, note top 3 entries in each panel.
2. Click Refresh once.
3. Confirm:
   - spinner shows,
   - “Last refreshed” time updates,
   - request bodies show forced refresh token/no-cache,
   - diff message appears (“X new” or “No new items”).
4. Repeat after ~2–3 minutes to verify auto-refresh + manual refresh both work.
5. Validate all three areas independently:
   - Latest News list
   - Insider Trades tab
   - Congress tab
6. Confirm no `Badge` ref warning in console.

Technical notes / trade-offs:
- If upstream source hasn’t published new records, identical data is expected and correct.
- The fix therefore targets both actual freshness guarantees and user-visible proof of a successful refresh.
- This avoids false “broken refresh” reports while keeping API usage controlled.

Files planned for changes:
- `src/services/fmpService.ts`
- `src/pages/News.tsx`
- `supabase/functions/fmp-proxy/index.ts`
- `src/components/ui/badge.tsx`
