// import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// import { useAuthStore } from '@/stores/auth-store-provider';

// class ApiClient {
//     private axiosInstance: AxiosInstance;
//     private isRefreshing = false;
//     private refreshSubscribers: ((token: string) => void)[] = [];

//     constructor() {
//         this.axiosInstance = axios.create({
//             baseURL: process.env.NEXT_PUBLIC_API_URL,
//         });

//         this.initializeInterceptors();
//     }

//     private initializeInterceptors() {
//         this.axiosInstance.interceptors.request.use((config) => {
//             const accessToken = useAuthStore((state) => state.accessToken);
//             if (accessToken && config.headers) {
//                 config.headers.Authorization = `Bearer ${accessToken}`;
//             }
//             return config;
//         });

//         this.axiosInstance.interceptors.response.use(
//             (response) => response,
//             async (error) => {
//                 const originalRequest = error.config;

//                 if (error.response?.status === 401 && !originalRequest._retry) {
//                     originalRequest._retry = true;

//                     try {
//                         const newAccessToken = await this.refreshToken();
//                         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//                         return this.axiosInstance(originalRequest);
//                     } catch (refreshError) {
//                         console.error('Failed to refresh token', refreshError);
//                         this.logout();
//                         return Promise.reject(error);
//                     }
//                 }
//                 return Promise.reject(error);
//             }
//         );
//     }

//     private async refreshToken(): Promise<string> {
//         if (this.isRefreshing) {
//             return new Promise((resolve) => {
//                 this.refreshSubscribers.push(resolve);
//             });
//         }

//         this.isRefreshing = true;

//         try {
//             const refreshToken = useAuthStore((state) => state.refreshToken);
//             const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
//                 refreshToken,
//             });
//             const newAccessToken = response.data.accessToken;

//             useAuthStore((state) => state.setAccessToken)(newAccessToken);

//             this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
//             this.refreshSubscribers = [];

//             return newAccessToken;
//         } catch (error) {
//             this.logout();
//             throw error;
//         } finally {
//             this.isRefreshing = false;
//         }
//     }

//     private logout() {
//         useAuthStore((state) => state.clearTokens)();
//         window.location.href = '/login';
//     }

//     public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
//         return this.axiosInstance.get(url, config);
//     }

//     public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
//         return this.axiosInstance.post(url, data, config);
//     }

//     public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
//         return this.axiosInstance.put(url, data, config);
//     }

//     public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
//         return this.axiosInstance.delete(url, config);
//     }
// }

// export const apiClient = new ApiClient();
// export default ApiClient;

