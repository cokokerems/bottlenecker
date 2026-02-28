import { supabase } from "@/integrations/supabase/client";

// ── Interfaces ──

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

export interface FMPCashFlowStatement {
  capitalExpenditure: number;
  changeInWorkingCapital: number;
  freeCashFlow: number;
  operatingCashFlow: number;
}

export interface FMPCompanyData {
  quote?: FMPQuote;
  profile?: FMPProfile;
  "income-statement"?: FMPIncomeStatement;
  "balance-sheet-statement"?: FMPBalanceSheet;
  "cash-flow-statement"?: FMPCashFlowStatement;
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

// ── New interfaces for Steps 2-10 ──

export interface FMPAnalystEstimate {
  symbol: string;
  date: string;
  estimatedRevenueAvg: number;
  estimatedRevenueLow: number;
  estimatedRevenueHigh: number;
  estimatedEbitdaAvg: number;
  estimatedEpsAvg: number;
  estimatedEpsLow: number;
  estimatedEpsHigh: number;
  numberAnalystEstimatedRevenue: number;
  numberAnalystsEstimatedEps: number;
}

export interface FMPPriceTargetConsensus {
  symbol: string;
  targetHigh: number;
  targetLow: number;
  targetMedian: number;
  targetConsensus: number;
}

export interface FMPAnalystRecommendation {
  symbol: string;
  date: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  consensus: string;
}

export interface FMPDcf {
  symbol: string;
  date: string;
  dcf: number;
  "Stock Price": number;
}

export interface FMPInstitutionalHolder {
  holder: string;
  shares: number;
  dateReported: string;
  change: number;
  value: number;
}

export interface FMPMutualFundHolder {
  holder: string;
  shares: number;
  dateReported: string;
  change: number;
  weightedAvgPrice: number;
}

export interface FMPCongressionalTrade {
  firstName: string;
  lastName: string;
  office: string;
  transactionDate: string;
  ticker: string;
  assetDescription: string;
  amount: string;
  type: string;
  link: string;
}

export interface FMPInsiderTradingStats {
  symbol: string;
  year: number;
  quarter: number;
  purchases: number;
  sales: number;
  buySellRatio: number;
  totalBought: number;
  totalSold: number;
  averageBought: number;
  averageSold: number;
}

export interface FMPEarningsTranscript {
  symbol: string;
  quarter: number;
  year: number;
  date: string;
  content: string;
}

export interface FMPIpoCalendarEvent {
  date: string;
  company: string;
  symbol: string;
  exchange: string;
  actions: string;
  shares: number;
  priceRange: string;
  marketCap: number;
}

export interface FMPDividendCalendarEvent {
  date: string;
  label: string;
  symbol: string;
  dividend: number;
  adjDividend: number;
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
}

export interface FMPStockSplitCalendarEvent {
  date: string;
  label: string;
  symbol: string;
  numerator: number;
  denominator: number;
}

export interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
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

// ── Paths that should NEVER use the local in-memory cache ──
// React Query already caches these; the extra Map layer makes refresh unreliable.
const NO_LOCAL_CACHE_PATHS = new Set([
  "/news/stock-latest",
  "/news/general-latest",
  "/insider-trading/latest",
  "/senate-latest",
  "/house-latest",
]);

// ── Generic FMP passthrough ──
interface FmpGenericOptions {
  v3?: boolean;
  noCache?: boolean;
}

let forceNoCacheUntil = 0;

export function forceBypassFmpCache(durationMs = 10_000) {
  forceNoCacheUntil = Date.now() + durationMs;
}

async function fmpGeneric<T>(
  path: string,
  params: Record<string, string> = {},
  options: FmpGenericOptions = {}
): Promise<T> {
  const { v3 = false, noCache = false } = options;
  const shouldBypassCache = noCache || Date.now() < forceNoCacheUntil;
  const skipLocalCache = NO_LOCAL_CACHE_PATHS.has(path) || shouldBypassCache;
  const cacheKey = `generic:${v3 ? "v3:" : ""}${path}|${JSON.stringify(params)}`;

  if (!skipLocalCache) {
    const cached = getCachedLocal<T>(cacheKey);
    if (cached) return cached;
  }

  const { data, error } = await supabase.functions.invoke("fmp-proxy", {
    body: { path, params, v3, noCache: shouldBypassCache },
  });

  if (error) {
    console.error("FMP generic fetch error:", error);
    throw error;
  }

  if (!skipLocalCache) {
    setCacheLocal(cacheKey, data);
  }

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
    ["quote", "profile", "income-statement", "balance-sheet-statement", "cash-flow-statement", "key-metrics"]
  );
  return result[ticker] || {};
}

