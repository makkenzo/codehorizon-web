'use client';

import { ReactNode, useEffect, useMemo } from 'react';

import {
    BarChart3,
    BookOpen,
    Home,
    LayoutDashboard,
    Loader2,
    LogOut,
    Package2,
    Settings,
    ShieldAlert,
    Users,
} from 'lucide-react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import AdminMobileMenu from '@/components/navigation/admin-mobile-menu';
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
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import AuthApiClient from '@/server/auth';
import { useProfileStore } from '@/stores/profile/profile-store-provider';
import { useUserStore } from '@/stores/user/user-store-provider';
import { NavItem } from '@/types';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isPending: isAuthPending } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const hasHydrated = useHasHydrated();
    const { hasPermission } = usePermissions();

    const user = useUserStore((state) => state.user);
    const clearUser = useUserStore((state) => state.clearUser);
    const { profile, clearProfile } = useProfileStore((state) => state);

    const isLoading = isAuthPending || !hasHydrated;

    const isAdmin = hasHydrated && (user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN'));
    const isMentor = hasHydrated && (user?.roles?.includes('MENTOR') || user?.roles?.includes('ROLE_MENTOR'));

    const canAccessAdminArea = useMemo(() => isAdmin || isMentor, [isAdmin, isMentor]);

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
        router.replace('/sign-in');
    };

    const baseNavLinks = useMemo(
        () =>
            [
                isAdmin || isMentor
                    ? { id: 'admin-dash', href: '/admin', label: 'Статистика', icon: LayoutDashboard }
                    : null,
                isAdmin || isMentor
                    ? {
                          id: 'my-course-analytics',
                          href: '/admin/my-analytics',
                          label: 'Моя аналитика',
                          icon: BarChart3,
                      }
                    : null,
                hasPermission('user:admin:read:any')
                    ? { id: 'admin-users', href: '/admin/users', label: 'Пользователи', icon: Users }
                    : null,
                hasPermission('course:read:list:all') || hasPermission('course:read:list:own_created')
                    ? { id: 'admin-courses', href: '/admin/courses', label: 'Курсы', icon: BookOpen }
                    : null,
                hasPermission('mentorship_application:admin:read:any')
                    ? {
                          id: 'admin-mentor-apps',
                          href: '/admin/mentorship-applications',
                          label: 'Заявки на менторство',
                          icon: ShieldAlert,
                      }
                    : null,
            ].filter(Boolean) as NavItem[],
        [isAdmin, isMentor, hasPermission]
    );

    const filteredNavLinks = useMemo(
        () =>
            baseNavLinks.filter((link) => {
                if (isAdmin) return true;
                if (isMentor) return link?.href === '/admin/courses' || link?.href === '/admin/my-analytics';
                return false;
            }),
        [isAdmin, isMentor, baseNavLinks]
    );

    const filteredMobileNavLinks = useMemo(
        () => [{ id: 'back-to-site', href: '/', label: 'Вернуться на сайт', icon: Home }, ...filteredNavLinks],
        [filteredNavLinks]
    );

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
                if (!link) return null;

                const isActive = pathname === link?.href;
                const IconComponent = link.icon;

                return (
                    <Link
                        key={link.href}
                        href={link.href ?? '#'}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                            isActive && 'bg-muted/20 text-primary'
                        )}
                    >
                        {IconComponent && typeof IconComponent !== 'string' && <IconComponent className="h-4 w-4" />}
                        {link?.label}
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
                            <Package2 className="h-6 w-6 text-primary" />
                            <span className="">CodeHorizon Admin</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <SidebarNav links={filteredNavLinks} />
                    </div>
                    <div className="mt-auto p-4 border-t">
                        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Выйти
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                    <AdminMobileMenu navLinks={filteredMobileNavLinks} />

                    <div className="w-full flex-1"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="hover:cursor-pointer h-8 w-8 hover:outline-4 outline-primary outline-0 ease-in-out transition-all duration-100">
                                {profile?.avatarUrl ? (
                                    <AvatarImage src={profile.avatarUrl} alt={user?.username || 'User'} />
                                ) : null}
                                <AvatarFallback>{user?.username?.substring(0, 1).toUpperCase() ?? 'A'}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 px-4 py-2" align="end">
                            <DropdownMenuLabel className="pl-0">
                                {profile?.firstName || user?.username || 'Мой аккаунт'}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/me/profile">
                                <DropdownMenuItem>
                                    <Settings className="mr-2 size-4" />
                                    Настройки профиля
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/">
                                <DropdownMenuItem>
                                    <Home className="mr-2 size-4" />
                                    Вернуться на сайт
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                <LogOut className="mr-2 size-4" />
                                Выйти
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
