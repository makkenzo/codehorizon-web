'use client';

import { useEffect } from 'react';

import { Loader2 } from 'lucide-react';

import Link from 'next/link';

import { useNotificationsStore } from '@/stores/notifications/notifications-store-provider';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import NotificationItem from './notification-item';

const NotificationDropdownContent = () => {
    const { notifications, isLoading, error, fetchNotifications, markAllAsRead, currentPage, totalPages } =
        useNotificationsStore((state) => state);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const handleLoadMore = () => {
        if (currentPage < (totalPages || 0)) {
            fetchNotifications(currentPage + 1);
        }
    };

    return (
        <div className="flex flex-col max-h-[70vh]">
            <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Уведомления</h3>
                    {notifications.some((n) => !n.read) && (
                        <Button variant="link" size="sm" onClick={markAllAsRead} className="p-0 h-auto">
                            Пометить все как прочитанные
                        </Button>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-grow">
                {isLoading && notifications.length === 0 && (
                    <div className="p-4 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </div>
                )}
                {error && <div className="p-4 text-destructive">{error}</div>}

                {!isLoading && notifications.length === 0 && !error && (
                    <div className="p-4 text-center text-muted-foreground">У вас нет новых уведомлений.</div>
                )}

                {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                ))}
            </ScrollArea>

            {totalPages && currentPage < totalPages && !isLoading && (
                <div className="p-2 border-t">
                    <Button variant="outline" size="sm" className="w-full" onClick={handleLoadMore}>
                        Загрузить еще
                    </Button>
                </div>
            )}

            <div className="p-2 border-t text-center">
                <Link href="/me/notifications">
                    <Button variant="ghost" size="sm" className="w-full">
                        Все уведомления
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotificationDropdownContent;
