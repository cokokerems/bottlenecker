import { supabase } from "@/integrations/supabase/client";

export interface FMPQuote {
  symbol: string;
  price: number;
  change: number;
  changePercentage: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  previousClose: number;
  yearHigh: number;
  yearLow: number;
}

export interface FMPProfile {
  symbol: string;
  companyName: string;
  description: string;
  sector: string;
  industry: string;
  mktCap: number;
}

export interface FMPIncomeStatement {
  revenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  netIncome: number;
  ebitda: number;
  operatingIncome: number;
  depreciationAndAmortization: number;
}

export interface FMPBalanceSheet {
  totalDebt: number;
  cashAndCashEquivalents: number;
  totalStockholdersEquity: number;
  minorityInterest: number;
  preferredStock: number;
}

export interface FMPKeyMetrics {
  enterpriseValue: number;
  peRatio: number;
  freeCashFlowPerShare: number;
  revenuePerShare: number;
}

export interface FMPCompanyData {
  quote?: FMPQuote;
  profile?: FMPProfile;
  "income-statement"?: FMPIncomeStatement;
  "balance-sheet-statement"?: FMPBalanceSheet;
  "key-metrics"?: FMPKeyMetrics;
}

export interface FMPStockNews {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
  sentiment?: string;
  sentimentScore?: number;
}

export interface FMPInsiderTrade {
  symbol: string;
  transactionDate: string;
  reportingName: string;
  typeOfOwner: string;
  transactionType: string;
  securitiesTransacted: number;
  price: number;
  link: string;
}

export interface FMPEarningsCalendarEvent {
  date: string;
  symbol: string;
  eps: number | null;
  epsEstimated: number | null;
  revenue: number | null;
  revenueEstimated: number | null;
  fiscalDateEnding: string;
}

export interface FMPSectorPerformance {
  sector: string;
  changesPercentage: string;
}

export interface FMPHistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── Local browser cache ──
const localCache = new Map<string, { data: unknown; ts: number }>();
const LOCAL_CACHE_TTL = 3 * 60 * 1000;

function getCachedLocal<T>(key: string): T | null {
  const entry = localCache.get(key);
  if (entry && Date.now() - entry.ts < LOCAL_CACHE_TTL) return entry.data as T;
  localCache.delete(key);
  return null;
}

function setCacheLocal(key: string, data: unknown) {
  localCache.set(key, { data, ts: Date.now() });
}

// ── Generic FMP passthrough ──
async function fmpGeneric<T>(path: string, params: Record<string, string> = {}, v3 = false): Promise<T> {
  const cacheKey = `generic:${v3 ? "v3:" : ""}${path}|${JSON.stringify(params)}`;
  const cached = getCachedLocal<T>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke("fmp-proxy", {
    body: { path, params, v3 },
  });

  if (error) {
    console.error("FMP generic fetch error:", error);
    throw error;
  }

  setCacheLocal(cacheKey, data);
  return data as T;
}

// ── Batch ticker/endpoint fetch (original) ──
export async function fetchFMPData(
  tickers: string[],
  endpoints?: string[]
): Promise<Record<string, FMPCompanyData>> {
  const cacheKey = tickers.sort().join(",") + "|" + (endpoints || []).join(",");
  const cached = getCachedLocal<Record<string, FMPCompanyData>>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke("fmp-proxy", {
    body: { tickers, endpoints },
  });

  if (error) {
    console.error("FMP fetch error:", error);
    throw error;
  }

  setCacheLocal(cacheKey, data);
  return data as Record<string, FMPCompanyData>;
}

export async function fetchQuotes(tickers: string[]): Promise<Record<string, FMPQuote>> {
  const result = await fetchFMPData(tickers, ["quote"]);
  const quotes: Record<string, FMPQuote> = {};
  for (const [symbol, data] of Object.entries(result)) {
    if (data.quote) quotes[symbol] = data.quote as FMPQuote;
  }
  return quotes;
}

export async function fetchFullCompanyData(ticker: string): Promise<FMPCompanyData> {
  const result = await fetchFMPData(
    [ticker],
    ["quote", "profile", "income-statement", "balance-sheet-statement", "key-metrics"]
  );
  return result[ticker] || {};
}

// ── New endpoints ──

export async function fetchStockNews(tickers?: string[], limit = 20): Promise<FMPStockNews[]> {
  const params: Record<string, string> = { limit: String(limit), page: "0" };
  if (tickers && tickers.length > 0) {
    params.tickers = tickers.join(",");
  }
  return fmpGeneric<FMPStockNews[]>("/news/stock-latest", params);
}

export async function fetchInsiderTrades(limit = 20): Promise<FMPInsiderTrade[]> {
  return fmpGeneric<FMPInsiderTrade[]>("/insider-trading/latest", { limit: String(limit) });
}

export async function fetchEarningsCalendar(from: string, to: string): Promise<FMPEarningsCalendarEvent[]> {
  return fmpGeneric<FMPEarningsCalendarEvent[]>("/earnings-calendar", { from, to });
}

export async function fetchSectorPerformance(): Promise<FMPSectorPerformance[]> {
  return fmpGeneric<FMPSectorPerformance[]>("/sector-performance", {}, true);
}

export async function fetchHistoricalPrices(ticker: string, from: string, to: string): Promise<FMPHistoricalPrice[]> {
  return fmpGeneric<FMPHistoricalPrice[]>("/historical-price-eod/full", {
    symbol: ticker,
    from,
    to,
  });
}
