import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FMP_BASE_STABLE = "https://financialmodelingprep.com/stable";
const FMP_BASE_V3 = "https://financialmodelingprep.com/api/v3";
const CONCURRENCY = 3;

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

async function fmpFetch(path: string, params: Record<string, string>, apiKey: string, useV3 = false): Promise<unknown> {
  const cacheKey = (useV3 ? "v3:" : "") + path + JSON.stringify(params);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const base = useV3 ? FMP_BASE_V3 : FMP_BASE_STABLE;
  const searchParams = new URLSearchParams({ ...params, apikey: apiKey });
  const url = `${base}${path}?${searchParams}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    console.error(`FMP ${res.status} for ${path}: ${body.slice(0, 200)}`);
    return null;
  }
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
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
    const body = await req.json();

    // ── Mode 1: Generic passthrough (path + params) ──
    if (body.path) {
      const params: Record<string, string> = body.params || {};
      const useV3 = body.v3 === true;
      const data = await fmpFetch(body.path, params, apiKey, useV3);
      return new Response(JSON.stringify(data ?? []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Mode 2: Multi-ticker/multi-endpoint batch (original) ──
    const { tickers, endpoints } = body;

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return new Response(JSON.stringify({ error: "tickers array or path required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestedEndpoints = endpoints || ["quote"];
    const results: Record<string, Record<string, unknown>> = {};

    const tasks: (() => Promise<void>)[] = [];

    for (const endpoint of requestedEndpoints) {
      for (const ticker of tickers) {
        tasks.push(async () => {
          const params: Record<string, string> = { symbol: ticker };

          if (endpoint === "key-metrics") {
            params.period = "ttm";
          } else if (endpoint === "income-statement" || endpoint === "balance-sheet-statement" || endpoint === "cash-flow-statement") {
            params.limit = "1";
          }

          const data = await fmpFetch(`/${endpoint}`, params, apiKey);
          if (data) {
            if (!results[ticker]) results[ticker] = {};
            if (Array.isArray(data)) {
              results[ticker][endpoint] = data.length === 1 ? data[0] : data;
            } else {
              results[ticker][endpoint] = data;
            }
          }
        });
      }
    }

    await runWithConcurrency(tasks, CONCURRENCY);

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
