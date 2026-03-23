import { Shield, User } from "lucide-react";

export function getRoleIcon(role: string) {
  if (role === "Admin") {
    return <Shield className="h-4 w-4 text-red-500" />;
  }
  return <User className="h-4 w-4 text-blue-500" />;
}

export function formatJoinDate(date: string | Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getUserInitials(fullName?: string) {
  return fullName?.substring(0, 2).toUpperCase() || "U";
}
