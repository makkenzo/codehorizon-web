import qs from 'qs';

import { Course } from '@/types';

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
}

export default CoursesApiClient;
