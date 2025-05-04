'use client';

import { ReactNode, useEffect } from 'react';

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
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import AuthApiClient from '@/server/auth';
import { useProfileStore } from '@/stores/profile/profile-store-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isPending: isAuthPending } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const hasHydrated = useHasHydrated();

    const user = useUserStore((state) => state.user);
    const clearUser = useUserStore((state) => state.clearUser);
    const { profile, clearProfile } = useProfileStore((state) => state);

    const isLoading = isAuthPending || !hasHydrated;

    const isAdmin = hasHydrated && (user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN'));
    const isMentor = hasHydrated && (user?.roles?.includes('MENTOR') || user?.roles?.includes('ROLE_MENTOR'));

    const canAccessAdminArea = isAdmin || isMentor;

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                console.log('AdminLayout: Not authenticated, redirecting to sign-in...');
                router.replace(`/sign-in?from=${encodeURIComponent(pathname)}`);
            } else if (!canAccessAdminArea) {
                console.log('AdminLayout: Not an admin or mentor, redirecting to home...');
                router.replace('/');
            } else {
                console.log('AdminLayout: Access granted (Authenticated Admin or Mentor).');
            }
        }
    }, [isLoading, isAuthenticated, canAccessAdminArea, router, pathname]);

    const handleLogout = async () => {
        clearUser();
        clearProfile();
        await new AuthApiClient().isLoggedOut();
        router.push('/sign-in');
    };

    const baseNavLinks = [
        { href: '/admin', label: 'Статистика', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Пользователи', icon: Users },
        { href: '/admin/courses', label: 'Курсы', icon: BookOpen },
        { href: '/admin/settings', label: 'Настройки', icon: Settings, disabled: true },
    ];

    const filteredNavLinks = baseNavLinks.filter((link) => {
        if (isAdmin) {
            return true;
        } else if (isMentor) {
            return link.href === '/admin/courses';
        }
        return false;
    });

    const filteredMobileNavLinks = [{ href: '/', label: 'Вернуться на сайт', icon: Home }, ...filteredNavLinks];

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !canAccessAdminArea) {
        return null;
    }

    const SidebarNav = ({ links }: { links: typeof baseNavLinks }) => (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.disabled ? '#' : link.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                            isActive && 'bg-muted/20 text-primary',
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
                        <SidebarNav links={filteredNavLinks} />
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

                                <SidebarNav links={filteredMobileNavLinks} />
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
                                    <AvatarImage src={profile.avatarUrl} alt={user?.username} />
                                ) : null}
                                <AvatarFallback>{user?.username?.substring(0, 1).toUpperCase() ?? 'A'}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 px-4 py-2" align="end">
                            <DropdownMenuLabel className="pl-0">
                                {profile?.firstName || user?.username}
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
