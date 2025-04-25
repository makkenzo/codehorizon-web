import axios from 'axios';
import qs from 'qs';

import { Course, CourseProgress, Lesson, PagedResponse } from '@/types';

import ApiClient from './api-client';

class CoursesApiClient extends ApiClient {
    private readonly defaultPageSize = 12;

    async getCourses(
        params: {
            title?: string;
            description?: string;
            minRating?: number;
            minDuration?: number;
            maxDuration?: number;
            category?: string;
            difficulty?: string[];
            sortBy?: string;
            page?: number;
            size?: number;
        } = {}
    ) {
        try {
            const queryParams = { size: this.defaultPageSize, ...params };
            const response = await this.get<{
                content: Omit<Course, 'lessons'>[];
                pageNumber: number;
                pageSize: number;
                totalElements: number;
                totalPages: number;
                isLast: boolean;
            }>('/courses', {
                params: queryParams,
                paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
            });

            return response.data;
        } catch (error: any) {
            console.error('Ошибка получения курсов:', error?.response?.status || error);
            return null;
        }
    }

    async getCourseBySlug(slug: string) {
        try {
            const response = await this.get<
                Omit<Course, 'lessons' | 'authorId'> & {
                    lessons: Pick<Lesson, 'title' | 'slug'>[];
                    authorUsername: string;
                    authorName: string;
                }
            >(`/courses/${slug}`);

            return response.data;
        } catch (error: any) {
            console.error(`Ошибка получения курса по slug "${slug}":`, error?.response?.status || error);
            return null;
        }
    }

    private async fetchPaginated<T>(
        endpoint: string,
        params: Record<string, any> = {},
        signal?: AbortSignal
    ): Promise<PagedResponse<T> | null> {
        try {
            const response = await this.get<PagedResponse<T>>(endpoint, {
                params: { size: this.defaultPageSize, ...params },
                paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
                signal: signal,
            });

            return response.data;
        } catch (error: any) {
            if (axios.isCancel(error)) throw error;

            console.error(`Ошибка получения данных с ${endpoint}:`, error?.response?.status || error);
            return null;
        }
    }

    async getMyCourses(params: { page?: number; size?: number } = {}, signal?: AbortSignal) {
        return this.fetchPaginated<CourseProgress>('/users/me/courses', params, signal);
    }

    async getMyWishlist(params: { page?: number; size?: number } = {}, signal?: AbortSignal) {
        return this.fetchPaginated<Omit<Course, 'lessons'>>('/users/me/wishlist', params, signal);
    }

    async getMyCompletedCourses(params: { page?: number; size?: number } = {}, signal?: AbortSignal) {
        return this.fetchPaginated<CourseProgress>('/users/me/completed', params, signal);
    }

    async isCourseInWishlist(courseId: string): Promise<boolean> {
        const endpoint = `/users/me/wishlist/status?courseId=${courseId}`;

        try {
            const response = await this.get<boolean>(endpoint);

            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
                console.log('Пользователь не авторизован для проверки вишлиста');
            } else if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log(`Курс ${courseId} не найден в вишлисте или API не найдено.`);
            } else {
                console.error(`Ошибка при проверке вишлиста для курса ${courseId}:`, error);
            }

            return false;
        }
    }

    async checkCourseAccess(courseId: string): Promise<boolean> {
        const endpoint = `/users/me/courses/${courseId}/access`;
        try {
            await this.get<boolean>(endpoint);
            return true;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    console.log(`Доступ к курсу ${courseId} запрещен`);
                } else if (status === 404) {
                    console.log(`Запись о доступе к курсу ${courseId} не найдена`);
                } else {
                    console.error(`Неожиданная ошибка при проверке доступа к курсу ${courseId}:`, error);
                }
            } else {
                console.error(`Неожиданная ошибка при проверке доступа к курсу ${courseId}:`, error);
            }
            return false;
        }
    }

    async addToWishlist(courseId: string): Promise<void> {
        await this.post(`/users/me/wishlist/${courseId}`);
    }
    async removeFromWishlist(courseId: string): Promise<void> {
        await this.delete(`/users/me/wishlist/${courseId}`);
    }

    async getCourseLessons(courseId: string): Promise<Lesson[]> {
        try {
            const response = await this.get<Lesson[]>(`/courses/${courseId}/lessons`);
            return response.data;
        } catch (error: any) {
            console.error(`Ошибка при получении уроков курса ${courseId}:`, error?.response?.status || error);
            return [];
        }
    }
}

export default CoursesApiClient;
