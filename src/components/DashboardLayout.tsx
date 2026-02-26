import { useEffect, useState, useMemo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Activity, BarChart3, GitBranch, AlertTriangle, StickyNote, Table2, Newspaper, Bot, Menu, X, CalendarDays, Loader2,
} from "lucide-react";
import ResearchDrawer from "@/components/ResearchDrawer";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFMPEarningsCalendar } from "@/hooks/useFMPData";

const navItems = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/supply-chain", label: "Supply Chain", icon: GitBranch },
  { to: "/bottlenecks", label: "Bottlenecks", icon: AlertTriangle },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/trade-log", label: "Trade Log", icon: Table2 },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/research", label: "Research", icon: Bot },
];

const eventTypeStyle: Record<string, { color: string; bg: string }> = {
  earnings: { color: "text-yellow-400", bg: "bg-yellow-400/10" },
};

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Fetch 3 months of earnings calendar
  const now = new Date();
  const from = toDateKey(now);
  const toDate = new Date(now);
  toDate.setMonth(toDate.getMonth() + 3);
  const to = toDateKey(toDate);

  const { data: earningsData, isLoading: calendarLoading } = useFMPEarningsCalendar(from, to);

  // Build events map from live data
  const financialEvents = useMemo(() => {
    const map: Record<string, { label: string; ticker: string; type: string }[]> = {};
    if (!earningsData) return map;
    for (const ev of earningsData) {
      if (!ev.date || !ev.symbol) continue;
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push({
        label: `${ev.symbol} Earnings`,
        ticker: ev.symbol,
        type: "earnings",
      });
    }
    return map;
  }, [earningsData]);

  const eventDates = Object.keys(financialEvents).map((d) => new Date(d + "T00:00:00"));
  const selectedEvents = selectedDate ? financialEvents[toDateKey(selectedDate)] || [] : [];

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

              {/* Divider */}
              <div className="w-px bg-border" />

              {/* Financial Calendar */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Earnings Calendar
                </span>
                <div className="flex gap-4 mt-2">
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
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading earnings…
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
                      <p className="text-xs text-muted-foreground">No earnings scheduled.</p>
                    )}

                    {/* Upcoming events */}
                    <div className="pt-2 border-t border-border/50 mt-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Upcoming</p>
                      {Object.entries(financialEvents)
                        .filter(([d]) => new Date(d + "T00:00:00") >= new Date())
                        .slice(0, 6)
                        .map(([dateStr, events]) => (
                          <div key={dateStr} className="flex items-center justify-between text-xs py-1">
                            <span className="text-foreground/80 font-medium truncate mr-2">{events[0].label}</span>
                            <span className="text-muted-foreground font-mono text-[10px] shrink-0">
                              {new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        ))}
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
    </div>
  );
}
