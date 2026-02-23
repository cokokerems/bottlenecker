import { companies, getCompanyById, categoryLabels, getPrimaryCategory } from "@/data/companies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface BottleneckEntry {
  company: typeof companies[0];
  concentrationScore: number;
  financialRisk: number;
  combinedScore: number;
  downstreamCompanies: string[];
}

function calculateBottlenecks(): BottleneckEntry[] {
  return companies
    .map((company) => {
      // Who depends on this company?
      const downstream = companies.filter(
        (c) => c.suppliers.includes(company.id)
      );
      const concentrationScore = downstream.length * 15; // more dependents = more risk
      const financialRisk = company.riskScore;
      const combinedScore = Math.min(100, Math.round(concentrationScore * 0.6 + financialRisk * 0.4));

      return {
        company,
        concentrationScore: Math.min(100, concentrationScore),
        financialRisk,
        combinedScore,
        downstreamCompanies: downstream.map((d) => d.id),
      };
    })
    .filter((b) => b.downstreamCompanies.length > 0 || b.financialRisk >= 50)
    .sort((a, b) => b.combinedScore - a.combinedScore);
}

export default function BottleneckAnalysis() {
  const bottlenecks = calculateBottlenecks();

  function getRiskLabel(score: number) {
    if (score < 30) return { text: "Low", className: "text-success" };
    if (score < 60) return { text: "Medium", className: "text-warning" };
    return { text: "High", className: "text-destructive" };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bottleneck Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Concentration risk & financial health combined to identify single points of failure
        </p>
      </div>

      {/* Critical alerts */}
      <div className="grid grid-cols-3 gap-4">
        {bottlenecks.slice(0, 3).map((b) => {
          const risk = getRiskLabel(b.combinedScore);
          return (
            <Card key={b.company.id} className={`border-border/50 ${b.combinedScore >= 60 ? "border-destructive/30" : b.combinedScore >= 40 ? "border-warning/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link to={`/company/${b.company.id}`} className="font-semibold text-sm hover:text-primary transition-colors">
                    {b.company.name}
                  </Link>
                  <span className={`font-mono text-lg font-bold ${risk.className}`}>{b.combinedScore}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{b.company.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Concentration</span>
                    <p className="font-mono font-medium">{b.concentrationScore}/100</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Financial Risk</span>
                    <p className="font-mono font-medium">{b.financialRisk}/100</p>
                  </div>
                </div>
                {b.downstreamCompanies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Downstream impact ({b.downstreamCompanies.length} companies):</p>
                    <div className="flex flex-wrap gap-1">
                      {b.downstreamCompanies.map((id) => {
                        const c = getCompanyById(id);
                        return c ? (
                          <Link key={id} to={`/company/${id}`} className="text-xs font-mono px-1.5 py-0.5 rounded bg-accent text-accent-foreground hover:bg-primary/20 transition-colors">
                            {c.ticker}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full ranking */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Full Risk Ranking</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {bottlenecks.map((b, i) => {
              const risk = getRiskLabel(b.combinedScore);
              return (
                <Link
                  key={b.company.id}
                  to={`/company/${b.company.id}`}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-accent/50 transition-colors"
                >
                  <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{b.company.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{categoryLabels[getPrimaryCategory(b.company)]}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-center">
                      <p className="text-muted-foreground">Deps</p>
                      <p className="font-mono font-medium">{b.downstreamCompanies.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Conc.</p>
                      <p className="font-mono font-medium">{b.concentrationScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Fin.</p>
                      <p className="font-mono font-medium">{b.financialRisk}</p>
                    </div>
                    <div className={`font-mono font-bold text-base w-10 text-right ${risk.className}`}>
                      {b.combinedScore}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
