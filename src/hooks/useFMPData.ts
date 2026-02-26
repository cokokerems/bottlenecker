import { useQuery } from "@tanstack/react-query";
import {
  fetchQuotes,
  fetchFullCompanyData,
  fetchStockNews,
  fetchInsiderTrades,
  fetchEarningsCalendar,
  fetchSectorPerformance,
  fetchHistoricalPrices,
  type FMPQuote,
  type FMPCompanyData,
  type FMPStockNews,
  type FMPInsiderTrade,
  type FMPEarningsCalendarEvent,
  type FMPSectorPerformance,
  type FMPHistoricalPrice,
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
