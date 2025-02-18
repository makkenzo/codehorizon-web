import ApiClient from './api-client';

class AuthApiClient extends ApiClient {
    async login(email: string, password: string) {
        return this.post<{ accessToken: string; refreshToken: string }>('/auth/login', { email, password });
    }
}

export default AuthApiClient;

