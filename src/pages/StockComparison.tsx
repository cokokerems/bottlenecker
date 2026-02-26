import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Loader2, Plus, GitCompareArrows } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { companies } from "@/data/companies";
import { useFMPQuotes, useFMPHistoricalPrices, useFMPTickerSearch } from "@/hooks/useFMPData";
import { fetchFullCompanyData, fetchDcf, type FMPCompanyData, type FMPDcf } from "@/services/fmpService";
import { useQueries } from "@tanstack/react-query";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtB(v: number | undefined | null): string {
  if (v == null || isNaN(v)) return "—";
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toFixed(0)}`;
}

export default function StockComparison() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: searchResults } = useFMPTickerSearch(searchInput, 8);

  // Fetch full data for each selected ticker
  const companyQueries = useQueries({
    queries: selectedTickers.map((ticker) => ({
      queryKey: ["fmp-company", ticker],
      queryFn: () => fetchFullCompanyData(ticker),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  });

  const dcfQueries = useQueries({
    queries: selectedTickers.map((ticker) => ({
      queryKey: ["fmp-dcf", ticker],
      queryFn: () => fetchDcf(ticker),
      staleTime: 10 * 60 * 1000,
      retry: 1,
    })),
  });

  // Historical for chart
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = toDateKey(thirtyDaysAgo);
  const toDate = toDateKey(now);

  const histQueries = useQueries({
    queries: selectedTickers.map((ticker) => ({
      queryKey: ["fmp-historical", ticker, fromDate, toDate],
      queryFn: async () => {
        const { fetchHistoricalPrices } = await import("@/services/fmpService");
        return fetchHistoricalPrices(ticker, fromDate, toDate);
      },
      staleTime: 10 * 60 * 1000,
      retry: 1,
    })),
  });

  const isLoading = companyQueries.some((q) => q.isLoading);

  // Build normalized chart data
  const chartData = useMemo(() => {
    const allDates = new Set<string>();
    const tickerPrices: Record<string, Record<string, number>> = {};

    histQueries.forEach((q, i) => {
      const ticker = selectedTickers[i];
      if (!q.data) return;
      tickerPrices[ticker] = {};
      const sorted = [...q.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const basePrice = sorted[0]?.close || 1;
      sorted.forEach((p) => {
        const key = new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        allDates.add(key);
        tickerPrices[ticker][key] = ((p.close / basePrice) - 1) * 100;
      });
    });

    return Array.from(allDates).map((date) => {
      const point: Record<string, string | number> = { date };
      selectedTickers.forEach((t) => {
        point[t] = tickerPrices[t]?.[date] ?? 0;
      });
      return point;
    });
  }, [histQueries, selectedTickers]);

  const addTicker = (symbol: string) => {
    const upper = symbol.toUpperCase();
    if (selectedTickers.length < 4 && !selectedTickers.includes(upper)) {
      setSelectedTickers([...selectedTickers, upper]);
    }
    setSearchInput("");
    setSearchOpen(false);
  };

  const removeTicker = (symbol: string) => {
    setSelectedTickers(selectedTickers.filter((t) => t !== symbol));
  };

  // Build comparison rows
  const rows = useMemo(() => {
    const metrics = [
      { label: "Price", get: (d: FMPCompanyData) => d.quote?.price ? `$${d.quote.price.toFixed(2)}` : "—" },
      { label: "Change %", get: (d: FMPCompanyData) => d.quote?.changePercentage != null ? `${d.quote.changePercentage.toFixed(2)}%` : "—" },
      { label: "Market Cap", get: (d: FMPCompanyData) => fmtB(d.quote?.marketCap) },
      { label: "Revenue", get: (d: FMPCompanyData) => fmtB(d["income-statement"]?.revenue) },
      { label: "Earnings", get: (d: FMPCompanyData) => fmtB(d["income-statement"]?.netIncome) },
      { label: "Gross Margin", get: (d: FMPCompanyData) => d["income-statement"]?.grossProfitRatio != null ? `${(d["income-statement"]!.grossProfitRatio * 100).toFixed(1)}%` : "—" },
      { label: "P/E", get: (d: FMPCompanyData) => d["key-metrics"]?.peRatio != null ? d["key-metrics"]!.peRatio.toFixed(1) + "x" : "—" },
      { label: "EV", get: (d: FMPCompanyData) => fmtB(d["key-metrics"]?.enterpriseValue) },
      { label: "Total Debt", get: (d: FMPCompanyData) => fmtB(d["balance-sheet-statement"]?.totalDebt) },
      { label: "Cash", get: (d: FMPCompanyData) => fmtB(d["balance-sheet-statement"]?.cashAndCashEquivalents) },
    ];
    return metrics;
  }, []);

  // Watchlist suggestions
  const watchlistTickers = companies.map((c) => c.ticker).filter((t) => !selectedTickers.includes(t));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GitCompareArrows className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Stock Comparison</h1>
      </div>

      {/* Ticker selector */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {selectedTickers.map((t, i) => (
              <Badge key={t} variant="outline" className="text-sm font-mono px-3 py-1 gap-1" style={{ borderColor: CHART_COLORS[i] }}>
                <span style={{ color: CHART_COLORS[i] }}>{t}</span>
                <button onClick={() => removeTicker(t)}><X className="h-3 w-3 text-muted-foreground hover:text-foreground" /></button>
              </Badge>
            ))}
            {selectedTickers.length < 4 && (
              <div className="relative">
                <div className="flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Add ticker…"
                    value={searchInput}
                    onChange={(e) => { setSearchInput(e.target.value); setSearchOpen(true); }}
                    onFocus={() => setSearchOpen(true)}
                    className="h-8 w-40 text-xs"
                    onKeyDown={(e) => { if (e.key === "Enter" && searchInput.trim()) addTicker(searchInput.trim()); }}
                  />
                </div>
                {searchOpen && searchInput.length >= 1 && searchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {searchResults.map((r) => (
                      <button key={r.symbol} onClick={() => addTicker(r.symbol)} className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-accent/50 transition-colors text-left">
                        <div>
                          <span className="font-mono font-bold text-foreground">{r.symbol}</span>
                          <span className="text-muted-foreground ml-2 truncate">{r.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{r.exchangeShortName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedTickers.length === 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Quick add from watchlist:</p>
              <div className="flex gap-1.5 flex-wrap">
                {watchlistTickers.slice(0, 8).map((t) => (
                  <Button key={t} variant="outline" size="sm" className="text-xs h-7 font-mono" onClick={() => addTicker(t)}>{t}</Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTickers.length >= 2 && (
        <>
          {/* Normalized Price Chart */}
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-base">30-Day Performance (% Change)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v.toFixed(2)}%`} />
                  <Legend />
                  {selectedTickers.map((t, i) => (
                    <Line key={t} type="monotone" dataKey={t} stroke={CHART_COLORS[i]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-base">Side-by-Side Comparison</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading data…
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                        {selectedTickers.map((t, i) => (
                          <th key={t} className="text-right py-2 font-mono font-bold" style={{ color: CHART_COLORS[i] }}>{t}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.label} className="border-b border-border/30">
                          <td className="py-2 text-muted-foreground">{row.label}</td>
                          {selectedTickers.map((t, i) => {
                            const data = companyQueries[i]?.data as FMPCompanyData | undefined;
                            return (
                              <td key={t} className="py-2 text-right font-mono">{data ? row.get(data) : "—"}</td>
                            );
                          })}
                        </tr>
                      ))}
                      {/* DCF row */}
                      <tr className="border-b border-border/30">
                        <td className="py-2 text-muted-foreground">DCF Fair Value</td>
                        {selectedTickers.map((t, i) => {
                          const dcf = dcfQueries[i]?.data as FMPDcf | undefined;
                          return (
                            <td key={t} className="py-2 text-right font-mono">{dcf?.dcf ? `$${dcf.dcf.toFixed(2)}` : "—"}</td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {selectedTickers.length === 1 && (
        <p className="text-sm text-muted-foreground text-center py-8">Add at least one more ticker to compare.</p>
      )}
      {selectedTickers.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Select 2–4 tickers above to start comparing.</p>
      )}

      {searchOpen && <div className="fixed inset-0 z-30" onClick={() => setSearchOpen(false)} />}
    </div>
  );
}
