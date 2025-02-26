import axios from 'axios';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    console.log('Middleware invoked');

    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    const cookies = request.headers.get('cookie') || '';

    try {
        // 1. Проверяем токен
        const authResponse = await axios.get(`${apiUrl}/auth/me`, {
            headers: { cookie: cookies },
            withCredentials: true,
        });

        console.log('Auth successful, proceeding to next middleware');
        return NextResponse.next();
    } catch (authError: any) {
        if (authError.response?.status === 401) {
            console.log('Auth failed, trying refresh token');

            try {
                // 2. Рефреш токена
                const refreshResponse = await axios.post(
                    `${apiUrl}/auth/refresh-token`,
                    {},
                    {
                        headers: { cookie: cookies },
                        withCredentials: true,
                    }
                );

                if (refreshResponse.status === 204) {
                    console.log('Token refreshed successfully');

                    // 3. Берем новые куки из ответа
                    const newCookies = refreshResponse.headers['set-cookie'];
                    if (!newCookies) {
                        console.log('New cookies not received after refresh, redirecting to login');
                        return redirectToLogin(request);
                    }

                    // 4. Повторный запрос с обновленными куками
                    const authRefreshedResponse = await axios.get(`${apiUrl}/auth/me`, {
                        headers: { cookie: newCookies.join('; ') },
                        withCredentials: true,
                    });

                    if (authRefreshedResponse.status === 200) {
                        console.log('Auth successful after refresh, proceeding to next middleware');
                        return NextResponse.next();
                    }
                }
            } catch (refreshError) {
                console.log('Token refresh failed:', refreshError);
            }
        }

        console.log('Auth failed, logging out and redirecting to sign-in');

        // 5. Выход из системы
        try {
            await axios.post(`${apiUrl}/auth/logout`, {}, { headers: { cookie: cookies }, withCredentials: true });
        } catch (logoutError) {
            console.log('Logout failed:', logoutError);
        }

        return redirectToLogin(request);
    }
}

// Функция для редиректа на логин
function redirectToLogin(request: NextRequest) {
    const loginUrl = new URL('/sign-in', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ['/me/:path*'],
};

