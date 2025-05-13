'use client';

import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import NotificationItem from '@/components/notifications/notification-item';
import MyPagination from '@/components/reusable/my-pagination';
import PageWrapper from '@/components/reusable/page-wrapper';
import { Button } from '@/components/ui/button';
import { useNotificationsStore } from '@/stores/notifications/notifications-store-provider';

const AllNotificationsPage = () => {
    const {
        notifications,
        isLoading,
        error,
        fetchNotifications,
        markAllAsRead,
        totalPages: storeTotalPages,
    } = useNotificationsStore((state) => state);

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [fetchNotifications, currentPage]);

    const handlePageChange = (newPage: number) => {
        fetchNotifications(newPage);
    };

    const totalPages = storeTotalPages ?? 1;

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Все уведомления</h1>
                {notifications.some((n) => !n.read) && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        Пометить все как прочитанные
                    </Button>
                )}
            </div>
            {isLoading && notifications.length === 0 && (
                <div className="p-10 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </div>
            )}
            {error && <div className="p-4 text-destructive bg-destructive/10 rounded-md">{error}</div>}

            {!isLoading && notifications.length === 0 && !error && (
                <div className="p-10 text-center text-muted-foreground bg-card border rounded-md">
                    У вас нет уведомлений.
                </div>
            )}

            {notifications.length > 0 && (
                <div className="space-y-2 bg-card border rounded-md">
                    {notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))}
                </div>
            )}

            {totalPages && totalPages > 1 && !isLoading && (
                <MyPagination
                    className="mt-8"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </PageWrapper>
    );
};

export default AllNotificationsPage;
