import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Play, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface BottleneckRow {
  company_id: string;
  name: string;
  ticker: string;
  description: string | null;
  bottleneck_score: number;
  beneficiary_score: number;
  risk_score: number;
  breakdown: Record<string, unknown> | null;
  downstream_count: number;
}

function useBottleneckData() {
  return useQuery({
    queryKey: ["bottleneck-analysis"],
    queryFn: async (): Promise<BottleneckRow[]> => {
      // Fetch companies with their scores
      const { data: companies, error: compErr } = await supabase
        .from("companies")
        .select("id, name, ticker, description, risk_score");
      if (compErr) throw compErr;

      const { data: scores, error: scErr } = await supabase
        .from("company_scores")
        .select("company_id, bottleneck_score, beneficiary_score, breakdown");
      if (scErr) throw scErr;

      // Count downstream dependents per company (how many relationships point TO this company as supplier)
      const { data: rels, error: relErr } = await supabase
        .from("relationships")
        .select("from_company_id, to_company_id, rel_type");
      if (relErr) throw relErr;

      const downstreamMap = new Map<string, Set<string>>();
      for (const r of rels ?? []) {
        if (r.rel_type === "supplier") {
          // from_company_id supplies to_company_id → from_company_id has a downstream dependent
          const set = downstreamMap.get(r.from_company_id) ?? new Set();
          set.add(r.to_company_id);
          downstreamMap.set(r.from_company_id, set);
        }
      }

      const scoreMap = new Map(
        (scores ?? []).map((s) => [s.company_id, s])
      );

      return (companies ?? [])
        .map((c) => {
          const s = scoreMap.get(c.id);
          return {
            company_id: c.id,
            name: c.name,
            ticker: c.ticker,
            description: c.description,
            bottleneck_score: s?.bottleneck_score ?? 0,
            beneficiary_score: s?.beneficiary_score ?? 0,
            risk_score: c.risk_score,
            breakdown: s?.breakdown as Record<string, unknown> | null,
            downstream_count: downstreamMap.get(c.id)?.size ?? 0,
          };
        })
        .filter((b) => b.bottleneck_score > 0 || b.downstream_count > 0 || b.risk_score >= 50)
        .sort((a, b) => b.bottleneck_score - a.bottleneck_score);
    },
  });
}

function useLastScan() {
  return useQuery({
    queryKey: ["last-scan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scan_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

function useRunScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("bottleneck-scan", {
        body: { trigger: "manual" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Scan completed successfully");
      qc.invalidateQueries({ queryKey: ["bottleneck-analysis"] });
      qc.invalidateQueries({ queryKey: ["last-scan"] });
    },
    onError: (err: Error) => {
      toast.error(`Scan failed: ${err.message}`);
      qc.invalidateQueries({ queryKey: ["last-scan"] });
    },
  });
}

function getRiskLabel(score: number) {
  if (score < 30) return { text: "Low", className: "text-success" };
  if (score < 60) return { text: "Medium", className: "text-warning" };
  return { text: "High", className: "text-destructive" };
}

export default function BottleneckAnalysis() {
  const { data: bottlenecks, isLoading } = useBottleneckData();
  const { data: lastScan } = useLastScan();
  const runScan = useRunScan();

  return (
    <div className="space-y-6">
      {/* Header with scan controls */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bottleneck Analysis</h1>
          <p className="text-sm text-muted-foreground">
            AI-scored concentration risk & financial health — single points of failure in the supply chain
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastScan && (
            <div className="text-right text-xs text-muted-foreground">
              <div className="flex items-center gap-1 justify-end">
                {lastScan.status === "completed" && <CheckCircle2 className="h-3 w-3 text-success" />}
                {lastScan.status === "failed" && <XCircle className="h-3 w-3 text-destructive" />}
                {lastScan.status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
                <span className="capitalize">{lastScan.status}</span>
              </div>
              <p>{formatDistanceToNow(new Date(lastScan.started_at), { addSuffix: true })}</p>
              {lastScan.companies_scanned && (
                <p>{lastScan.companies_scanned} companies · {lastScan.signals_found ?? 0} signals</p>
              )}
            </div>
          )}
          <Button
            onClick={() => runScan.mutate()}
            disabled={runScan.isPending}
            size="sm"
          >
            {runScan.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {runScan.isPending ? "Scanning…" : "Run Scan"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          {/* Top 3 critical alerts */}
          <div className="grid grid-cols-3 gap-4">
            {(bottlenecks ?? []).slice(0, 3).map((b) => {
              const risk = getRiskLabel(b.bottleneck_score);
              return (
                <Card
                  key={b.company_id}
                  className={`border-border/50 ${b.bottleneck_score >= 60 ? "border-destructive/30" : b.bottleneck_score >= 40 ? "border-warning/30" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        to={`/company/${b.company_id}`}
                        className="font-semibold text-sm hover:text-primary transition-colors"
                      >
                        {b.name}
                      </Link>
                      <span className={`font-mono text-lg font-bold ${risk.className}`}>
                        {b.bottleneck_score}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{b.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Bottleneck</span>
                        <span className="font-mono font-medium">{b.bottleneck_score}/100</span>
                      </div>
                      <Progress value={b.bottleneck_score} className="h-1.5" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      <div>
                        <span className="text-muted-foreground">Financial Risk</span>
                        <p className="font-mono font-medium">{b.risk_score}/100</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Beneficiary</span>
                        <p className="font-mono font-medium">{b.beneficiary_score}/100</p>
                      </div>
                    </div>
                    {b.downstream_count > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          {b.downstream_count} downstream {b.downstream_count === 1 ? "dependent" : "dependents"}
                        </p>
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
                {(bottlenecks ?? []).map((b, i) => {
                  const risk = getRiskLabel(b.bottleneck_score);
                  return (
                    <Link
                      key={b.company_id}
                      to={`/company/${b.company_id}`}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-xs font-mono text-muted-foreground w-6">
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{b.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{b.ticker}</span>
                      </div>
                      <div className="flex items-center gap-6 text-xs">
                        <div className="text-center">
                          <p className="text-muted-foreground">Deps</p>
                          <p className="font-mono font-medium">{b.downstream_count}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Bottleneck</p>
                          <p className="font-mono font-medium">{b.bottleneck_score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Beneficiary</p>
                          <p className="font-mono font-medium">{b.beneficiary_score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Fin.</p>
                          <p className="font-mono font-medium">{b.risk_score}</p>
                        </div>
                        <div className={`font-mono font-bold text-base w-10 text-right ${risk.className}`}>
                          {b.bottleneck_score}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
