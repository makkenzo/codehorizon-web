import ApiClient from './api-client';

class AuthApiClient extends ApiClient {
    async login(login: string, password: string) {
        return this.post<{ accessToken: string; refreshToken: string }>('/auth/login', { login, password });
    }
}

export default AuthApiClient;

