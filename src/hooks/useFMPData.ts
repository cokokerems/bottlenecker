import { useQuery } from "@tanstack/react-query";
import {
  fetchQuotes,
  fetchFullCompanyData,
  fetchStockNews,
  fetchInsiderTrades,
  fetchEarningsCalendar,
  fetchSectorPerformance,
  fetchHistoricalPrices,
  fetchAnalystEstimates,
  fetchPriceTargetConsensus,
  fetchAnalystRecommendations,
  fetchDcf,
  fetchInstitutionalHolders,
  fetchMutualFundHolders,
  fetchSenateTrades,
  fetchHouseTrades,
  fetchInsiderTradingStats,
  fetchEarningsTranscript,
  fetchIpoCalendar,
  fetchDividendCalendar,
  fetchStockSplitCalendar,
  fetchTickerSearch,
  type FMPQuote,
  type FMPCompanyData,
  type FMPStockNews,
  type FMPInsiderTrade,
  type FMPEarningsCalendarEvent,
  type FMPSectorPerformance,
  type FMPHistoricalPrice,
  type FMPAnalystEstimate,
  type FMPPriceTargetConsensus,
  type FMPAnalystRecommendation,
  type FMPDcf,
  type FMPInstitutionalHolder,
  type FMPMutualFundHolder,
  type FMPCongressionalTrade,
  type FMPInsiderTradingStats,
  type FMPEarningsTranscript,
  type FMPIpoCalendarEvent,
  type FMPDividendCalendarEvent,
  type FMPStockSplitCalendarEvent,
  type FMPSearchResult,
} from "@/services/fmpService";

export function useFMPQuotes(tickers: string[]) {
  return useQuery<Record<string, FMPQuote>>({
    queryKey: ["fmp-quotes", ...tickers],
    queryFn: () => fetchQuotes(tickers),
    staleTime: 2 * 60 * 1000,
    enabled: tickers.length > 0,
    retry: 1,
  });
}

export function useFMPCompanyData(ticker: string) {
  return useQuery<FMPCompanyData>({
    queryKey: ["fmp-company", ticker],
    queryFn: () => fetchFullCompanyData(ticker),
    staleTime: 5 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });
}

export function useFMPStockNews(tickers?: string[], limit = 20) {
  return useQuery<FMPStockNews[]>({
    queryKey: ["fmp-stock-news", tickers, limit],
    queryFn: () => fetchStockNews(tickers, limit),
    staleTime: 3 * 60 * 1000,
    retry: 1,
  });
}

export function useFMPInsiderTrades(limit = 20) {
  return useQuery<FMPInsiderTrade[]>({
    queryKey: ["fmp-insider-trades", limit],
    queryFn: () => fetchInsiderTrades(limit),
    staleTime: 3 * 60 * 1000,
    retry: 1,
  });
}

export function useFMPEarningsCalendar(from: string, to: string) {
  return useQuery<FMPEarningsCalendarEvent[]>({
    queryKey: ["fmp-earnings-calendar", from, to],
    queryFn: () => fetchEarningsCalendar(from, to),
    staleTime: 10 * 60 * 1000,
    enabled: !!from && !!to,
    retry: 1,
  });
}

