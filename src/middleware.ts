import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    console.log('Middleware invoked');

    const accessToken = request.cookies.get('access_token');
    const refreshToken = request.cookies.get('refresh_token');

    console.log('Access Token:', accessToken?.value.slice(0, 4) + '...' + accessToken?.value.slice(-7));
    console.log('Refresh Token:', refreshToken?.value.slice(0, 4) + '...' + refreshToken?.value.slice(-7));

    if (!accessToken || !refreshToken) {
        console.log('Missing tokens, redirecting to sign-in');
        const loginUrl = new URL('/sign-in', request.url);
        loginUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
            cookie: request.headers.get('cookie') || '',
        },
    });

    console.log('Auth response status:', authResponse.status);

    if (authResponse.status === 401) {
        console.log('Auth failed, trying refresh token');
        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                cookie: request.headers.get('cookie') || '',
            },
            body: JSON.stringify({
                refreshToken: refreshToken?.value,
            }),
        });

        if (refreshResponse.status === 204) {
            console.log('Token refreshed successfully');

            const newCookies = refreshResponse.headers.getSetCookie();

            if (!newCookies) {
                return redirectToLogin(request);
            }

            const authRefreshedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    cookie: newCookies.join('; '), // Передаем обновленные куки
                },
            });

            if (authRefreshedResponse.status === 200) {
                console.log('Auth successful, proceeding to next middleware');
                return NextResponse.next();
            }
        } else {
            return;
        }
    }

    if (authResponse.status !== 200) {
        console.log('Auth failed, redirecting to sign-in');
        const loginUrl = new URL('/sign-in', request.url);
        loginUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    console.log('Auth successful, proceeding to next middleware');
    return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
    const loginUrl = new URL('/sign-in', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ['/me/:path*'],
};

