import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Trade {
  id: string;
  date: string;
  symbol: string;
  bought: number | null;
  sold: number | null;
  pnl: number | null;
  comments: string;
}

const STORAGE_KEY = "app-trade-log";

function createTrade(): Trade {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    symbol: "",
    bought: null,
    sold: null,
    pnl: null,
    comments: "",
  };
}

function calcPnl(bought: number | null, sold: number | null): number | null {
  if (bought != null && sold != null) return sold - bought;
  return null;
}

export default function TradeLog() {
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  const addRow = () => setTrades((prev) => [...prev, createTrade()]);

  const deleteRow = (id: string) =>
    setTrades((prev) => prev.filter((t) => t.id !== id));

  const updateTrade = useCallback(
    (id: string, field: keyof Trade, value: string | number | null) => {
      setTrades((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const updated = { ...t, [field]: value };
          if (field === "bought" || field === "sold") {
            updated.pnl = calcPnl(updated.bought, updated.sold);
          }
          return updated;
        })
      );
    },
    []
  );

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Table2 className="h-6 w-6 text-primary" />
          Trade Log
        </h1>
        <Button size="sm" onClick={addRow}>
          <Plus className="h-4 w-4 mr-1" /> Add Trade
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead className="w-[100px]">Symbol</TableHead>
              <TableHead className="w-[110px]">Bought</TableHead>
              <TableHead className="w-[110px]">Sold</TableHead>
              <TableHead className="w-[160px]">P&L</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No trades yet. Click "Add Trade" to get started.
                </TableCell>
              </TableRow>
            )}
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>
                  <DateCell
                    value={trade.date}
                    onChange={(v) => updateTrade(trade.id, "date", v)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={trade.symbol}
                    onChange={(e) =>
                      updateTrade(trade.id, "symbol", e.target.value.toUpperCase())
                    }
                    placeholder="NVDA"
                    className="h-8 bg-transparent border-none px-1 uppercase font-mono"
                  />
                </TableCell>
                <TableCell>
                  <NumericInput
                    value={trade.bought}
                    onChange={(v) => updateTrade(trade.id, "bought", v)}
                  />
                </TableCell>
                <TableCell>
                  <NumericInput
                    value={trade.sold}
                    onChange={(v) => updateTrade(trade.id, "sold", v)}
                  />
                </TableCell>
                <TableCell>
                  {trade.pnl != null ? (
                    <span
                      className={cn(
                        "font-mono text-sm",
                        trade.pnl > 0 && "text-green-500",
                        trade.pnl < 0 && "text-red-500"
                      )}
                    >
                      {trade.pnl.toFixed(2)}
                      {trade.bought != null && trade.bought !== 0 && (
                        <span className="ml-1.5 text-xs opacity-70">
                          ({((trade.pnl / trade.bought) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="font-mono text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    value={trade.comments}
                    onChange={(e) =>
                      updateTrade(trade.id, "comments", e.target.value)
                    }
                    placeholder="Notes..."
                    className="h-8 bg-transparent border-none px-1"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteRow(trade.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {trades.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  Total P&L
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      totalPnl > 0 && "text-green-500",
                      totalPnl < 0 && "text-red-500"
                    )}
                  >
                    {totalPnl.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
}

function NumericInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <Input
      type="number"
      step="0.01"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : parseFloat(e.target.value))
      }
      placeholder="0.00"
      className="h-8 bg-transparent border-none px-1 font-mono"
    />
  );
}

function DateCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const date = value ? new Date(value + "T00:00:00") : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-8 w-full justify-start px-1 font-mono text-sm",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-3 w-3 mr-1" />
          {date ? format(date, "yyyy-MM-dd") : "Pick date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) onChange(format(d, "yyyy-MM-dd"));
          }}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