export function useFMPSectorPerformance() {
  return useQuery<FMPSectorPerformance[]>({
    queryKey: ["fmp-sector-performance"],
    queryFn: () => fetchSectorPerformance(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useFMPHistoricalPrices(ticker: string, from: string, to: string) {
  return useQuery<FMPHistoricalPrice[]>({
    queryKey: ["fmp-historical", ticker, from, to],
    queryFn: () => fetchHistoricalPrices(ticker, from, to),
    staleTime: 10 * 60 * 1000,
    enabled: !!ticker && !!from && !!to,
    retry: 1,
  });
}

// ── New hooks ──

export function useFMPAnalystEstimates(ticker: string) {
  return useQuery<FMPAnalystEstimate[]>({
    queryKey: ["fmp-analyst-estimates", ticker],
    queryFn: () => fetchAnalystEstimates(ticker),
    staleTime: 10 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });
}

export function useFMPPriceTargetConsensus(ticker: string) {
  return useQuery<FMPPriceTargetConsensus>({
    queryKey: ["fmp-price-target", ticker],
    queryFn: () => fetchPriceTargetConsensus(ticker),
    staleTime: 10 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });
}

export function useFMPAnalystRecommendations(ticker: string) {
  return useQuery<FMPAnalystRecommendation[]>({
    queryKey: ["fmp-analyst-rec", ticker],
    queryFn: () => fetchAnalystRecommendations(ticker),
    staleTime: 10 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });
}

export function useFMPDcf(ticker: string) {
  return useQuery<FMPDcf>({
    queryKey: ["fmp-dcf", ticker],
    queryFn: () => fetchDcf(ticker),
    staleTime: 10 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });
}

export function useFMPInstitutionalHolders(ticker: string) {
  return useQuery<FMPInstitutionalHolder[]>({
    queryKey: ["fmp-inst-holders", ticker],
    queryFn: () => fetchInstitutionalHolders(ticker),
    staleTime: 10 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });
}

export function useFMPMutualFundHolders(ticker: string) {
  return useQuery<FMPMutualFundHolder[]>({
    queryKey: ["fmp-mf-holders", ticker],
    queryFn: () => fetchMutualFundHolders(ticker),
    staleTime: 10 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });
}

export function useFMPSenateTrades(limit = 20) {
  return useQuery<FMPCongressionalTrade[]>({
    queryKey: ["fmp-senate-trades", limit],
    queryFn: () => fetchSenateTrades(limit),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useFMPHouseTrades(limit = 20) {
  return useQuery<FMPCongressionalTrade[]>({
    queryKey: ["fmp-house-trades", limit],
    queryFn: () => fetchHouseTrades(limit),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useFMPInsiderTradingStats(ticker: string) {
  return useQuery<FMPInsiderTradingStats[]>({
    queryKey: ["fmp-insider-stats", ticker],
    queryFn: () => fetchInsiderTradingStats(ticker),
    staleTime: 10 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });
}

export function useFMPEarningsTranscript(ticker: string, year: number, quarter: number) {
  return useQuery<FMPEarningsTranscript[]>({
    queryKey: ["fmp-transcript", ticker, year, quarter],
    queryFn: () => fetchEarningsTranscript(ticker, year, quarter),
    staleTime: 30 * 60 * 1000,
    enabled: !!ticker && !!year && !!quarter,
    retry: 1,
  });
}

export function useFMPIpoCalendar(from: string, to: string) {
  return useQuery<FMPIpoCalendarEvent[]>({
    queryKey: ["fmp-ipo-calendar", from, to],
    queryFn: () => fetchIpoCalendar(from, to),
    staleTime: 10 * 60 * 1000,
    enabled: !!from && !!to,
    retry: 1,
  });
}

export function useFMPDividendCalendar(from: string, to: string) {
  return useQuery<FMPDividendCalendarEvent[]>({
    queryKey: ["fmp-dividend-calendar", from, to],
    queryFn: () => fetchDividendCalendar(from, to),
    staleTime: 10 * 60 * 1000,
    enabled: !!from && !!to,
    retry: 1,
  });
}

export function useFMPStockSplitCalendar(from: string, to: string) {
  return useQuery<FMPStockSplitCalendarEvent[]>({
    queryKey: ["fmp-split-calendar", from, to],
    queryFn: () => fetchStockSplitCalendar(from, to),
    staleTime: 10 * 60 * 1000,
    enabled: !!from && !!to,
    retry: 1,
  });
}

export function useFMPTickerSearch(query: string, limit = 10) {
  return useQuery<FMPSearchResult[]>({
    queryKey: ["fmp-search", query, limit],
    queryFn: () => fetchTickerSearch(query, limit),
    staleTime: 5 * 60 * 1000,
    enabled: query.length >= 1,
    retry: 1,
  });
}
