import {
    AdminCourseDetailDTO,
    AdminCourseListItemDTO,
    AdminCreateUpdateCourseRequestDTO,
    AdminCreateUpdateLessonRequestDTO,
    AdminUpdateUserRequest,
    AdminUser,
    PagedResponse,
} from '@/types/admin';

import { apiClient } from './api-client';

class AdminApiClient {
    async getUsers(page: number = 1, size: number = 10, sortBy?: string): Promise<PagedResponse<AdminUser>> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (sortBy) params.append('sortBy', sortBy);
        try {
            const response = await apiClient.get<PagedResponse<AdminUser>>(`/admin/users?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching admin users:', error);
            throw error;
        }
    }

    async getUser(userId: string): Promise<AdminUser> {
        try {
            const response = await apiClient.get<AdminUser>(`/admin/users/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching admin user ${userId}:`, error);
            throw error;
        }
    }

    async updateUser(userId: string, data: AdminUpdateUserRequest): Promise<AdminUser> {
        try {
            const response = await apiClient.put<AdminUser, AdminUpdateUserRequest>(`/admin/users/${userId}`, data);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating admin user ${userId}:`, error);
            throw error;
        }
    }

    async getPotentialAuthors(): Promise<AdminUser[]> {
        try {
            const response = await this.getUsers(1, 1000);
            return response.content;
        } catch (error) {
            console.error('Error fetching potential authors:', error);
            return [];
        }
    }

    async getCoursesAdmin(
        page: number = 1,
        size: number = 10,
        sortBy?: string,
        titleSearch?: string
    ): Promise<PagedResponse<AdminCourseListItemDTO>> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (sortBy) params.append('sortBy', sortBy);
        if (titleSearch) params.append('titleSearch', titleSearch);
        try {
            const response = await apiClient.get<PagedResponse<AdminCourseListItemDTO>>(
                `/admin/courses?${params.toString()}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching admin courses:', error);
            throw error;
        }
    }

    async getCourseAdmin(courseId: string): Promise<AdminCourseDetailDTO> {
        try {
            const response = await apiClient.get<AdminCourseDetailDTO>(`/admin/courses/${courseId}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching admin course ${courseId}:`, error);
            throw error;
        }
    }

    async createCourseAdmin(data: AdminCreateUpdateCourseRequestDTO): Promise<AdminCourseDetailDTO> {
        try {
            const response = await apiClient.post<AdminCourseDetailDTO, AdminCreateUpdateCourseRequestDTO>(
                `/admin/courses`,
                data
            );
            return response.data;
        } catch (error: any) {
            console.error(`Error creating admin course:`, error);
            throw error;
        }
    }

    async updateCourseAdmin(courseId: string, data: AdminCreateUpdateCourseRequestDTO): Promise<AdminCourseDetailDTO> {
        try {
            const response = await apiClient.put<AdminCourseDetailDTO, AdminCreateUpdateCourseRequestDTO>(
                `/admin/courses/${courseId}`,
                data
            );
            return response.data;
        } catch (error: any) {
            console.error(`Error updating admin course ${courseId}:`, error);
            throw error;
        }
    }

    async deleteCourseAdmin(courseId: string): Promise<void> {
        try {
            await apiClient.delete<void>(`/admin/courses/${courseId}`);
        } catch (error: any) {
            console.error(`Error deleting admin course ${courseId}:`, error);
            throw error;
        }
    }

    async addLessonAdmin(courseId: string, data: AdminCreateUpdateLessonRequestDTO): Promise<AdminCourseDetailDTO> {
        try {
            const response = await apiClient.post<AdminCourseDetailDTO, AdminCreateUpdateLessonRequestDTO>(
                `/admin/courses/${courseId}/lessons`,
                data
            );
            return response.data;
        } catch (error: any) {
            console.error(`Error adding lesson to course ${courseId}:`, error);
            throw error;
        }
    }

    async updateLessonAdmin(
        courseId: string,
        lessonId: string,
        data: AdminCreateUpdateLessonRequestDTO
    ): Promise<AdminCourseDetailDTO> {
        try {
            const response = await apiClient.put<AdminCourseDetailDTO, AdminCreateUpdateLessonRequestDTO>(
                `/admin/courses/${courseId}/lessons/${lessonId}`,
                data
            );
            return response.data;
        } catch (error: any) {
            console.error(`Error updating lesson ${lessonId} in course ${courseId}:`, error);
            throw error;
        }
    }

    async deleteLessonAdmin(courseId: string, lessonId: string): Promise<void> {
        try {
            await apiClient.delete<void>(`/admin/courses/${courseId}/lessons/${lessonId}`);
        } catch (error: any) {
            console.error(`Error deleting lesson ${lessonId} from course ${courseId}:`, error);
            throw error;
        }
    }
}

export const adminApiClient = new AdminApiClient();
