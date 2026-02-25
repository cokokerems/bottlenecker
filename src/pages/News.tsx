import { useEffect, useRef } from "react";
import { ExternalLink, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock headline ticker data
const headlines = [
  "NVDA beats Q4 estimates with record data center revenue of $18.4B",
  "TSMC announces $40B investment in Arizona chip fabs",
  "ASML warns of China export restrictions impact on 2025 outlook",
  "AMD launches MI350 AI accelerator to compete with NVIDIA H200",
  "Samsung begins mass production of HBM4 memory chips",
  "Intel restructures foundry business, delays Ohio fab timeline",
  "Broadcom reports 220% AI revenue growth year-over-year",
  "MSFT Azure AI capacity constrained through mid-2025",
  "ARM Holdings sees 47% revenue jump driven by AI licensing",
  "SK Hynix dominates HBM3E supply with 53% market share",
];

// Mock news articles
const newsArticles = [
  {
    id: 1,
    title: "NVIDIA's Data Center Revenue Surges Past Expectations",
    source: "Reuters",
    time: "2h ago",
    summary: "NVIDIA reported record quarterly data center revenue driven by unprecedented AI chip demand. The company's H100 and upcoming B200 GPUs continue to see supply constraints as hyperscalers race to build AI infrastructure.",
    tickers: ["NVDA", "MSFT", "GOOGL"],
    sentiment: "bullish" as const,
  },
  {
    id: 2,
    title: "TSMC Expands Advanced Packaging Capacity for AI Chips",
    source: "Nikkei Asia",
    time: "4h ago",
    summary: "Taiwan Semiconductor Manufacturing Co. is investing $5B to triple its CoWoS advanced packaging capacity, a critical bottleneck in AI chip production that has limited supply of NVIDIA and AMD processors.",
    tickers: ["TSM", "NVDA", "AMD"],
    sentiment: "bullish" as const,
  },
  {
    id: 3,
    title: "ASML Faces Headwinds from Tightening China Export Controls",
    source: "Financial Times",
    time: "5h ago",
    summary: "The Dutch lithography equipment maker warned investors that expanded U.S. restrictions on semiconductor exports to China could reduce 2025 revenue by up to 10%, impacting its EUV machine orders.",
    tickers: ["ASML"],
    sentiment: "bearish" as const,
  },
  {
    id: 4,
    title: "Samsung and SK Hynix Battle for HBM Market Dominance",
    source: "Bloomberg",
    time: "7h ago",
    summary: "The race to supply High Bandwidth Memory chips for AI accelerators intensifies as Samsung ramps HBM3E production to challenge SK Hynix's market lead. Both companies are investing billions in next-gen HBM4.",
    tickers: ["SSNLF", "SKHYY"],
    sentiment: "neutral" as const,
  },
  {
    id: 5,
    title: "AMD MI350 Benchmarks Show Competitive Performance vs NVIDIA",
    source: "Tom's Hardware",
    time: "9h ago",
    summary: "Early benchmarks of AMD's MI350 AI accelerator show promising results in inference workloads, potentially offering a more cost-effective alternative to NVIDIA's H100 for certain enterprise use cases.",
    tickers: ["AMD", "NVDA"],
    sentiment: "bullish" as const,
  },
  {
    id: 6,
    title: "Intel Delays Ohio Fab as Foundry Business Restructures",
    source: "Wall Street Journal",
    time: "12h ago",
    summary: "Intel is pushing back the timeline for its $20B Ohio fabrication plant by at least a year as it reassesses its foundry strategy and focuses on improving yields at existing facilities.",
    tickers: ["INTC"],
    sentiment: "bearish" as const,
  },
  {
    id: 7,
    title: "Broadcom's AI Networking Revenue Jumps 220% YoY",
    source: "CNBC",
    time: "14h ago",
    summary: "Broadcom reported explosive growth in its AI-related networking and custom ASIC business, driven by demand from hyperscale customers building out AI data center infrastructure.",
    tickers: ["AVGO"],
    sentiment: "bullish" as const,
  },
];

// Mock insider trades
const insiderTrades = [
  {
    id: 1,
    company: "NVDA",
    insider: "Jensen Huang",
    title: "CEO",
    type: "sell" as const,
    shares: 120_000,
    price: 878.5,
    date: "Feb 24",
  },
  {
    id: 2,
    company: "AMD",
    insider: "Lisa Su",
    title: "CEO",
    type: "sell" as const,
    shares: 40_000,
    price: 172.3,
    date: "Feb 23",
  },
  {
    id: 3,
    company: "AVGO",
    insider: "Hock Tan",
    title: "CEO",
    type: "sell" as const,
    shares: 25_000,
    price: 1680.0,
    date: "Feb 22",
  },
  {
    id: 4,
    company: "TSM",
    insider: "C.C. Wei",
    title: "CEO",
    type: "buy" as const,
    shares: 50_000,
    price: 168.4,
    date: "Feb 22",
  },
  {
    id: 5,
    company: "INTC",
    insider: "Pat Gelsinger",
    title: "Former CEO",
    type: "sell" as const,
    shares: 200_000,
    price: 21.5,
    date: "Feb 21",
  },
  {
    id: 6,
    company: "MSFT",
    insider: "Satya Nadella",
    title: "CEO",
    type: "sell" as const,
    shares: 10_000,
    price: 410.2,
    date: "Feb 20",
  },
  {
    id: 7,
    company: "ASML",
    insider: "Peter Wennink",
    title: "Former CEO",
    type: "sell" as const,
    shares: 5_000,
    price: 920.0,
    date: "Feb 19",
  },
  {
    id: 8,
    company: "ARM",
    insider: "Rene Haas",
    title: "CEO",
    type: "sell" as const,
    shares: 30_000,
    price: 152.0,
    date: "Feb 19",
  },
  {
    id: 9,
    company: "MRVL",
    insider: "Matt Murphy",
    title: "CEO",
    type: "buy" as const,
    shares: 15_000,
    price: 78.3,
    date: "Feb 18",
  },
  {
    id: 10,
    company: "QCOM",
    insider: "Cristiano Amon",
    title: "CEO",
    type: "buy" as const,
    shares: 20_000,
    price: 168.9,
    date: "Feb 17",
  },
];

function HeadlineTicker() {
  const tickerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative overflow-hidden border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center">
        <div className="shrink-0 z-10 bg-primary px-3 py-2">
          <span className="text-xs font-bold text-primary-foreground tracking-wider uppercase">Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div
            ref={tickerRef}
            className="flex animate-ticker whitespace-nowrap gap-8 py-2 px-4"
          >
            {[...headlines, ...headlines].map((h, i) => (
              <span key={i} className="text-xs font-medium text-foreground/80 shrink-0">
                <span className="text-primary mr-1">●</span>
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const sentimentConfig = {
  bullish: { color: "text-green-400", bg: "bg-green-400/10", icon: TrendingUp, label: "Bullish" },
  bearish: { color: "text-red-400", bg: "bg-red-400/10", icon: TrendingDown, label: "Bearish" },
  neutral: { color: "text-muted-foreground", bg: "bg-muted/20", icon: Minus, label: "Neutral" },
};

export default function News() {
  return (
    <div className="-m-6">
      {/* Headline Ticker */}
      <HeadlineTicker />

      {/* Main content: 70/30 split */}
      <div className="flex gap-0 min-h-[calc(100vh-7.5rem)]">
        {/* News Feed — 70% */}
        <div className="w-[70%] border-r border-border p-6 space-y-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-foreground tracking-tight mb-4">Latest News</h2>
          {newsArticles.map((article) => {
            const sent = sentimentConfig[article.sentiment];
            const SentIcon = sent.icon;
            return (
              <Card
                key={article.id}
                className="group cursor-pointer transition-colors hover:bg-card/80 border-border/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/70">{article.source}</span>
                        <span>•</span>
                        <span>{article.time}</span>
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${sent.bg}`}>
                          <SentIcon className={`h-3 w-3 ${sent.color}`} />
                          <span className={`text-[10px] font-semibold uppercase ${sent.color}`}>{sent.label}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm text-foreground leading-snug group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{article.summary}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {article.tickers.map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="text-[10px] font-mono px-1.5 py-0 border-border/50 text-foreground/60"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Insider Trades — 30% */}
        <div className="w-[30%] p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-foreground tracking-tight mb-4">Insider Trades</h2>
          <div className="space-y-3">
            {insiderTrades.map((trade) => (
              <Card key={trade.id} className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{trade.company}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 font-semibold uppercase ${
                          trade.type === "buy"
                            ? "text-green-400 border-green-400/30 bg-green-400/10"
                            : "text-red-400 border-red-400/30 bg-red-400/10"
                        }`}
                      >
                        {trade.type === "buy" ? (
                          <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />
                        )}
                        {trade.type}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{trade.date}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    <span className="text-foreground/80 font-medium">{trade.insider}</span>
                    <span className="mx-1">•</span>
                    <span>{trade.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {trade.shares.toLocaleString()} shares
                    </span>
                    <span className="font-mono text-foreground/80">
                      ${(trade.shares * trade.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
