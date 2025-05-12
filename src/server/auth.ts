import { User } from '@/models';

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

    async getMe() {
        try {
            const response = await this.get<User>('/auth/me');
            return response.data;
        } catch (error) {
            console.log('Ошибка получения текущего пользователя', (error as any).response?.status);
            return null;
        }
    }

    async isLoggedOut() {
        try {
            const response = await this.delete<string>('/auth/session', {
                withCredentials: true,
            })
                .then((res) => {
                    return res.data;
                })
                .catch((error) => {
                    console.log('Ошибка выхода', error.response?.status);
                });

            if (response) {
                return true;
            }
        } catch (error) {
            console.log('Ошибка выхода', error);
        }

        return false;
    }

    async isLoginExists(login: string) {
        try {
            const response = await this.post<{ message: string }>('/auth/reset-password/check-login', { login })
                .then((res) => {
                    return res.data;
                })
                .catch((error) => {
                    console.log('Пользователь не найден', error.response?.status);
                });

            if (response) {
                return true;
            }
        } catch (error) {
            console.log('Ошибка проверки логина', error);
        }

        return false;
    }

    async resetPassword(token: string, password: string, confirmPassword: string) {
        try {
            const response = await this.post<{ access_token: string; refresh_token: string }>(
                '/auth/reset-password',
                { password, confirmPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            )
                .then((res) => {
                    return res.data;
                })
                .catch((error) => {
                    console.log('Пользователь не найден', error.response?.status);
                });

            if (response) {
                return true;
            }
        } catch (error) {
            console.log('Ошибка проверки логина', error);
        }

        return false;
    }
}

export default AuthApiClient;
