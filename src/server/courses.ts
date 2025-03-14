import { Course } from '@/types';

import ApiClient from './api-client';

class CoursesApiClient extends ApiClient {
    async getCourses() {
        try {
            const response = await this.get<Course>('/courses')
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
