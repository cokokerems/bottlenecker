import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Activity, BarChart3, GitBranch, AlertTriangle, StickyNote, Table2, Newspaper, Bot, Menu, X,
} from "lucide-react";
import ResearchDrawer from "@/components/ResearchDrawer";
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

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center px-6 gap-4">
          {/* Logo + Dashboard always visible */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm tracking-tight">AI Supply Chain Intel</span>
          </Link>

          <NavLink to="/" label="Dashboard" icon={Activity} />

          {/* Hamburger */}
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

        {/* Dropdown nav */}
        {menuOpen && (
          <div className="absolute top-14 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md animate-fade-in">
            <nav className="flex flex-wrap gap-1 px-6 py-3">
              {navItems.filter((i) => i.to !== "/").map((item) => (
                <NavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
              ))}
            </nav>
          </div>
        )}
      </header>
      <main className="p-6">
        <Outlet />
      </main>
      {/* Overlay to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
