"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "./_components/page-header";
import { UserStats } from "./_components/user-stats";
import { UsersTable } from "./_components/users-table";
import { Pagination } from "./_components/pagination";
import { useDebouncedSearch } from "./_hooks/use-debounced-search";
import { useUsersData } from "./_hooks/use-users-data";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch } = useDebouncedSearch();
  const { users, loading, totalPages } = useUsersData(page, debouncedSearch);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <PageHeader search={search} onSearchChange={setSearch} />

      {!loading && users.length > 0 && <UserStats users={users} />}

      <UsersTable users={users} loading={loading} />

      <Pagination
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
      />
    </div>
  );
}
