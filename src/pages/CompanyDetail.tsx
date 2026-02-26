import { useParams, Link } from "react-router-dom";
import { getCompanyById, companies, categoryLabels, categoryColors, getPrimaryCategory } from "@/data/companies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, ExternalLink, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import ValuationBreakdown from "@/components/ValuationBreakdown";
import CompetitivePosition from "@/components/CompetitivePosition";
import { useFMPCompanyData, useFMPHistoricalPrices } from "@/hooks/useFMPData";
import { useMemo } from "react";

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const company = getCompanyById(id || "");

  const { data: liveData, isLoading, isError } = useFMPCompanyData(company?.ticker || "");

  // Historical prices: 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: historicalPrices } = useFMPHistoricalPrices(
    company?.ticker || "",
    toDateKey(thirtyDaysAgo),
    toDateKey(now)
  );

  // Merge live data with mock fallbacks
  const merged = useMemo(() => {
    if (!company) return null;
    const q = liveData?.quote;
    const inc = liveData?.["income-statement"];
    const bs = liveData?.["balance-sheet-statement"];

    return {
      currentPrice: q?.price ?? company.currentPrice,
      priceChange: q?.changePercentage ?? company.priceChange,
      marketCap: q?.marketCap ? q.marketCap / 1e9 : company.marketCap,
      revenue: inc?.revenue ? inc.revenue / 1e9 : company.revenue,
      earnings: inc?.netIncome ? inc.netIncome / 1e9 : company.earnings,
      grossMargin: inc?.grossProfitRatio ? inc.grossProfitRatio * 100 : company.grossMargin,
      totalDebt: bs?.totalDebt ? bs.totalDebt / 1e9 : company.totalDebt,
      cashAndEquivalents: bs?.cashAndCashEquivalents ? bs.cashAndCashEquivalents / 1e9 : company.cashAndEquivalents,
      minorityInterest: bs?.minorityInterest ? bs.minorityInterest / 1e9 : company.minorityInterest,
    };
  }, [company, liveData]);

  // Chart data from live historical or fallback to mock
  const chartData = useMemo(() => {
    if (historicalPrices && historicalPrices.length > 0) {
      return [...historicalPrices]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((p) => ({
          day: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          price: p.close,
        }));
    }
    if (!company) return [];
    return company.priceHistory.map((price, i) => ({
      day: `D-${30 - i}`,
      price,
    }));
  }, [historicalPrices, company]);

  if (!company || !merged) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Company not found</p>
      </div>
    );
  }

  const supplierCompanies = company.suppliers.map((sid) => companies.find((c) => c.id === sid)).filter(Boolean);
  const customerCompanies = company.customers.map((cid) => companies.find((c) => c.id === cid)).filter(Boolean);

  const mergedCompany = {
    ...company,
    currentPrice: merged.currentPrice,
    priceChange: merged.priceChange,
    marketCap: merged.marketCap,
    revenue: merged.revenue,
    earnings: merged.earnings,
    grossMargin: merged.grossMargin,
    totalDebt: merged.totalDebt,
    cashAndEquivalents: merged.cashAndEquivalents,
    minorityInterest: merged.minorityInterest,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <span className="font-mono text-sm text-muted-foreground">{company.ticker}</span>
            {company.categories.map((cat) => (
              <span key={cat} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: categoryColors[cat] + "20", color: categoryColors[cat] }}>
                {categoryLabels[cat]}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{company.description}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isLoading ? (
            <span className="animate-pulse">Loading…</span>
          ) : isError ? (
            <><WifiOff className="h-3 w-3 text-destructive" /> <span>Mock</span></>
          ) : (
            <><Wifi className="h-3 w-3 text-success" /> <span>Live</span></>
          )}
        </div>
      </div>

      {/* Price and key metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="col-span-1 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-2xl font-mono font-bold">${merged.currentPrice.toFixed(2)}</p>
            <span className={`flex items-center gap-0.5 text-sm font-mono ${merged.priceChange >= 0 ? "text-success" : "text-destructive"}`}>
              {merged.priceChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(merged.priceChange).toFixed(2)}%
            </span>
          </CardContent>
        </Card>
        {[
          { label: "Revenue (TTM)", value: `$${merged.revenue.toFixed(1)}B` },
          { label: "Earnings (TTM)", value: `$${merged.earnings.toFixed(1)}B` },
          { label: "Gross Margin", value: `${merged.grossMargin.toFixed(1)}%` },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-lg font-mono font-semibold mt-1">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Price Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">30-Day Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(215, 15%, 55%)" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 15%, 55%)" tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(225, 25%, 8%)", border: "1px solid hsl(225, 15%, 16%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="price" stroke="hsl(217, 91%, 60%)" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Supply Chain Context */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Suppliers ({supplierCompanies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {supplierCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tracked suppliers</p>
            ) : (
              <div className="space-y-2">
                {supplierCompanies.map((s) => s && (
                  <Link key={s.id} to={`/company/${s.id}`} className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50 transition-colors">
                    <div>
                      <span className="text-sm font-medium">{s.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{s.name}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Customers ({customerCompanies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {customerCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tracked customers</p>
            ) : (
              <div className="space-y-2">
                {customerCompanies.map((c) => c && (
                  <Link key={c.id} to={`/company/${c.id}`} className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50 transition-colors">
                    <div>
                      <span className="text-sm font-medium">{c.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{c.name}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Competitive Position */}
      <CompetitivePosition company={mergedCompany} />

      {/* M&A Valuation Analysis */}
      <ValuationBreakdown company={mergedCompany} />

      {/* Risk Score */}
      <Card className="border-border/50">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
            company.riskScore < 30 ? "bg-success/20 text-success" : company.riskScore < 60 ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
          }`}>
            {company.riskScore}
          </div>
          <div>
            <p className="text-sm font-medium">Supply Chain Risk Score</p>
            <p className="text-xs text-muted-foreground">
              {company.riskScore < 30 ? "Low risk — strong financial health" : company.riskScore < 60 ? "Moderate risk — monitor closely" : "High risk — potential supply chain disruption"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
