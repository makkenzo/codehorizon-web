import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
    private axiosInstance: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: (() => void)[] = [];
    private excludedResponsePaths = ['/auth/login', '/auth/register', '/auth/me'];

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            withCredentials: true,
        });

        this.initializeInterceptors();
    }

    private initializeInterceptors() {
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (
                    typeof originalRequest.url === 'string' &&
                    this.excludedResponsePaths.includes(originalRequest.url)
                ) {
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        await this.refreshToken();
                        this.refreshSubscribers.forEach((callback) => callback());
                        this.refreshSubscribers = [];

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

    private async refreshToken(): Promise<void> {
        if (this.isRefreshing) {
            return new Promise((resolve) => {
                this.refreshSubscribers.push(resolve);
            });
        }

        this.isRefreshing = true;
        try {
            await this.axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`);
        } catch (_) {
            this.logout();
        } finally {
            this.isRefreshing = false;
        }
    }

    private logout() {
        // const response = this.axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`);
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get(url, config);
    }

    public async post<T, D = Record<string, unknown> | FormData>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    public async put<T, D = Record<string, unknown> | FormData>(
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
