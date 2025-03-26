import qs from 'qs';

import { Course, Lesson } from '@/types';

import ApiClient from './api-client';

class CoursesApiClient extends ApiClient {
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
}

export default CoursesApiClient;
