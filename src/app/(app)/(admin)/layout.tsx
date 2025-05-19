'use client';

import { ReactNode, useEffect, useMemo } from 'react';

import {
    Award,
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

const SidebarNav = ({ links }: { links: NavItem[] }) => {
    const pathname = usePathname();

    return (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            {links.map((link) => {
                if (!link) return null;

                const isActive = pathname === link?.href;
                const IconComponent = link.icon;

                return (
                    <Link
                        key={link.href}
                        href={link.href ?? '#'}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary relative group overflow-hidden',
                            isActive
                                ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-medium'
                                : 'hover:bg-background/60'
                        )}
                    >
                        <span
                            className={cn(
                                'absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100',
                                isActive && 'opacity-100'
                            )}
                        ></span>
                        {IconComponent && typeof IconComponent !== 'string' && (
                            <div className="relative z-10 flex items-center justify-center">
                                <IconComponent className={cn('h-4 w-4', isActive && 'text-primary')} />
                            </div>
                        )}
                        <span className="relative z-10">{link?.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

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
                hasPermission('achievement:admin:manage')
                    ? { id: 'admin-achievements', href: '/admin/achievements', label: 'Достижения', icon: Award }
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
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background to-background/80">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                    <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !canAccessAdminArea) {
        return null;
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-gradient-to-br from-background to-background/80">
            <div className="hidden border-r border-border/40 backdrop-blur-sm bg-background/80 md:block relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
                <div className="flex h-full max-h-screen flex-col gap-2 relative z-10">
                    <div className="flex h-14 items-center border-b border-border/40 px-4 lg:h-[60px] lg:px-6 backdrop-blur-sm bg-background/60">
                        <Link href="/admin" className="flex items-center gap-2 font-semibold">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full"></div>
                                <Package2 className="h-6 w-6 text-primary relative z-10" />
                            </div>
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                CodeHorizon Admin
                            </span>
                        </Link>
                    </div>
                    <SidebarNav links={baseNavLinks} />
                </div>
            </div>

            <div className="flex flex-col outline-hidden">
                <header className="flex h-14 items-center gap-4 border-b border-border/40 backdrop-blur-sm bg-background/60 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                    <AdminMobileMenu navLinks={filteredMobileNavLinks} />

                    <div className="w-full flex-1"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="hover:cursor-pointer h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200 ease-in-out">
                                {profile?.avatarUrl ? (
                                    <AvatarImage
                                        src={profile.avatarUrl || '/placeholder.svg'}
                                        alt={user?.username || 'User'}
                                    />
                                ) : null}
                                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-secondary/80 text-white">
                                    {user?.username?.substring(0, 1).toUpperCase() ?? 'A'}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 px-4 py-2 backdrop-blur-sm bg-background/90 border-border/40"
                            align="end"
                        >
                            <DropdownMenuLabel className="pl-0 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {profile?.firstName || user?.username || 'Мой аккаунт'}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/40" />
                            <Link href="/me/profile">
                                <DropdownMenuItem className="hover:bg-primary/5 focus:bg-primary/5">
                                    <Settings className="mr-2 size-4" />
                                    Настройки профиля
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/">
                                <DropdownMenuItem className="hover:bg-primary/5 focus:bg-primary/5">
                                    <Home className="mr-2 size-4" />
                                    Вернуться на сайт
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator className="bg-border/40" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/5 focus:bg-destructive/5"
                            >
                                <LogOut className="mr-2 size-4" />
                                Выйти
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none"></div>
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">{children}</div>
                </main>
            </div>
        </div>
    );
}
