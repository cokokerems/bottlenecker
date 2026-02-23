import { Company, companies } from "@/data/companies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";

const positionConfig: Record<string, { label: string; className: string }> = {
  monopoly: { label: "Monopoly", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  duopoly: { label: "Duopoly", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  "market-leader": { label: "Market Leader", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  "strong-challenger": { label: "Strong Challenger", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  "niche-specialist": { label: "Niche Specialist", className: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  "emerging-contender": { label: "Emerging Contender", className: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
};

const trendConfig = {
  strengthening: { icon: TrendingUp, label: "Strengthening", className: "text-emerald-400" },
  stable: { icon: Minus, label: "Stable", className: "text-muted-foreground" },
  weakening: { icon: TrendingDown, label: "Weakening", className: "text-destructive" },
};

interface Props {
  company: Company;
}

export default function CompetitivePosition({ company }: Props) {
  const { competitivePosition: cp } = company;
  const pos = positionConfig[cp.position];
  const trend = trendConfig[cp.trend];
  const TrendIcon = trend.icon;

  const peers = cp.competitors
    .map((id) => companies.find((c) => c.id === id))
    .filter(Boolean) as Company[];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Competitive Position</CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${pos.className}`}>
              {pos.label}
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium ${trend.className}`}>
              <TrendIcon className="h-3 w-3" />
              {trend.label}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market share bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Estimated Market Share</span>
            <span className="text-sm font-mono font-semibold">{cp.marketSharePercent}%</span>
          </div>
          <Progress value={cp.marketSharePercent} className="h-2" />
        </div>

        {/* Moat */}
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-0.5">Competitive Moat</p>
          <p className="text-sm">{cp.moat}</p>
        </div>

        {/* Sector Peers */}
        {peers.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Sector Peers</p>
            <div className="space-y-1.5">
              {peers.map((peer) => (
                <Link
                  key={peer.id}
                  to={`/company/${peer.id}`}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{peer.ticker}</span>
                    <span className="text-xs text-muted-foreground">{peer.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${positionConfig[peer.competitivePosition.position].className}`}>
                      {positionConfig[peer.competitivePosition.position].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {peer.competitivePosition.marketSharePercent}%
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
