import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from '@/helpers/auth';

class ApiClient {
    private axiosInstance: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
        });

        this.initializeInterceptors();
    }

    private initializeInterceptors() {
        this.axiosInstance.interceptors.request.use((config) => {
            const token = getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newToken = await this.refreshToken();
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        console.error('Не удалось обновить токен', refreshError);
                        this.logout();
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    private async refreshToken(): Promise<string> {
        if (this.isRefreshing) {
            return new Promise((resolve) => {
                this.refreshSubscribers.push(resolve);
            });
        }

        this.isRefreshing = true;
        try {
            const currentRefreshToken = getRefreshToken();
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
                refreshToken: currentRefreshToken,
            });
            const newAccessToken = response.data.accessToken;
            setAccessToken(newAccessToken);

            this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
            this.refreshSubscribers = [];

            return newAccessToken;
        } catch (error) {
            this.logout();
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    private logout() {
        clearTokens();
        window.location.href = '/login';
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get(url, config);
    }

    public async post<T, D = Record<string, unknown>>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    public async put<T, D = Record<string, unknown>>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T, AxiosResponse<T>, D>(url, data, config);
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete(url, config);
    }
}

export const apiClient = new ApiClient();
export default ApiClient;

