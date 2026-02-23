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

// Local browser cache
const localCache = new Map<string, { data: Record<string, FMPCompanyData>; ts: number }>();
const LOCAL_CACHE_TTL = 3 * 60 * 1000;

export async function fetchFMPData(
  tickers: string[],
  endpoints?: string[]
): Promise<Record<string, FMPCompanyData>> {
  const cacheKey = tickers.sort().join(",") + "|" + (endpoints || []).join(",");
  const cached = localCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < LOCAL_CACHE_TTL) {
    return cached.data;
  }

  const { data, error } = await supabase.functions.invoke("fmp-proxy", {
    body: { tickers, endpoints },
  });

  if (error) {
    console.error("FMP fetch error:", error);
    throw error;
  }

  localCache.set(cacheKey, { data, ts: Date.now() });
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
