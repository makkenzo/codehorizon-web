import { PagedResponse } from '@/types';
import { AdminAchievementDTO, AdminCreateAchievementDTO, AdminUpdateAchievementDTO } from '@/types/achievementsAdmin';
import {
    AdminChartDataDTO,
    AdminCourseDetailDTO,
    AdminCourseListItemDTO,
    AdminCreateUpdateCourseRequestDTO,
    AdminCreateUpdateLessonRequestDTO,
    AdminDashboardStatsDTO,
    AdminUpdateUserRequest,
    AdminUser,
    AuthorCourseAnalytics,
    AuthorCourseListItemAnalytics,
    StudentProgressDTO,
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
        } catch (error: unknown) {
            console.error('Error fetching admin users:', error);
            throw error;
        }
    }

    async getUser(userId: string): Promise<AdminUser> {
        try {
            const response = await apiClient.get<AdminUser>(`/admin/users/${userId}`);
            return response.data;
        } catch (error: unknown) {
            console.error(`Error fetching admin user ${userId}:`, error);
            throw error;
        }
    }

    async updateUser(userId: string, data: AdminUpdateUserRequest): Promise<AdminUser> {
        try {
            const response = await apiClient.put<AdminUser, AdminUpdateUserRequest>(`/admin/users/${userId}`, data);
            return response.data;
        } catch (error: unknown) {
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
        titleSearch?: string,
        authorId?: string
    ): Promise<PagedResponse<AdminCourseListItemDTO>> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (authorId) params.append('authorId', authorId);
        if (sortBy) params.append('sortBy', sortBy);
        if (titleSearch) params.append('titleSearch', titleSearch);
        try {
            const response = await apiClient.get<PagedResponse<AdminCourseListItemDTO>>(
                `/admin/courses?${params.toString()}`
            );
            return response.data;
        } catch (error: unknown) {
            console.error('Error fetching admin courses:', error);
            throw error;
        }
    }

    async getCourseAdmin(courseId: string): Promise<AdminCourseDetailDTO> {
        try {
            const response = await apiClient.get<AdminCourseDetailDTO>(`/admin/courses/${courseId}`);
            return response.data;
        } catch (error: unknown) {
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
        } catch (error: unknown) {
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
        } catch (error: unknown) {
            console.error(`Error updating admin course ${courseId}:`, error);
            throw error;
        }
    }

    async deleteCourseAdmin(courseId: string): Promise<void> {
        try {
            await apiClient.delete<void>(`/admin/courses/${courseId}`);
        } catch (error: unknown) {
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
        } catch (error: unknown) {
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
        } catch (error: unknown) {
            console.error(`Error updating lesson ${lessonId} in course ${courseId}:`, error);
            throw error;
        }
    }

    async deleteLessonAdmin(courseId: string, lessonId: string): Promise<void> {
        try {
            await apiClient.delete<void>(`/admin/courses/${courseId}/lessons/${lessonId}`);
        } catch (error: unknown) {
            console.error(`Error deleting lesson ${lessonId} from course ${courseId}:`, error);
            throw error;
        }
    }

    async getDashboardStats(): Promise<AdminDashboardStatsDTO> {
        try {
            const response = await apiClient.get<AdminDashboardStatsDTO>(`/admin/dashboard/stats`);
            return response.data;
        } catch (error: unknown) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    async getDashboardCharts(): Promise<AdminChartDataDTO> {
        try {
            const response = await apiClient.get<AdminChartDataDTO>(`/admin/dashboard/charts`);
            return response.data;
        } catch (error: unknown) {
            console.error('Error fetching dashboard charts:', error);
            throw error;
        }
    }

    async getCourseStudentsProgress(
        courseId: string,
        page: number = 1,
        size: number = 10,
        sort?: string
    ): Promise<PagedResponse<StudentProgressDTO>> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (sort) params.append('sort', sort);

        try {
            const response = await apiClient.get<PagedResponse<StudentProgressDTO>>(
                `/admin/courses/${courseId}/students?${params.toString()}`
            );
            return response.data;
        } catch (error: unknown) {
            console.error('Error fetching admin course students:', error);
            throw error;
        }
    }

    async getAuthorCoursesWithAnalytics(
        page: number = 1,
        size: number = 10,
        sortBy?: string
    ): Promise<PagedResponse<AuthorCourseListItemAnalytics>> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (sortBy) params.append('sortBy', sortBy);

        try {
            const response = await apiClient.get<PagedResponse<AuthorCourseListItemAnalytics>>(
                `/author/dashboard/my-courses-analytics?${params.toString()}`
            );
            return response.data;
        } catch (error: unknown) {
            console.error('Error fetching author courses analytics:', error);
            throw error;
        }
    }

    async getAuthorCourseAnalytics(courseId: string): Promise<AuthorCourseAnalytics> {
        try {
            const response = await apiClient.get<AuthorCourseAnalytics>(
                `/author/dashboard/courses/${courseId}/analytics`
            );
            return response.data;
        } catch (error: unknown) {
            console.error(`Error fetching analytics for course ${courseId}:`, error);
            throw error;
        }
    }

    async runRetroactiveAchievementGrant(achievementKeys?: string[]): Promise<{ message: string }> {
        try {
            const payload = achievementKeys && achievementKeys.length > 0 ? achievementKeys : undefined;
            const response = await apiClient.post<{ message: string }>(
                `/admin/jobs/achievements/retroactive-grant`,
                payload ? { achievementKeys: payload } : undefined
            );
            return response.data;
        } catch (error: unknown) {
            console.error('Error running retroactive achievement grant:', error);
            throw error;
        }
    }

    async getAllAchievementsDefinitions(
        page: number = 1,
        size: number = 10,
        sort?: string
    ): Promise<PagedResponse<AdminAchievementDTO>> {
        const params = new URLSearchParams();

        params.append('page', (page - 1).toString());
        params.append('size', size.toString());
        if (sort) params.append('sort', sort);
        try {
            const response = await apiClient.get<PagedResponse<AdminAchievementDTO>>(
                `/admin/achievements?${params.toString()}`
            );

            return response.data;
        } catch (error: unknown) {
            console.error('Error fetching all achievement definitions:', error);
            throw error;
        }
    }

    async getAchievementDefinitionById(id: string): Promise<AdminAchievementDTO> {
        try {
            const response = await apiClient.get<AdminAchievementDTO>(`/admin/achievements/${id}`);
            return response.data;
        } catch (error: unknown) {
            console.error(`Error fetching achievement definition by ID ${id}:`, error);
            throw error;
        }
    }

    async createAchievementDefinition(data: AdminCreateAchievementDTO): Promise<AdminAchievementDTO> {
        try {
            const response = await apiClient.post<AdminAchievementDTO, AdminCreateAchievementDTO>(
                `/admin/achievements`,
                data
            );
            return response.data;
        } catch (error: unknown) {
            console.error(`Error creating achievement definition:`, error);
            throw error;
        }
    }

    async updateAchievementDefinition(id: string, data: AdminUpdateAchievementDTO): Promise<AdminAchievementDTO> {
        try {
            const response = await apiClient.put<AdminAchievementDTO, AdminUpdateAchievementDTO>(
                `/admin/achievements/${id}`,
                data
            );
            return response.data;
        } catch (error: unknown) {
            console.error(`Error updating achievement definition ${id}:`, error);
            throw error;
        }
    }

    async deleteAchievementDefinition(id: string): Promise<void> {
        try {
            await apiClient.delete<void>(`/admin/achievements/${id}`);
        } catch (error: unknown) {
            console.error(`Error deleting achievement definition ${id}:`, error);
            throw error;
        }
    }

    async getAchievementCategories(): Promise<string[]> {
        try {
            const response = await apiClient.get<string[]>('/admin/achievements/categories');
            return response.data ?? [];
        } catch (error) {
            console.error('Error fetching achievement categories:', error);
            throw error;
        }
    }
}

export const adminApiClient = new AdminApiClient();
