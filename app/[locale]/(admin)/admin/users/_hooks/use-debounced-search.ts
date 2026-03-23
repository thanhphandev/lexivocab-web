import { useState, useEffect } from "react";

export function useDebouncedSearch(delay = 500) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, delay);
    return () => clearTimeout(handler);
  }, [search, delay]);

  return { search, setSearch, debouncedSearch };
}
