import axios from 'axios';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const apiUrl = process.env.API_URL;

export async function GET(request: Request) {
    console.log('Auth check route invoked');

    // Получаем куки из запроса
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('access_token')?.value;
    const refreshCookie = cookieStore.get('refresh_token')?.value;

    console.log('AUTH-COOKIE:', authCookie);

    if (!authCookie) {
        console.log('No auth cookie found, returning unauthorized');
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Выполняем запрос к вашему API для проверки аутентификации
        const authResponse = await axios.get(`${apiUrl}/auth/me`, {
            headers: {
                cookie: `access_token=${authCookie};refresh_token=${refreshCookie}`,
            },
            withCredentials: true,
        });

        if (authResponse.status === 200) {
            console.log('Auth successful');
            return NextResponse.json({
                message: 'Authenticated',
                user: authResponse.data,
            });
        }
    } catch (error) {
        console.error('Auth request failed:', error);
    }

    console.log('Auth failed, returning unauthorized');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
