import ApiClient from './api-client';

class AuthApiClient extends ApiClient {
    async login(login: string, password: string) {
        return this.post<{ accessToken: string; refreshToken: string }>('/auth/login', { login, password });
    }

    async register(username: string, email: string, password: string, confirmPassword: string) {
        return this.post<{ accessToken: string; refreshToken: string }>('/auth/register', {
            username,
            email,
            password,
            confirmPassword,
        });
    }
}

export default AuthApiClient;

