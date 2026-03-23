import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { UserOverviewDto } from "@/lib/api/types";
import { getRoleIcon, formatJoinDate, getUserInitials } from "../_utils/user-helpers";

interface UsersTableProps {
  users: UserOverviewDto[];
  loading: boolean;
}

export function UsersTable({ users, loading }: UsersTableProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Provider</TableHead>
              <TableHead className="text-right font-semibold">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-10 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-6 w-24 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Provider</TableHead>
              <TableHead className="text-right font-semibold">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-72">
                <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                  <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                    <Users className="h-10 w-10 opacity-40" />
                  </div>
                  <p className="font-semibold text-lg text-foreground">No users found</p>
                  <p className="text-sm mt-1 max-w-sm text-center">
                    Try adjusting your search query or check back later.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Provider</TableHead>
            <TableHead className="text-right font-semibold">Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow
              key={u.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/admin/users/${u.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                    {getUserInitials(u.fullName)}
                  </div>
                  <div>
                    <div className="font-medium">{u.fullName}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getRoleIcon(u.role)}
                  <span className="font-medium">{u.role}</span>
                </div>
              </TableCell>
              <TableCell>
                {u.isActive ? (
                  <Badge
                    variant="outline"
                    className="border-green-500/30 bg-green-500/10 text-green-600"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-red-500/30 bg-red-500/10 text-red-600"
                  >
                    Banned
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {u.authProvider || "Local"}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {formatJoinDate(u.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
