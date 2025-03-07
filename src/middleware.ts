import axios from 'axios';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const apiUrl = process.env.API_URL;

export async function middleware(request: NextRequest) {
    console.log('Middleware invoked');

    // Получаем куку из запроса
    const authCookie = request.cookies.get('access_token')?.value;
    const refreshCookie = request.cookies.get('refresh_token')?.value;
    console.log('ALL:', request.cookies.getAll());
    console.log('AUTH-COOKIE:', authCookie);

    if (!authCookie) {
        console.log('No auth cookie found, redirecting to sign-in');
        return redirectToLogin(request);
    }

    try {
        const authResponse = await axios.get(`${apiUrl}/auth/me`, {
            headers: {
                cookie: `access_token=${authCookie};refresh_token=${refreshCookie}`,
            },
            withCredentials: true,
        });

        if (authResponse.status === 200) {
            console.log('Auth successful');
            return NextResponse.next();
        }
    } catch (error) {
        console.error('Auth request failed:');
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

