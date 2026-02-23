import { useQuery } from "@tanstack/react-query";
import { fetchQuotes, fetchFullCompanyData, type FMPQuote, type FMPCompanyData } from "@/services/fmpService";

/**
 * Hook to fetch real-time quotes for multiple tickers
 */
export function useFMPQuotes(tickers: string[]) {
  return useQuery<Record<string, FMPQuote>>({
    queryKey: ["fmp-quotes", ...tickers],
    queryFn: () => fetchQuotes(tickers),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: tickers.length > 0,
    retry: 1,
  });
}

/**
 * Hook to fetch full financial data for a single company
 */
export function useFMPCompanyData(ticker: string) {
  return useQuery<FMPCompanyData>({
    queryKey: ["fmp-company", ticker],
    queryFn: () => fetchFullCompanyData(ticker),
    staleTime: 5 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });
}
