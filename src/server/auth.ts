import { setAccessToken, setTokens } from '@/helpers/auth';
import { User } from '@/types';

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
            })
                .then((res) => {
                    return res.data;
                })
                .catch((error) => {
                    console.log('Ошибка получения токена', error.response?.status);
                });

            if (response) {
                setTokens({ newAccessToken: response.accessToken, newRefreshToken: response.refreshToken });
                return { access_token: response.accessToken, refresh_token: response.refreshToken };
            }
        } catch (error) {
            console.log('Ошибка получения токена', error);
        }

        return null;
    }

    async getMe() {
        try {
            const response = await this.get<User>('/auth/me')
                .then((res) => {
                    return res.data;
                })
                .catch((error) => {
                    console.log('Ошибка получения юзера', error.response?.status);
                });

            if (response) {
                return response;
            }
        } catch (error) {
            console.log('Ошибка получения юзера', error);
        }

        return null;
    }
}

export default AuthApiClient;

