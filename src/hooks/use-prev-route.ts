'use client';

import { useEffect } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const usePreservePreviousRoute = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const prev = searchParams.get('prev');
        const nextUrl = `${pathname}?prev=${encodeURIComponent(prev || window.location.href)}`;
        router.replace(nextUrl, { scroll: false });
    }, [pathname]);

    return searchParams.get('prev');
};

export default usePreservePreviousRoute;

