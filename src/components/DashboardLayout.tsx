import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Activity, BarChart3, GitBranch, AlertTriangle, StickyNote, Table2, Newspaper, Bot } from "lucide-react";
import ResearchDrawer from "@/components/ResearchDrawer";

const navItems = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/supply-chain", label: "Supply Chain", icon: GitBranch },
  { to: "/bottlenecks", label: "Bottlenecks", icon: AlertTriangle },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/trade-log", label: "Trade Log", icon: Table2 },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/research", label: "Research", icon: Bot },
];

export default function DashboardLayout() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center px-6 gap-8">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm tracking-tight">AI Supply Chain Intel</span>
          </div>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <ResearchDrawer />
            <span className="text-xs font-mono text-muted-foreground">MVP • Mock Data</span>
          </div>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
