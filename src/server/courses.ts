import qs from 'qs';

import { Course } from '@/types';

import ApiClient from './api-client';

class CoursesApiClient extends ApiClient {
    async getCourses(
        params: {
            title?: string;
            description?: string;
            minRating?: number;
            maxDuration?: number;
            category?: string;
            difficulty?: string[];
            sortBy?: string;
            page?: number;
            size?: number;
        } = { size: 12 }
    ) {
        try {
            console.log(params);

            const response = await this.get<{
                content: Omit<Course, 'lessons'>[];
                pageNumber: number;
                pageSize: number;
                totalElements: number;
                totalPages: number;
                isLast: boolean;
            }>('/courses', { params, paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }) })
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
