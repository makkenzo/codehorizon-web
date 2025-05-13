import { NotificationDTO, PagedResponse } from '@/types';

import ApiClient from './api-client';

class NotificationsApiClient extends ApiClient {
    async getNotifications(page: number = 1, size: number = 10): Promise<PagedResponse<NotificationDTO> | null> {
        try {
            const response = await this.get<PagedResponse<NotificationDTO>>(`/notifications?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return null;
        }
    }

    async getUnreadCount(): Promise<{ unreadCount: number } | null> {
        try {
            const response = await this.get<{ unreadCount: number }>(`/notifications/unread-count`);
            return response.data;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return null;
        }
    }

    async markAsRead(notificationId: string): Promise<NotificationDTO | null> {
        try {
            const response = await this.post<NotificationDTO>(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as read:`, error);
            return null;
        }
    }

    async markAllAsRead(): Promise<{ markedAsReadCount: number } | null> {
        try {
            const response = await this.post<{ markedAsReadCount: number }>(`/notifications/read-all`);
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return null;
        }
    }
}

export const notificationsApiClient = new NotificationsApiClient();
