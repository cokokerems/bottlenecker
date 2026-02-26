import { useEffect, useState, useMemo, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Activity, BarChart3, GitBranch, AlertTriangle, StickyNote, Table2, Newspaper, Bot, Menu, X, CalendarDays, Loader2, Search, GitCompareArrows,
} from "lucide-react";
import ResearchDrawer from "@/components/ResearchDrawer";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFMPEarningsCalendar, useFMPIpoCalendar, useFMPDividendCalendar, useFMPStockSplitCalendar, useFMPTickerSearch } from "@/hooks/useFMPData";

const navItems = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/supply-chain", label: "Supply Chain", icon: GitBranch },
  { to: "/bottlenecks", label: "Bottlenecks", icon: AlertTriangle },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/trade-log", label: "Trade Log", icon: Table2 },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/research", label: "Research", icon: Bot },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
];

const eventTypeStyle: Record<string, { color: string; bg: string; label: string }> = {
  earnings: { color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Earnings" },
  ipo: { color: "text-blue-400", bg: "bg-blue-400/10", label: "IPO" },
  dividend: { color: "text-green-400", bg: "bg-green-400/10", label: "Dividend" },
  split: { color: "text-purple-400", bg: "bg-purple-400/10", label: "Split" },
};

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { document.documentElement.classList.add("dark"); }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: searchResults } = useFMPTickerSearch(debouncedQuery, 8);

  // Calendar dates: 3 months
  const now = new Date();
  const from = toDateKey(now);
  const toDate = new Date(now);
  toDate.setMonth(toDate.getMonth() + 3);
  const to = toDateKey(toDate);

  const { data: earningsData, isLoading: calendarLoading } = useFMPEarningsCalendar(from, to);
  const { data: ipoData } = useFMPIpoCalendar(from, to);
  const { data: dividendData } = useFMPDividendCalendar(from, to);
  const { data: splitData } = useFMPStockSplitCalendar(from, to);

  const financialEvents = useMemo(() => {
    const map: Record<string, { label: string; ticker: string; type: string }[]> = {};
    const addEvent = (date: string, label: string, ticker: string, type: string) => {
      if (!date || !ticker) return;
      if (!map[date]) map[date] = [];
      map[date].push({ label, ticker, type });
    };
    earningsData?.forEach((ev) => addEvent(ev.date, `${ev.symbol} Earnings`, ev.symbol, "earnings"));
    ipoData?.forEach((ev) => addEvent(ev.date, `${ev.symbol || ev.company} IPO`, ev.symbol || "—", "ipo"));
    dividendData?.forEach((ev) => addEvent(ev.date, `${ev.symbol} Dividend`, ev.symbol, "dividend"));
    splitData?.forEach((ev) => addEvent(ev.date, `${ev.symbol} Split ${ev.numerator}:${ev.denominator}`, ev.symbol, "split"));
    return map;
  }, [earningsData, ipoData, dividendData, splitData]);

  const eventDates = Object.keys(financialEvents).map((d) => new Date(d + "T00:00:00"));
  const selectedEvents = selectedDate ? financialEvents[toDateKey(selectedDate)] || [] : [];

  const handleSearchSelect = useCallback((symbol: string) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(`/company/${symbol.toLowerCase()}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center px-6 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm tracking-tight">AI Supply Chain Intel</span>
          </Link>

          <NavLink to="/" label="Dashboard" icon={Activity} />

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Ticker Search */}
          <div className="relative ml-2 flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search ticker…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="h-8 pl-8 text-xs bg-card border-border/50"
            />
            {searchOpen && debouncedQuery.length >= 1 && searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => handleSearchSelect(r.symbol)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-accent/50 transition-colors text-left"
                  >
                    <div>
                      <span className="font-mono font-bold text-foreground">{r.symbol}</span>
                      <span className="text-muted-foreground ml-2 truncate">{r.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{r.exchangeShortName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <ResearchDrawer />
            <span className="text-xs font-mono text-muted-foreground">Live FMP Data</span>
          </div>
        </div>

        {/* Dropdown: nav + calendar */}
        {menuOpen && (
          <div className="absolute top-14 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md animate-fade-in">
            <div className="flex gap-6 px-6 py-4">
              {/* Nav links */}
              <nav className="flex flex-col gap-1 shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Navigation</span>
                {navItems.filter((i) => i.to !== "/").map((item) => (
                  <NavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
                ))}
              </nav>

              <div className="w-px bg-border" />

              {/* Financial Calendar */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Financial Calendar
                </span>
                {/* Legend */}
                <div className="flex gap-3 mt-1 mb-2">
                  {Object.entries(eventTypeStyle).map(([key, s]) => (
                    <span key={key} className={`text-[10px] font-semibold ${s.color} flex items-center gap-1`}>
                      <span className={`w-2 h-2 rounded-full ${s.bg} border ${s.color.replace("text-", "border-")}`} />
                      {s.label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className={cn("p-2 pointer-events-auto")}
                    modifiers={{ event: eventDates }}
                    modifiersClassNames={{ event: "bg-primary/20 text-primary font-bold rounded-full" }}
                  />
                  <div className="flex-1 min-w-0 space-y-2 pt-1">
                    <p className="text-xs font-medium text-foreground/70">
                      {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    {calendarLoading ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading events…
                      </div>
                    ) : selectedEvents.length > 0 ? (
                      selectedEvents.slice(0, 8).map((ev, i) => {
                        const s = eventTypeStyle[ev.type] || eventTypeStyle.earnings;
                        return (
                          <div key={i} className={`flex items-center justify-between rounded-md px-3 py-2 ${s.bg}`}>
                            <div>
                              <p className={`text-xs font-semibold ${s.color}`}>{ev.label}</p>
                              <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 mt-0.5 border-border/50 text-foreground/60">{ev.ticker}</Badge>
                            </div>
                            <span className={`text-[10px] font-semibold uppercase ${s.color}`}>{ev.type}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-muted-foreground">No events scheduled.</p>
                    )}

                    {/* Upcoming events */}
                    <div className="pt-2 border-t border-border/50 mt-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Upcoming</p>
                      {Object.entries(financialEvents)
                        .filter(([d]) => new Date(d + "T00:00:00") >= new Date())
                        .slice(0, 6)
                        .map(([dateStr, events]) => {
                          const s = eventTypeStyle[events[0].type] || eventTypeStyle.earnings;
                          return (
                            <div key={dateStr} className="flex items-center justify-between text-xs py-1">
                              <span className={`font-medium truncate mr-2 ${s.color}`}>{events[0].label}</span>
                              <span className="text-muted-foreground font-mono text-[10px] shrink-0">
                                {new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="p-6">
        <Outlet />
      </main>
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
      {searchOpen && debouncedQuery.length >= 1 && (
        <div className="fixed inset-0 z-30" onClick={() => setSearchOpen(false)} />
      )}
    </div>
  );
}
