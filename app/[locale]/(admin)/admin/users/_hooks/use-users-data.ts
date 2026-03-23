import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api/api-client";
import type { UserOverviewDto } from "@/lib/api/types";

export function useUsersData(page: number, search: string) {
  const [users, setUsers] = useState<UserOverviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getUsers(page, 20, search);
    if (res.success && res.data) {
      setUsers(res.data.items);
      setTotalPages(res.data.totalPages || 1);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, loading, totalPages, refetch: loadUsers };
}
