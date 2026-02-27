import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companies, alerts as alertData } from "@/data/companies";
import { TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight, Wifi, WifiOff } from "lucide-react";
import { SparklineChart } from "@/components/SparklineChart";
import { Link } from "react-router-dom";
import { useFMPQuotes, useFMPSectorPerformance } from "@/hooks/useFMPData";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const INDEX_TICKERS = [
  { ticker: "QQQ", name: "Invesco QQQ Trust, Series 1" },
  { ticker: "SPY", name: "SPDR S&P 500 ETF" },
  { ticker: "DIA", name: "SPDR Dow Jones ETF" },
];

export default function DashboardHome() {
  const allTickers = useMemo(
    () => [...INDEX_TICKERS.map((i) => i.ticker), ...companies.map((c) => c.ticker)],
    []
  );
  const { data: liveQuotes, isLoading, isError } = useFMPQuotes(allTickers);
  const { data: sectorData } = useFMPSectorPerformance();

  const sectorPerf = useMemo(() => {
    if (!sectorData || sectorData.length === 0) return [];
    return sectorData.map((s) => ({
      name: s.sector,
      change: parseFloat(s.changesPercentage),
    }));
  }, [sectorData]);

  function getLivePrice(ticker: string, fallback: number): number {
    return liveQuotes?.[ticker]?.price ?? fallback;
  }

  function getLiveChange(ticker: string, fallback: number): number {
    return liveQuotes?.[ticker]?.changePercentage ?? fallback;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Market Overview</h1>
          <p className="text-sm text-muted-foreground">AI infrastructure supply chain at a glance</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isLoading ? (
            <span className="animate-pulse">Loading live data…</span>
          ) : isError ? (
            <><WifiOff className="h-3 w-3 text-destructive" /> <span>Using mock data</span></>
          ) : (
            <><Wifi className="h-3 w-3 text-success" /> <span>Live</span></>
          )}
        </div>
      </div>

      {/* Market Indices */}
      <div className="grid grid-cols-3 gap-4">
        {INDEX_TICKERS.map((idx) => {
          const price = liveQuotes?.[idx.ticker]?.price;
          const change = liveQuotes?.[idx.ticker]?.changePercentage;
          const isPositive = (change ?? 0) >= 0;

          return (
            <Card key={idx.ticker} className="border-border/50">
              <CardContent className="p-5">
                {isLoading || price == null ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{idx.ticker}</span>
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{idx.name}</p>
                    <div className="flex items-baseline gap-3 mt-2">
                      <span className="text-xl font-mono font-bold">${price.toFixed(2)}</span>
                      <span
                        className={`text-sm font-mono font-medium ${isPositive ? "text-success" : "text-destructive"}`}
                      >
                        {isPositive ? "+" : ""}
                        {(change ?? 0).toFixed(2)}%
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sector Performance */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {sectorPerf.map((sector) => (
          <Card key={sector.name} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate">{sector.name}</span>
                {sector.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className={`text-lg font-mono font-semibold mt-1 ${sector.change >= 0 ? "text-success" : "text-destructive"}`}>
                {sector.change >= 0 ? "+" : ""}{sector.change.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Watchlist */}
        <div className="col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Watchlist</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {companies.map((company) => {
                  const price = getLivePrice(company.ticker, company.currentPrice);
                  const change = getLiveChange(company.ticker, company.priceChange);
                  const isPositive = change >= 0;

                  return (
                    <Link
                      key={company.id}
                      to={`/company/${company.id}`}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-[120px]">
                        <p className="text-sm font-semibold">{company.ticker}</p>
                        <p className="text-xs text-muted-foreground truncate">{company.name}</p>
                      </div>
                      <div className="w-[100px]">
                        <SparklineChart data={company.priceHistory} positive={isPositive} />
                      </div>
                      <div className="ml-auto text-right flex items-center gap-3">
                        <span className="font-mono text-sm">${price.toFixed(2)}</span>
                        <span className={`flex items-center gap-0.5 text-xs font-mono font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
                          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(change).toFixed(2)}%
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="col-span-1">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertData.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-md p-3 text-xs border ${
                    alert.severity === "critical"
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-warning/30 bg-warning/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${alert.severity === "critical" ? "text-destructive" : "text-warning"}`}>
                      {alert.type.replace("-", " ").toUpperCase()}
                    </span>
                    <span className="text-muted-foreground">{alert.timestamp}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
