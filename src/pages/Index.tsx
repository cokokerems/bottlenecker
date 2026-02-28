import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { companies } from "@/data/companies";
import { ArrowUpRight, ArrowDownRight, Wifi, WifiOff, Star, CalendarDays } from "lucide-react";
import { SparklineChart } from "@/components/SparklineChart";
import { Link } from "react-router-dom";
import { useFMPQuotes, useFMPSparklines } from "@/hooks/useFMPData";
import { useFocusList } from "@/hooks/useFocusList";
import { useBatchEarningsDates } from "@/hooks/useEarningsDates";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const INDEX_TICKERS = [
  { ticker: "QQQ", name: "Invesco QQQ Trust, Series 1" },
  { ticker: "SPY", name: "SPDR S&P 500 ETF" },
  { ticker: "DIA", name: "SPDR Dow Jones ETF" },
];

export default function DashboardHome() {
  const companyTickers = useMemo(() => companies.map((c) => c.ticker), []);
  const allTickers = useMemo(
    () => [...INDEX_TICKERS.map((i) => i.ticker), ...companyTickers],
    [companyTickers]
  );
  const { data: liveQuotes, isLoading, isError } = useFMPQuotes(allTickers);
  const { data: sparklineData } = useFMPSparklines(companyTickers);
  const { focusTickers, toggleFocus, isFocused } = useFocusList();
  const { nextEarningsMap } = useBatchEarningsDates(companyTickers);

  // Split companies into focused + rest
  const focusedCompanies = useMemo(
    () => companies.filter((c) => focusTickers.includes(c.ticker)),
    [focusTickers]
  );
  const otherCompanies = useMemo(
    () => companies.filter((c) => !focusTickers.includes(c.ticker)),
    [focusTickers]
  );

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
            <><WifiOff className="h-3 w-3 text-destructive" /> <span>Offline</span></>
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
                      <span className={`text-sm font-mono font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
                        {isPositive ? "+" : ""}{(change ?? 0).toFixed(2)}%
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Focus List */}
      {focusedCompanies.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-primary fill-primary" />
              Focus List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {focusedCompanies.map((company) => (
                <WatchlistRow
                  key={company.id}
                  company={company}
                  liveQuotes={liveQuotes}
                  sparklineData={sparklineData}
                  isFocused={true}
                  onToggleFocus={toggleFocus}
                  nextEarnings={nextEarningsMap[company.ticker.toUpperCase()]}
                  showEarnings
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Watchlist */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Watchlist</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {otherCompanies.map((company) => (
              <WatchlistRow
                key={company.id}
                company={company}
                liveQuotes={liveQuotes}
                sparklineData={sparklineData}
                isFocused={false}
                onToggleFocus={toggleFocus}
                nextEarnings={undefined}
                showEarnings={false}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WatchlistRow({
  company,
  liveQuotes,
  sparklineData,
  isFocused,
  onToggleFocus,
  nextEarnings,
  showEarnings,
}: {
  company: (typeof companies)[number];
  liveQuotes: Record<string, any> | undefined;
  sparklineData: Record<string, number[]> | undefined;
  isFocused: boolean;
  onToggleFocus: (ticker: string) => void;
  nextEarnings?: string;
  showEarnings: boolean;
}) {
  const price = liveQuotes?.[company.ticker]?.price ?? 0;
  const change = liveQuotes?.[company.ticker]?.changePercentage ?? 0;
  const isPositive = change >= 0;
  const sparkline = sparklineData?.[company.ticker];

  return (
    <div className="flex items-center gap-4 px-6 py-3 hover:bg-accent/50 transition-colors">
      <button
        onClick={(e) => { e.preventDefault(); onToggleFocus(company.ticker); }}
        className="shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
        title={isFocused ? "Remove from focus" : "Add to focus"}
      >
        <Star className={`h-4 w-4 ${isFocused ? "text-primary fill-primary" : "text-muted-foreground/40 hover:text-muted-foreground"}`} />
      </button>
      <Link to={`/company/${company.id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-[120px]">
          <p className="text-sm font-semibold">{company.ticker}</p>
          <p className="text-xs text-muted-foreground truncate">{company.name}</p>
        </div>
        {showEarnings && nextEarnings && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <CalendarDays className="h-3 w-3" />
            <span className="font-mono">{nextEarnings}</span>
          </div>
        )}
        <div className="w-[100px]">
          {sparkline && sparkline.length > 0 ? (
            <SparklineChart data={sparkline} positive={isPositive} />
          ) : (
            <Skeleton className="h-8 w-full" />
          )}
        </div>
        <div className="ml-auto text-right flex items-center gap-3">
          {price > 0 ? (
            <>
              <span className="font-mono text-sm">${price.toFixed(2)}</span>
              <span className={`flex items-center gap-0.5 text-xs font-mono font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(change).toFixed(2)}%
              </span>
            </>
          ) : (
            <Skeleton className="h-4 w-20" />
          )}
        </div>
      </Link>
    </div>
  );
}
