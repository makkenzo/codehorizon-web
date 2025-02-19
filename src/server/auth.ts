import { setAccessToken, setTokens } from '@/helpers/auth';

import ApiClient from './api-client';

class AuthApiClient extends ApiClient {
    async login(login: string, password: string) {
        const response = await this.post<{ accessToken: string; refreshToken: string }>('/auth/login', {
            login,
            password,
        });
        return { access_token: response.data.accessToken, refresh_token: response.data.refreshToken };
    }

    async register(username: string, email: string, password: string, confirmPassword: string) {
        return await this.post<{ accessToken: string; refreshToken: string }>('/auth/register', {
            username,
            email,
            password,
            confirmPassword,
        });
    }

    async getToken() {
        try {
            const response = await this.get<{ accessToken: string; refreshToken: string }>('/auth/token', {
                withCredentials: true,
            });

            if (response.data.accessToken && response.data.refreshToken) {
                setTokens({ newAccessToken: response.data.accessToken, newRefreshToken: response.data.refreshToken });
                return { access_token: response.data.accessToken, refresh_token: response.data.refreshToken };
            }
        } catch (error) {
            console.log('Ошибка получения токена', error);
        }

        return null;
    }
}

export default AuthApiClient;

