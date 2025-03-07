// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    console.log('Middleware invoked');

    // Выполняем запрос к вашему API-маршруту для проверки аутентификации
    const authCheckResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/me`,
        {
            headers: {
                cookie: request.headers.get('cookie') || '',
            },
        }
    );

    if (authCheckResponse.ok) {
        console.log('Auth successful');
        return NextResponse.next();
    }

    console.log('Auth failed, redirecting to sign-in');
    return redirectToLogin(request);
}

function redirectToLogin(request: NextRequest) {
    const loginUrl = new URL('/sign-in', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ['/me/:path*'],
};
