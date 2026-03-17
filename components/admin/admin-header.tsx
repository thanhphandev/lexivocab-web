"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { usePathname } from "next/navigation";

export function AdminHeader() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Basic heuristic to create a page title from the URL chunk
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments.length > 2 ? segments[segments.length - 1] : "Dashboard";
    const headerTitle = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace('-', ' ');

    const initials = user?.fullName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "A";

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Sidebar</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-card">
                        <AdminSidebar className="border-none w-full bg-transparent" />
                    </SheetContent>
                </Sheet>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground capitalize">Admin Portal</span>
                    <span className="opacity-50">/</span>
                    <span className="capitalize">{headerTitle}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 rounded-full flex items-center gap-2 pl-2 pr-4 bg-muted/50 hover:bg-muted">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium hidden sm:block">{user?.fullName || "Admin"}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 focus:text-red-600 cursor-pointer">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
