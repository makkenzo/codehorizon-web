import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { notificationsApiClient } from '@/server/notifications';

import { NotificationsState, NotificationsStore } from './types';

export const defaultNotificationsState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: null,
};

export const createNotificationsStore = (initState: NotificationsState = defaultNotificationsState) =>
    createStore<NotificationsStore>()(
        persist(
            (set, get) => ({
                ...initState,
                fetchNotifications: async (page = 1) => {
                    set({ isLoading: true, error: null });
                    try {
                        const data = await notificationsApiClient.getNotifications(page);
                        if (data) {
                            set((state) => ({
                                notifications: page === 1 ? data.content : [...state.notifications, ...data.content],
                                currentPage: data.pageNumber + 1,
                                totalPages: data.totalPages,
                                isLoading: false,
                            }));
                        } else {
                            set({ notifications: page === 1 ? [] : get().notifications, isLoading: false });
                        }
                    } catch (err: any) {
                        set({ error: err.message || 'Failed to fetch notifications', isLoading: false });
                    }
                },
                fetchUnreadCount: async () => {
                    try {
                        const data = await notificationsApiClient.getUnreadCount();
                        if (data) {
                            set({ unreadCount: data.unreadCount });
                        }
                    } catch (err) {
                        console.error('Failed to fetch unread count', err);
                    }
                },
                markAsRead: async (notificationId) => {
                    const originalNotifications = get().notifications;
                    const originalUnreadCount = get().unreadCount;

                    set((state) => ({
                        notifications: state.notifications.map((n) =>
                            n.id === notificationId ? { ...n, read: true } : n
                        ),
                        unreadCount: state.notifications.find((n) => n.id === notificationId && !n.read)
                            ? Math.max(0, state.unreadCount - 1)
                            : state.unreadCount,
                    }));

                    try {
                        await notificationsApiClient.markAsRead(notificationId);
                        get().fetchUnreadCount();
                    } catch (err) {
                        console.error('Failed to mark notification as read', err);
                        set({ notifications: originalNotifications, unreadCount: originalUnreadCount });
                    }
                },
                markAllAsRead: async () => {
                    const originalNotifications = get().notifications;
                    const originalUnreadCount = get().unreadCount;

                    set((state) => ({
                        notifications: state.notifications.map((n) => ({ ...n, read: true })),
                        unreadCount: 0,
                    }));
                    try {
                        await notificationsApiClient.markAllAsRead();
                    } catch (err) {
                        console.error('Failed to mark all notifications as read', err);
                        set({ notifications: originalNotifications, unreadCount: originalUnreadCount });
                    }
                },
                addNotificationOptimistic: (notification) => {
                    set((state) => ({
                        notifications: [notification, ...state.notifications].slice(0, 20),
                        unreadCount: state.unreadCount + (notification.read ? 0 : 1),
                    }));
                },
                setNotifications: (data) =>
                    set({
                        notifications: data.content,
                        currentPage: data.pageNumber + 1,
                        totalPages: data.totalPages,
                    }),
                setUnreadCount: (count) => set({ unreadCount: count }),
                resetNotificationsStore: () => set(defaultNotificationsState),
            }),
            {
                name: 'notifications-store',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    unreadCount: state.unreadCount,
                }),
            }
        )
    );
