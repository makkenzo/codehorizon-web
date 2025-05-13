import { NotificationDTO, PagedResponse } from '@/types';

export interface NotificationsState {
    notifications: NotificationDTO[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number | null;
}

export interface NotificationsActions {
    fetchNotifications: (page?: number) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    addNotificationOptimistic: (notification: NotificationDTO) => void;
    setNotifications: (data: PagedResponse<NotificationDTO>) => void;
    setUnreadCount: (count: number) => void;
    resetNotificationsStore: () => void;
}

export type NotificationsStore = NotificationsState & NotificationsActions;
