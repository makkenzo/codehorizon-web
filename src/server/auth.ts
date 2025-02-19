import { setAccessToken } from '@/helpers/auth';

import ApiClient from './api-client';

class AuthApiClient extends ApiClient {
    async login(login: string, password: string) {
        return await this.post<{ accessToken: string; refreshToken: string }>('/auth/login', { login, password });
    }

    async register(username: string, email: string, password: string, confirmPassword: string) {
        return await this.post<{ accessToken: string; refreshToken: string }>('/auth/register', {
            username,
            email,
            password,
            confirmPassword,
        });
    }

    async getToken(): Promise<string | null> {
        try {
            const response = await this.get<{ access_token: string }>('/auth/token', { withCredentials: true });

            if (response.data.access_token) {
                setAccessToken(response.data.access_token);
                return response.data.access_token;
            }
        } catch (error) {
            console.log('Ошибка получения токена', error);
        }

        return null;
    }
}

export default AuthApiClient;

