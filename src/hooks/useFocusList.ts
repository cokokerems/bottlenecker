import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "focus-list-tickers";

function loadFocusList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFocusList() {
  const [focusTickers, setFocusTickers] = useState<string[]>(loadFocusList);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(focusTickers));
  }, [focusTickers]);

  const toggleFocus = useCallback((ticker: string) => {
    setFocusTickers((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  }, []);

  const isFocused = useCallback(
    (ticker: string) => focusTickers.includes(ticker),
    [focusTickers]
  );

  return { focusTickers, toggleFocus, isFocused };
}
