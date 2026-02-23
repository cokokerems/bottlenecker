import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FMP_BASE = "https://financialmodelingprep.com/stable";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

async function fmpFetch(path: string, params: Record<string, string>, apiKey: string): Promise<unknown> {
  const cacheKey = path + JSON.stringify(params);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const searchParams = new URLSearchParams({ ...params, apikey: apiKey });
  const url = `${FMP_BASE}${path}?${searchParams}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FMP API error [${res.status}]: ${body}`);
  }
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("FMP_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "FMP_API_KEY is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { tickers, endpoints } = await req.json();

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return new Response(JSON.stringify({ error: "tickers array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestedEndpoints = endpoints || ["quote", "profile", "income-statement", "balance-sheet-statement", "key-metrics"];

    const results: Record<string, Record<string, unknown>> = {};
    const fetches: Promise<void>[] = [];

    for (const endpoint of requestedEndpoints) {
      // Stable API: use symbol query param, supports comma-separated for quote/profile
      if (endpoint === "quote" || endpoint === "profile") {
        const symbolList = tickers.join(",");
        fetches.push(
          fmpFetch(`/${endpoint}`, { symbol: symbolList }, apiKey).then((data) => {
            if (Array.isArray(data)) {
              for (const item of data) {
                const symbol = item.symbol;
                if (!results[symbol]) results[symbol] = {};
                results[symbol][endpoint] = item;
              }
            }
          })
        );
      } else if (endpoint === "income-statement" || endpoint === "balance-sheet-statement" || endpoint === "cash-flow-statement") {
        for (const ticker of tickers) {
          fetches.push(
            fmpFetch(`/${endpoint}`, { symbol: ticker, limit: "1" }, apiKey).then((data) => {
              if (!results[ticker]) results[ticker] = {};
              results[ticker][endpoint] = Array.isArray(data) ? data[0] : data;
            })
          );
        }
      } else if (endpoint === "key-metrics") {
        for (const ticker of tickers) {
          fetches.push(
            fmpFetch(`/key-metrics`, { symbol: ticker, period: "ttm" }, apiKey).then((data) => {
              if (!results[ticker]) results[ticker] = {};
              results[ticker]["key-metrics"] = Array.isArray(data) ? data[0] : data;
            })
          );
        }
      }
    }

    await Promise.all(fetches);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("FMP proxy error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
