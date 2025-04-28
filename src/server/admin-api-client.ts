import { AdminUpdateUserRequest, AdminUser, PagedResponse } from '@/types/admin';

import { apiClient } from './api-client';

class AdminApiClient {
    async getUsers(
        page: number = 1,
        size: number = 20,
        sortBy?: string,
        titleSearch?: string
    ): Promise<PagedResponse<AdminUser>> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (sortBy) {
            params.append('sortBy', sortBy);
        }
        if (titleSearch) {
            params.append('titleSearch', titleSearch);
        }

        try {
            const response = await apiClient.get<PagedResponse<AdminUser>>(`/admin/users?${params.toString()}`);

            return response.data;
        } catch (error: any) {
            console.error('Error fetching admin users:', error);

            return { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true };
        }
    }

    async getUser(userId: string): Promise<AdminUser | null> {
        try {
            const response = await apiClient.get<AdminUser>(`/admin/users/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching admin user ${userId}:`, error);
            return null;
        }
    }

    async updateUser(userId: string, data: AdminUpdateUserRequest): Promise<AdminUser | null> {
        try {
            const response = await apiClient.put<AdminUser, AdminUpdateUserRequest>(`/admin/users/${userId}`, data);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating admin user ${userId}:`, error);
            return null;
        }
    }
}

export const adminApiClient = new AdminApiClient();
