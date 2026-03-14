import { AuthProvider } from "@/lib/auth/auth-context";

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>{children}</div>
    );
}
