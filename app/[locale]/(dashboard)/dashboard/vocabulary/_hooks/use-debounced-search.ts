import { useState, useEffect } from "react";

export function useDebouncedSearch(initialValue = "", delay = 500) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, delay]);

  return { searchQuery, debouncedSearch, setSearchQuery };
}
