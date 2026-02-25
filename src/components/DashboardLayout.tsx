import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Activity, BarChart3, GitBranch, AlertTriangle, StickyNote, Table2, Newspaper, Bot, Menu, X, CalendarDays,
} from "lucide-react";
import ResearchDrawer from "@/components/ResearchDrawer";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/supply-chain", label: "Supply Chain", icon: GitBranch },
  { to: "/bottlenecks", label: "Bottlenecks", icon: AlertTriangle },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/trade-log", label: "Trade Log", icon: Table2 },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/research", label: "Research", icon: Bot },
];

const financialEvents: Record<string, { label: string; ticker: string; type: "earnings" | "dividend" | "conference" | "report" }[]> = {
  "2026-02-26": [{ label: "NVDA Q4 Earnings", ticker: "NVDA", type: "earnings" }],
  "2026-02-27": [{ label: "AMD Investor Day", ticker: "AMD", type: "conference" }],
  "2026-03-01": [{ label: "AVGO Q1 Earnings", ticker: "AVGO", type: "earnings" }],
  "2026-03-04": [{ label: "TSM Dividend Ex-Date", ticker: "TSM", type: "dividend" }],
  "2026-03-06": [{ label: "ASML Annual Report", ticker: "ASML", type: "report" }],
  "2026-03-10": [{ label: "INTC Q1 Earnings", ticker: "INTC", type: "earnings" }],
  "2026-03-12": [{ label: "ARM Q3 Earnings", ticker: "ARM", type: "earnings" }],
  "2026-03-15": [{ label: "MSFT Dividend Ex-Date", ticker: "MSFT", type: "dividend" }],
  "2026-03-18": [{ label: "MRVL Q4 Earnings", ticker: "MRVL", type: "earnings" }],
  "2026-03-20": [{ label: "QCOM AI Summit", ticker: "QCOM", type: "conference" }],
  "2026-03-25": [{ label: "NVDA 10-K Filing", ticker: "NVDA", type: "report" }],
  "2026-04-01": [{ label: "TSM Q1 Earnings", ticker: "TSM", type: "earnings" }],
  "2026-04-08": [{ label: "Samsung Q1 Report", ticker: "SSNLF", type: "report" }],
};

const eventTypeStyle: Record<string, { color: string; bg: string }> = {
  earnings: { color: "text-yellow-400", bg: "bg-yellow-400/10" },
  dividend: { color: "text-green-400", bg: "bg-green-400/10" },
  conference: { color: "text-blue-400", bg: "bg-blue-400/10" },
  report: { color: "text-purple-400", bg: "bg-purple-400/10" },
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
            <span className="text-xs font-mono text-muted-foreground">MVP • Mock Data</span>
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
                  <CalendarDays className="h-3 w-3" /> Financial Calendar
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
                    {selectedEvents.length > 0 ? (
                      selectedEvents.map((ev, i) => {
                        const s = eventTypeStyle[ev.type];
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
                        .slice(0, 4)
                        .map(([dateStr, events]) => (
                          <div key={dateStr} className="flex items-center justify-between text-xs py-1">
                            <span className="text-foreground/80 font-medium">{events[0].label}</span>
                            <span className="text-muted-foreground font-mono text-[10px]">
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
