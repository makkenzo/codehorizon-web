'use client';

import { ReactNode, useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { User } from '@/models';
import { useAuth } from '@/providers/auth-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isPending: isAuthPending } = useAuth();
    const router = useRouter();

    const [hydratedUser, setHydratedUser] = useState<User | undefined>(undefined);
    const [isHydrated, setIsHydrated] = useState(false);

    const userFromStore = useUserStore((state) => state.user);

    useEffect(() => {
        console.log('AdminLayout Hydration Effect: Running...');
        console.log('AdminLayout Hydration Effect: userFromStore:', userFromStore);
        setHydratedUser(userFromStore);
        setIsHydrated(true);
        console.log('AdminLayout Hydration Effect: Hydrated state set.');
    }, [userFromStore]);

    const isLoading = isAuthPending || !isHydrated;
    const isAdmin = hydratedUser?.roles?.includes('ADMIN');

    console.log('AdminLayout Render:', {
        isLoading,
        isAuthPending,
        isHydrated,
        isAuthenticated,
        isAdmin,
        hydratedUser,
    });

    useEffect(() => {
        console.log('AdminLayout Redirect Effect: Running...');
        console.log('AdminLayout Redirect Effect: State:', { isLoading, isAuthenticated, isAdmin });
        if (!isLoading) {
            if (!isAuthenticated) {
                console.log('AdminLayout Redirect Effect: Redirecting to /sign-in');
                router.replace('/sign-in?from=/admin');
            } else if (!isAdmin) {
                console.log('AdminLayout Redirect Effect: Redirecting to /');
                router.replace('/');
            } else {
                console.log('AdminLayout Redirect Effect: User is authenticated admin. No redirect.');
            }
        } else {
            console.log('AdminLayout Redirect Effect: Still loading, no redirect check.');
        }
    }, [isLoading, isAuthenticated, isAdmin, router]);

    if (isLoading) {
        console.log('AdminLayout Rendering: Loader');
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !isAdmin) {
        console.log('AdminLayout Rendering: Null (redirecting or not admin)');
        return null;
    }

    console.log('AdminLayout Rendering: Main Content');
    return (
        <div className="admin-layout">
            <aside className="fixed left-0 top-0 h-full w-64 bg-gray-100 p-4 dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold">Admin Panel</h2>
                <nav>
                    <ul>
                        <li className="mb-2">
                            <a href="/admin/users" className="text-blue-600 hover:underline dark:text-blue-400">
                                Users
                            </a>
                        </li>
                        <li className="mb-2">
                            <a href="/admin/courses" className="text-blue-600 hover:underline dark:text-blue-400">
                                Courses
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main>{children}</main>
        </div>
    );
}
