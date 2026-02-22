import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sectorPerformance, companies, alerts as alertData, categoryLabels, type CompanyCategory } from "@/data/companies";
import { TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SparklineChart } from "@/components/SparklineChart";
import { Link } from "react-router-dom";

export default function DashboardHome() {
  const topMovers = [...companies].sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Overview</h1>
        <p className="text-sm text-muted-foreground">AI infrastructure supply chain at a glance</p>
      </div>

      {/* Sector Performance */}
      <div className="grid grid-cols-4 gap-4">
        {sectorPerformance.map((sector) => (
          <Card key={sector.name} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{sector.name}</span>
                {sector.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className={`text-lg font-mono font-semibold mt-1 ${sector.change >= 0 ? "text-success" : "text-destructive"}`}>
                {sector.change >= 0 ? "+" : ""}{sector.change}%
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
                {companies.map((company) => (
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
                      <SparklineChart data={company.priceHistory} positive={company.priceChange >= 0} />
                    </div>
                    <div className="ml-auto text-right flex items-center gap-3">
                      <span className="font-mono text-sm">${company.currentPrice.toFixed(2)}</span>
                      <span className={`flex items-center gap-0.5 text-xs font-mono font-medium ${company.priceChange >= 0 ? "text-success" : "text-destructive"}`}>
                        {company.priceChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(company.priceChange)}%
                      </span>
                    </div>
                  </Link>
                ))}
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
