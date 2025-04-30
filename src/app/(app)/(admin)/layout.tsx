'use client';

import { ReactNode, useEffect, useState } from 'react';

import { BookOpen, Home, LayoutDashboard, Loader2, LogOut, Menu, Package2, Settings, Users } from 'lucide-react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { User } from '@/models';
import { useAuth } from '@/providers/auth-provider';
import AuthApiClient from '@/server/auth';
import { useProfileStore } from '@/stores/profile/profile-store-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isPending: isAuthPending } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [hydratedUser, setHydratedUser] = useState<User | undefined>(undefined);
    const [isHydrated, setIsHydrated] = useState(false);
    const userFromStore = useUserStore((state) => state.user);
    const clearUser = useUserStore((state) => state.clearUser);
    const { profile, clearProfile } = useProfileStore((state) => state);

    useEffect(() => {
        setHydratedUser(userFromStore);
        setIsHydrated(true);
    }, [userFromStore]);

    const isLoading = isAuthPending || !isHydrated;
    const isAdmin = hydratedUser?.roles?.includes('ADMIN');

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.replace('/sign-in?from=/admin');
            } else if (!isAdmin) {
                router.replace('/');
            }
        }
    }, [isLoading, isAuthenticated, isAdmin, router]);

    const handleLogout = async () => {
        clearUser();
        clearProfile();
        await new AuthApiClient().isLoggedOut();
        router.push('/sign-in');
    };

    const navLinks = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/courses', label: 'Courses', icon: BookOpen },

        { href: '/admin/settings', label: 'Settings', icon: Settings, disabled: true },
    ];

    const mobileNavLinks = [{ href: '/', label: 'Go to Site', icon: Home }, ...navLinks];

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !isAdmin) {
        return null;
    }

    const SidebarNav = ({ links }: { links: typeof navLinks }) => (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.disabled ? '#' : link.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                            isActive && 'bg-muted text-primary',
                            link.disabled && 'cursor-not-allowed opacity-50'
                        )}
                        aria-disabled={link.disabled}
                        onClick={(e) => link.disabled && e.preventDefault()}
                    >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r border-border bg-background md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b border-border px-4 lg:h-[60px] lg:px-6">
                        <Link href="/admin" className="flex items-center gap-2 font-semibold">
                            <Package2 className="h-6 w-6 text-primary" /> {/* Иконка */}
                            <span className="">CodeHorizon Admin</span>
                        </Link>
                        {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                           <Bell className="h-4 w-4" />
                           <span className="sr-only">Toggle notifications</span>
                         </Button> */}
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <SidebarNav links={navLinks} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold mb-4">
                                    <Package2 className="h-6 w-6 text-primary" />
                                    <span>CodeHorizon Admin</span>
                                </Link>

                                <SidebarNav links={mobileNavLinks} />
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* <form>
                           <div className="relative">
                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                             <Input
                               type="search"
                               placeholder="Search admin panel..."
                               className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                             />
                           </div>
                         </form> */}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="hover:cursor-pointer lg:block hidden hover:outline-4 outline-primary outline-0 ease-in-out transition-all duration-100">
                                {profile?.avatarUrl ? (
                                    <AvatarImage src={profile.avatarUrl} alt={hydratedUser?.username} />
                                ) : null}
                                <AvatarFallback>
                                    {hydratedUser?.username?.substring(0, 1).toUpperCase() ?? 'A'}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 px-4 py-2" align="end">
                            <DropdownMenuLabel className="pl-0">
                                {profile?.firstName || hydratedUser?.username}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Settings className="size-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                <LogOut className="size-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 admin-gradient-bg overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
