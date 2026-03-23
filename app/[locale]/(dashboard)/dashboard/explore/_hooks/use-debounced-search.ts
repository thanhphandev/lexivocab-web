import { useState, useEffect } from "react";

export function useDebouncedSearch(searchQuery: string, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedValue("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedValue(searchQuery);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, delay]);

  return debouncedValue;
}