export async function fetchBatchSparklines(tickers: string[]): Promise<Record<string, number[]>> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const from = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(thirtyDaysAgo.getDate()).padStart(2, "0")}`;
  const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const results: Record<string, number[]> = {};

  const batchSize = 5;
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const promises = batch.map(async (ticker) => {
      try {
        const prices = await fetchHistoricalPrices(ticker, from, to);
        if (prices && prices.length > 0) {
          results[ticker] = [...prices]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((p) => p.close);
        }
      } catch {
        // Skip failures silently
      }
    });
    await Promise.all(promises);
  }

  return results;
}

// ── Existing endpoints ──

export async function fetchStockNews(tickers?: string[], limit = 20): Promise<FMPStockNews[]> {
  const params: Record<string, string> = { limit: String(limit), page: "0" };
  if (tickers && tickers.length > 0) {
    params.tickers = tickers.join(",");
  }
  return fmpGeneric<FMPStockNews[]>("/news/stock-latest", params);
}

export async function fetchGeneralNews(limit = 20): Promise<FMPStockNews[]> {
  const data = await fmpGeneric<FMPStockNews[]>(
    "/news/general-latest",
    { limit: String(limit), page: "0" }
  );
  return Array.isArray(data) ? data : [];
}

export async function fetchInsiderTrades(limit = 20): Promise<FMPInsiderTrade[]> {
  return fmpGeneric<FMPInsiderTrade[]>("/insider-trading/latest", { limit: String(limit) });
}

export async function fetchEarningsCalendar(from: string, to: string): Promise<FMPEarningsCalendarEvent[]> {
  return fmpGeneric<FMPEarningsCalendarEvent[]>("/earnings-calendar", { from, to });
}

export async function fetchSectorPerformance(): Promise<FMPSectorPerformance[]> {
  return fmpGeneric<FMPSectorPerformance[]>("/sector-performance", {}, { v3: true });
}

export async function fetchHistoricalPrices(ticker: string, from: string, to: string): Promise<FMPHistoricalPrice[]> {
  return fmpGeneric<FMPHistoricalPrice[]>("/historical-price-eod/full", {
    symbol: ticker,
    from,
    to,
  });
}

// ── New endpoints ──

export async function fetchAnalystEstimates(ticker: string): Promise<FMPAnalystEstimate[]> {
  return fmpGeneric<FMPAnalystEstimate[]>("/analyst-estimates", { symbol: ticker, limit: "2" });
}

export async function fetchPriceTargetConsensus(ticker: string): Promise<FMPPriceTargetConsensus> {
  const data = await fmpGeneric<FMPPriceTargetConsensus[]>("/price-target-consensus", { symbol: ticker });
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchAnalystRecommendations(ticker: string): Promise<FMPAnalystRecommendation[]> {
  return fmpGeneric<FMPAnalystRecommendation[]>("/analyst-stock-recommendations", { symbol: ticker, limit: "1" });
}

export async function fetchDcf(ticker: string): Promise<FMPDcf> {
  const data = await fmpGeneric<FMPDcf[]>("/dcf", { symbol: ticker });
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchInstitutionalHolders(ticker: string): Promise<FMPInstitutionalHolder[]> {
  return fmpGeneric<FMPInstitutionalHolder[]>("/institutional-holder", { symbol: ticker });
}

export async function fetchMutualFundHolders(ticker: string): Promise<FMPMutualFundHolder[]> {
  return fmpGeneric<FMPMutualFundHolder[]>("/mutual-fund-holder", { symbol: ticker });
}

export async function fetchSenateTrades(limit = 20): Promise<FMPCongressionalTrade[]> {
  return fmpGeneric<FMPCongressionalTrade[]>("/senate-latest", { limit: String(limit) });
}

export async function fetchHouseTrades(limit = 20): Promise<FMPCongressionalTrade[]> {
  return fmpGeneric<FMPCongressionalTrade[]>("/house-latest", { limit: String(limit) });
}

export async function fetchInsiderTradingStats(ticker: string): Promise<FMPInsiderTradingStats[]> {
  return fmpGeneric<FMPInsiderTradingStats[]>("/insider-trading/statistics", { symbol: ticker });
}

export async function fetchEarningsTranscript(ticker: string, year: number, quarter: number): Promise<FMPEarningsTranscript[]> {
  return fmpGeneric<FMPEarningsTranscript[]>("/earning-call-transcript", {
    symbol: ticker,
    year: String(year),
    quarter: String(quarter),
  });
}

export async function fetchIpoCalendar(from: string, to: string): Promise<FMPIpoCalendarEvent[]> {
  return fmpGeneric<FMPIpoCalendarEvent[]>("/ipo-calendar", { from, to });
}

export async function fetchDividendCalendar(from: string, to: string): Promise<FMPDividendCalendarEvent[]> {
  return fmpGeneric<FMPDividendCalendarEvent[]>("/dividend-calendar", { from, to });
}

export async function fetchStockSplitCalendar(from: string, to: string): Promise<FMPStockSplitCalendarEvent[]> {
  return fmpGeneric<FMPStockSplitCalendarEvent[]>("/stock-split-calendar", { from, to });
}

export async function fetchTickerSearch(query: string, limit = 10): Promise<FMPSearchResult[]> {
  return fmpGeneric<FMPSearchResult[]>("/search", { query, limit: String(limit) });
}
