import { useQuery } from "@tanstack/react-query";
import { fetchEarningsCalendar, type FMPEarningsCalendarEvent } from "@/services/fmpService";

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface EarningsDates {
  next: FMPEarningsCalendarEvent | null;
  last: FMPEarningsCalendarEvent | null;
}

export function useEarningsDates(ticker: string): { data: EarningsDates | undefined; isLoading: boolean } {
  const now = new Date();
  const past = new Date(now);
  past.setMonth(past.getMonth() - 6);
  const future = new Date(now);
  future.setMonth(future.getMonth() + 6);

  const from = toDateKey(past);
  const to = toDateKey(future);

  const { data: allEvents, isLoading } = useQuery<FMPEarningsCalendarEvent[]>({
    queryKey: ["fmp-earnings-dates", ticker, from, to],
    queryFn: () => fetchEarningsCalendar(from, to),
    staleTime: 15 * 60 * 1000,
    enabled: !!ticker,
    retry: 1,
  });

  const result = allEvents
    ? (() => {
        const tickerEvents = allEvents.filter(
          (e) => e.symbol?.toUpperCase() === ticker.toUpperCase()
        );
        const today = toDateKey(now);
        const pastEvents = tickerEvents.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
        const futureEvents = tickerEvents.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
        return {
          last: pastEvents[0] || null,
          next: futureEvents[0] || null,
        };
      })()
    : undefined;

  return { data: result, isLoading };
}

/** Batch version: fetches earnings calendar once and maps per ticker */
export function useBatchEarningsDates(tickers: string[]) {
  const now = new Date();
  const future = new Date(now);
  future.setMonth(future.getMonth() + 6);
  const from = toDateKey(now);
  const to = toDateKey(future);

  const { data: allEvents, isLoading } = useQuery<FMPEarningsCalendarEvent[]>({
    queryKey: ["fmp-earnings-batch", from, to],
    queryFn: () => fetchEarningsCalendar(from, to),
    staleTime: 15 * 60 * 1000,
    enabled: tickers.length > 0,
    retry: 1,
  });

  const nextEarningsMap: Record<string, string> = {};
  if (allEvents) {
    for (const ev of allEvents) {
      if (!ev.symbol) continue;
      const sym = ev.symbol.toUpperCase();
      if (tickers.some((t) => t.toUpperCase() === sym)) {
        if (!nextEarningsMap[sym] || ev.date < nextEarningsMap[sym]) {
          nextEarningsMap[sym] = ev.date;
        }
      }
    }
  }

  return { nextEarningsMap, isLoading };
}
