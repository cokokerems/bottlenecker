import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompanyById, companies, categoryLabels, categoryColors } from "@/data/companies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, ExternalLink, Wifi, WifiOff,
  ChevronDown, ChevronRight, Loader2, TrendingUp, TrendingDown, ShieldAlert,
  Users, BarChart3, DollarSign, GitBranch, Swords, Calculator, Eye,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import ValuationBreakdown from "@/components/ValuationBreakdown";
import CompetitivePosition from "@/components/CompetitivePosition";
import {
  useFMPCompanyData, useFMPHistoricalPrices,
  useFMPAnalystRecommendations, useFMPPriceTargetConsensus, useFMPDcf, useFMPAnalystEstimates,
  useFMPInstitutionalHolders, useFMPMutualFundHolders, useFMPInsiderTradingStats,
} from "@/hooks/useFMPData";
import { useEarningsDates } from "@/hooks/useEarningsDates";
import { useMemo } from "react";

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SectionToggle({
  icon: Icon, title, open, onToggle, children,
}: {
  icon: React.ElementType; title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-border/50 bg-card hover:bg-accent/30 transition-colors text-left">
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold flex-1">{title}</span>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function fmtNum(v: number | undefined | null, fallback = "N/A"): string {
  if (v == null || isNaN(v)) return fallback;
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtB(v: number | undefined | null): string {
  if (v == null || isNaN(v)) return "N/A";
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toFixed(0)}`;
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const company = getCompanyById(id || "");
  const ticker = company?.ticker || "";

  const { data: liveData, isLoading, isError } = useFMPCompanyData(ticker);

  // Historical prices: 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: historicalPrices } = useFMPHistoricalPrices(ticker, toDateKey(thirtyDaysAgo), toDateKey(now));

  // New data hooks
  const { data: analystRec } = useFMPAnalystRecommendations(ticker);
  const { data: priceTarget } = useFMPPriceTargetConsensus(ticker);
  const { data: dcfData } = useFMPDcf(ticker);
  const { data: analystEstimates } = useFMPAnalystEstimates(ticker);
  const { data: instHolders } = useFMPInstitutionalHolders(ticker);
  const { data: mfHolders } = useFMPMutualFundHolders(ticker);
  const { data: insiderStats } = useFMPInsiderTradingStats(ticker);
  const { data: earningsDates } = useEarningsDates(ticker);

  // Collapsible states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));

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

  const chartData = useMemo(() => {
    if (historicalPrices && historicalPrices.length > 0) {
      return [...historicalPrices]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((p) => ({ day: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), price: p.close }));
    }
    return [];
  }, [historicalPrices]);

  if (!company || !merged) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Company not found</p></div>;
  }

  const supplierCompanies = company.suppliers.map((sid) => companies.find((c) => c.id === sid)).filter(Boolean);
  const customerCompanies = company.customers.map((cid) => companies.find((c) => c.id === cid)).filter(Boolean);
  const mergedCompany = { ...company, ...merged };

  const rec = analystRec?.[0];
  const totalRec = rec ? rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <span className="font-mono text-sm text-muted-foreground">{company.ticker}</span>
            {company.categories.map((cat) => (
              <span key={cat} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: categoryColors[cat] + "20", color: categoryColors[cat] }}>{categoryLabels[cat]}</span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{company.description}</p>
          {earningsDates && (
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              {earningsDates.last && (
                <span>Last Earnings: <span className="font-mono font-medium text-foreground">{earningsDates.last.date}</span></span>
              )}
              {earningsDates.next && (
                <span>Next Earnings: <span className="font-mono font-medium text-primary">{earningsDates.next.date}</span></span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isLoading ? <span className="animate-pulse">Loading…</span> : isError ? <><WifiOff className="h-3 w-3 text-destructive" /> Mock</> : <><Wifi className="h-3 w-3 text-success" /> Live</>}
        </div>
      </div>

      {/* Price + key metrics — always visible */}
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

      {/* Price Chart — always visible */}
      <Card className="border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-base">30-Day Price History</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Collapsible sections */}
      <div className="space-y-2">

        {/* Supply Chain */}
        <SectionToggle icon={GitBranch} title={`Supply Chain (${supplierCompanies.length + customerCompanies.length})`} open={!!openSections.supplyChain} onToggle={() => toggle("supplyChain")}>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-base">Suppliers ({supplierCompanies.length})</CardTitle></CardHeader>
              <CardContent>
                {supplierCompanies.length === 0 ? <p className="text-sm text-muted-foreground">No tracked suppliers</p> : (
                  <div className="space-y-2">
                    {supplierCompanies.map((s) => s && (
                      <Link key={s.id} to={`/company/${s.id}`} className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50 transition-colors">
                        <div><span className="text-sm font-medium">{s.ticker}</span><span className="text-xs text-muted-foreground ml-2">{s.name}</span></div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-base">Customers ({customerCompanies.length})</CardTitle></CardHeader>
              <CardContent>
                {customerCompanies.length === 0 ? <p className="text-sm text-muted-foreground">No tracked customers</p> : (
                  <div className="space-y-2">
                    {customerCompanies.map((c) => c && (
                      <Link key={c.id} to={`/company/${c.id}`} className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50 transition-colors">
                        <div><span className="text-sm font-medium">{c.ticker}</span><span className="text-xs text-muted-foreground ml-2">{c.name}</span></div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SectionToggle>

        {/* Competitive Position */}
        <SectionToggle icon={Swords} title="Competitive Position" open={!!openSections.competitive} onToggle={() => toggle("competitive")}>
          <CompetitivePosition company={mergedCompany} />
        </SectionToggle>

        {/* M&A Valuation */}
        <SectionToggle icon={Calculator} title="M&A Valuation" open={!!openSections.valuation} onToggle={() => toggle("valuation")}>
          <ValuationBreakdown company={mergedCompany} liveData={liveData} dcf={dcfData} />
        </SectionToggle>

        {/* Analyst & DCF */}
        <SectionToggle icon={BarChart3} title="Analyst & DCF" open={!!openSections.analyst} onToggle={() => toggle("analyst")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Analyst Recommendations */}
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Analyst Consensus</CardTitle></CardHeader>
              <CardContent>
                {rec ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-semibold text-foreground">{rec.consensus}</span>
                    </div>
                    <div className="flex h-4 rounded-full overflow-hidden">
                      {[
                        { count: rec.strongBuy, color: "bg-emerald-500" },
                        { count: rec.buy, color: "bg-green-400" },
                        { count: rec.hold, color: "bg-yellow-400" },
                        { count: rec.sell, color: "bg-orange-400" },
                        { count: rec.strongSell, color: "bg-red-500" },
                      ].map((seg, i) => seg.count > 0 && (
                        <div key={i} className={`${seg.color}`} style={{ width: `${(seg.count / totalRec) * 100}%` }} />
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-[10px] text-center">
                      <div><span className="font-bold text-emerald-500">{rec.strongBuy}</span><br />Strong Buy</div>
                      <div><span className="font-bold text-green-400">{rec.buy}</span><br />Buy</div>
                      <div><span className="font-bold text-yellow-400">{rec.hold}</span><br />Hold</div>
                      <div><span className="font-bold text-orange-400">{rec.sell}</span><br />Sell</div>
                      <div><span className="font-bold text-red-500">{rec.strongSell}</span><br />Strong Sell</div>
                    </div>
                  </div>
                ) : <p className="text-xs text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>

            {/* Price Target Consensus */}
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Price Target</CardTitle></CardHeader>
              <CardContent>
                {priceTarget ? (
                  <div className="space-y-2">
                    {[
                      { label: "Consensus", value: priceTarget.targetConsensus },
                      { label: "High", value: priceTarget.targetHigh },
                      { label: "Median", value: priceTarget.targetMedian },
                      { label: "Low", value: priceTarget.targetLow },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className="font-mono font-semibold">${fmtNum(r.value)}</span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-border/50 flex justify-between text-sm">
                      <span className="text-muted-foreground">Upside</span>
                      <span className={`font-mono font-bold ${priceTarget.targetConsensus > merged.currentPrice ? "text-success" : "text-destructive"}`}>
                        {((priceTarget.targetConsensus / merged.currentPrice - 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : <p className="text-xs text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>

            {/* FMP DCF Fair Value */}
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" />FMP DCF Fair Value</CardTitle></CardHeader>
              <CardContent>
                {dcfData ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Intrinsic Value</span>
                      <span className="font-mono font-bold text-primary">${fmtNum(dcfData.dcf)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Price</span>
                      <span className="font-mono">${fmtNum(dcfData["Stock Price"])}</span>
                    </div>
                    <div className="pt-1 border-t border-border/50 flex justify-between text-sm">
                      <span className="text-muted-foreground">Premium/Discount</span>
                      {(() => {
                        const diff = ((dcfData["Stock Price"] / dcfData.dcf - 1) * 100);
                        return (
                          <span className={`font-mono font-bold ${diff > 0 ? "text-destructive" : "text-success"}`}>
                            {diff > 0 ? `${diff.toFixed(1)}% overvalued` : `${Math.abs(diff).toFixed(1)}% undervalued`}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                ) : <p className="text-xs text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>

            {/* Forward Estimates */}
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-primary" />Forward Estimates</CardTitle></CardHeader>
              <CardContent>
                {analystEstimates && analystEstimates.length > 0 ? (
                  <div className="space-y-2">
                    {analystEstimates.slice(0, 2).map((est, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs font-semibold text-foreground/80">{est.date?.slice(0, 4) || `Year ${i + 1}`}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Revenue Est.</span>
                          <span className="font-mono">{fmtB(est.estimatedRevenueAvg)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">EPS Est.</span>
                          <span className="font-mono">${fmtNum(est.estimatedEpsAvg)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>
          </div>
        </SectionToggle>

        {/* Ownership */}
        <SectionToggle icon={Users} title="Ownership" open={!!openSections.ownership} onToggle={() => toggle("ownership")}>
          <div className="space-y-4">
            {/* Institutional Holders */}
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Institutional Holders</CardTitle></CardHeader>
              <CardContent>
                {instHolders && instHolders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-border/50 text-muted-foreground">
                        <th className="text-left py-1.5 font-medium">Holder</th>
                        <th className="text-right py-1.5 font-medium">Shares</th>
                        <th className="text-right py-1.5 font-medium">Value</th>
                        <th className="text-right py-1.5 font-medium">Change</th>
                      </tr></thead>
                      <tbody>
                        {instHolders.slice(0, 10).map((h, i) => (
                          <tr key={i} className="border-b border-border/30">
                            <td className="py-1.5 font-medium truncate max-w-[200px]">{h.holder}</td>
                            <td className="py-1.5 text-right font-mono">{(h.shares / 1e6).toFixed(1)}M</td>
                            <td className="py-1.5 text-right font-mono">{fmtB(h.value)}</td>
                            <td className={`py-1.5 text-right font-mono ${h.change > 0 ? "text-success" : h.change < 0 ? "text-destructive" : ""}`}>
                              {h.change > 0 ? "+" : ""}{(h.change / 1e6).toFixed(1)}M
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-xs text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>

            {/* Mutual Fund Holders */}
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Mutual Fund Holders</CardTitle></CardHeader>
              <CardContent>
                {mfHolders && mfHolders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-border/50 text-muted-foreground">
                        <th className="text-left py-1.5 font-medium">Fund</th>
                        <th className="text-right py-1.5 font-medium">Shares</th>
                        <th className="text-right py-1.5 font-medium">Change</th>
                      </tr></thead>
                      <tbody>
                        {mfHolders.slice(0, 10).map((h, i) => (
                          <tr key={i} className="border-b border-border/30">
                            <td className="py-1.5 font-medium truncate max-w-[200px]">{h.holder}</td>
                            <td className="py-1.5 text-right font-mono">{(h.shares / 1e6).toFixed(1)}M</td>
                            <td className={`py-1.5 text-right font-mono ${h.change > 0 ? "text-success" : h.change < 0 ? "text-destructive" : ""}`}>
                              {h.change > 0 ? "+" : ""}{(h.change / 1e6).toFixed(1)}M
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-xs text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>

            {/* Insider Trading Stats */}
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Insider Trading Summary</CardTitle></CardHeader>
              <CardContent>
                {insiderStats && insiderStats.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {insiderStats.slice(0, 4).map((s, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-semibold">Q{s.quarter} {s.year}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-success">Buys: {s.purchases}</span>
                          <span className="text-destructive">Sells: {s.sales}</span>
                        </div>
                        <div className="text-xs font-mono">
                          Net: <span className={s.totalBought - s.totalSold > 0 ? "text-success" : "text-destructive"}>
                            {fmtB(s.totalBought - s.totalSold)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>
          </div>
        </SectionToggle>

        {/* Risk Score */}
        <SectionToggle icon={ShieldAlert} title="Risk Score" open={!!openSections.risk} onToggle={() => toggle("risk")}>
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
        </SectionToggle>

      </div>
    </div>
  );
}
