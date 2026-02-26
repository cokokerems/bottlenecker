import { useRef, useState } from "react";
import { ExternalLink, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Loader2, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFMPStockNews, useFMPInsiderTrades, useFMPSenateTrades, useFMPHouseTrades } from "@/hooks/useFMPData";

function HeadlineTicker() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const { data: news } = useFMPStockNews(undefined, 15);
  const headlines = news?.map((n) => `${n.symbol}: ${n.title}`) ?? ["Loading latest headlines…"];

  return (
    <div className="relative overflow-hidden border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center">
        <div className="shrink-0 z-10 bg-primary px-3 py-2">
          <span className="text-xs font-bold text-primary-foreground tracking-wider uppercase">Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div ref={tickerRef} className="flex animate-ticker whitespace-nowrap gap-8 py-2 px-4">
            {[...headlines, ...headlines].map((h, i) => (
              <span key={i} className="text-xs font-medium text-foreground/80 shrink-0">
                <span className="text-primary mr-1">●</span>{h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function deriveSentiment(score?: number): "bullish" | "bearish" | "neutral" {
  if (score == null) return "neutral";
  if (score > 0.15) return "bullish";
  if (score < -0.15) return "bearish";
  return "neutral";
}

const sentimentConfig = {
  bullish: { color: "text-green-400", bg: "bg-green-400/10", icon: TrendingUp, label: "Bullish" },
  bearish: { color: "text-red-400", bg: "bg-red-400/10", icon: TrendingDown, label: "Bearish" },
  neutral: { color: "text-muted-foreground", bg: "bg-muted/20", icon: Minus, label: "Neutral" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type RightTab = "insider" | "congress";

export default function News() {
  const { data: newsArticles, isLoading: newsLoading } = useFMPStockNews(undefined, 25);
  const { data: insiderTrades, isLoading: tradesLoading } = useFMPInsiderTrades(15);
  const { data: senateTrades, isLoading: senateLoading } = useFMPSenateTrades(15);
  const { data: houseTrades, isLoading: houseLoading } = useFMPHouseTrades(15);
  const [rightTab, setRightTab] = useState<RightTab>("insider");

  const congressTrades = [
    ...(senateTrades?.map((t) => ({ ...t, chamber: "Senate" as const })) || []),
    ...(houseTrades?.map((t) => ({ ...t, chamber: "House" as const })) || []),
  ].sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

  return (
    <div className="-m-6">
      <HeadlineTicker />
      <div className="flex gap-0 min-h-[calc(100vh-7.5rem)]">
        {/* News Feed — 70% */}
        <div className="w-[70%] border-r border-border p-6 space-y-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-foreground tracking-tight mb-4">Latest News</h2>
          {newsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading live news…
            </div>
          ) : (
            newsArticles?.map((article, idx) => {
              const sentiment = deriveSentiment(article.sentimentScore);
              const sent = sentimentConfig[sentiment];
              const SentIcon = sent.icon;
              return (
                <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer">
                  <Card className="group cursor-pointer transition-colors hover:bg-card/80 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/70">{article.site}</span>
                            <span>•</span>
                            <span>{timeAgo(article.publishedDate)}</span>
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${sent.bg}`}>
                              <SentIcon className={`h-3 w-3 ${sent.color}`} />
                              <span className={`text-[10px] font-semibold uppercase ${sent.color}`}>{sent.label}</span>
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm text-foreground leading-snug group-hover:text-primary transition-colors">{article.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.text}</p>
                          <div className="flex items-center gap-1.5 pt-1">
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-border/50 text-foreground/60">{article.symbol}</Badge>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })
          )}
        </div>

        {/* Right panel — 30% */}
        <div className="w-[30%] p-6 overflow-y-auto">
          {/* Tab bar */}
          <div className="flex gap-1 mb-4 border-b border-border/50 pb-2">
            <button
              onClick={() => setRightTab("insider")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-t transition-colors ${rightTab === "insider" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Insider Trades
            </button>
            <button
              onClick={() => setRightTab("congress")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-t transition-colors flex items-center gap-1 ${rightTab === "congress" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Landmark className="h-3 w-3" /> Congress
            </button>
          </div>

          {rightTab === "insider" && (
            <>
              {tradesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : (
                <div className="space-y-3">
                  {insiderTrades?.map((trade, idx) => {
                    const isBuy = trade.transactionType?.toLowerCase().includes("purchase") ||
                                  trade.transactionType?.toLowerCase().includes("buy") ||
                                  trade.transactionType?.toLowerCase() === "p-purchase" ||
                                  trade.transactionType?.toLowerCase() === "a-award";
                    return (
                      <a key={idx} href={trade.link} target="_blank" rel="noopener noreferrer">
                        <Card className="border-border/50 mb-3">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-foreground">{trade.symbol}</span>
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-semibold uppercase ${isBuy ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-red-400 border-red-400/30 bg-red-400/10"}`}>
                                  {isBuy ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
                                  {isBuy ? "buy" : "sell"}
                                </Badge>
                              </div>
                              <span className="text-[10px] text-muted-foreground">{trade.transactionDate}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">
                              <span className="text-foreground/80 font-medium">{trade.reportingName}</span>
                              <span className="mx-1">•</span><span>{trade.typeOfOwner}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{trade.securitiesTransacted?.toLocaleString()} shares</span>
                              <span className="font-mono text-foreground/80">${((trade.securitiesTransacted || 0) * (trade.price || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {rightTab === "congress" && (
            <>
              {senateLoading && houseLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading congressional trades…
                </div>
              ) : congressTrades.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No congressional trades found</p>
              ) : (
                <div className="space-y-3">
                  {congressTrades.slice(0, 20).map((trade, idx) => {
                    const isBuy = trade.type?.toLowerCase().includes("purchase");
                    return (
                      <a key={idx} href={trade.link} target="_blank" rel="noopener noreferrer">
                        <Card className="border-border/50 mb-3">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-foreground">{trade.ticker || "—"}</span>
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-semibold uppercase ${isBuy ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-red-400 border-red-400/30 bg-red-400/10"}`}>
                                  {isBuy ? "buy" : "sell"}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50 text-foreground/60">
                                  {trade.chamber}
                                </Badge>
                              </div>
                              <span className="text-[10px] text-muted-foreground">{trade.transactionDate}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">
                              <span className="text-foreground/80 font-medium">{trade.firstName} {trade.lastName}</span>
                              {trade.office && <><span className="mx-1">•</span><span>{trade.office}</span></>}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground truncate mr-2">{trade.assetDescription || trade.type}</span>
                              <span className="font-mono text-foreground/80 shrink-0">{trade.amount}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
