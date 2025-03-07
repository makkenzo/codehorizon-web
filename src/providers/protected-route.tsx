'use client';

import { ReactNode, useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from './auth-provider';

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isPending } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isPending && !isAuthenticated) {
            const signInUrl = `/sign-in?from=${encodeURIComponent(pathname)}`;
            router.replace(signInUrl);
        }
    }, [isPending, isAuthenticated, router]);

    if (isPending) return <p>Loading...</p>;
    if (!isAuthenticated) return null; // Показываем пустую страницу, пока идёт редирект

    return <>{children}</>;
}

