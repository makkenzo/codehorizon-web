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
            const defaultParams = { size: 12, ...params };

            const response = await this.get<{
                content: Omit<Course, 'lessons'>[];
                pageNumber: number;
                pageSize: number;
                totalElements: number;
                totalPages: number;
                isLast: boolean;
            }>('/courses', {
                params: defaultParams,
                paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
            })
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

    async getCourseBySlug(slug: string) {
        try {
            const response = await this.get<
                Omit<Course, 'lessons' | 'authorId'> & {
                    lessons: Pick<Lesson, 'title' | 'slug'>[];
                    authorUsername: string;
                    authorName: string;
                }
            >(`/courses/${slug}`).then((res) => res.data);

            return response;
        } catch (error) {
            console.log('Ошибка получения юзера', error);
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
            if (axios.isCancel(error)) {
                throw error;
            } else {
                console.error(`Ошибка получения данных с ${endpoint}`, error?.response?.status || error);
                return null;
            }
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
}

export default CoursesApiClient;
