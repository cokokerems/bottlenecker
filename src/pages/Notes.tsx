import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote } from "lucide-react";

const STORAGE_KEY = "app-notes";

export default function Notes() {
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "";
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const save = useCallback((value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setLastSaved(new Date());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => save(value), 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <StickyNote className="h-6 w-6 text-primary" />
          Notes
        </h1>
        {lastSaved && (
          <span className="text-xs text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
      <Card>
        <CardContent className="p-4">
          <Textarea
            value={notes}
            onChange={handleChange}
            placeholder="Write your notes here... (auto-saves)"
            className="min-h-[60vh] resize-none border-none focus-visible:ring-0 bg-transparent text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
