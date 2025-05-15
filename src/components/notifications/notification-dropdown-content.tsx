'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Bell, CheckCheck, Loader2 } from 'lucide-react';

import Link from 'next/link';

import { useNotificationsStore } from '@/stores/notifications/notifications-store-provider';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import NotificationItem from './notification-item';

const NotificationDropdownContent = () => {
    const { notifications, isLoading, error, fetchNotifications, markAllAsRead, currentPage, totalPages } =
        useNotificationsStore((state) => state);

    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const handleLoadMore = async () => {
        if (currentPage < (totalPages || 0)) {
            setIsLoadingMore(true);
            await fetchNotifications(currentPage + 1);
            setIsLoadingMore(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        setIsMarkingAllRead(true);
        await markAllAsRead();
        setIsMarkingAllRead(false);
    };

    return (
        <div className="flex flex-col max-h-[70vh] rounded-xl overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-gray-950/95 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-[#3eccb2]/5 to-transparent">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Bell className="h-4 w-4 text-[#3eccb2]" />
                        <span className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent">
                            Уведомления
                        </span>
                    </h3>
                    {notifications.some((n) => !n.read) && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="p-0 h-auto text-[#3eccb2] hover:text-[hsl(173,58%,39%)] transition-colors"
                            disabled={isMarkingAllRead}
                        >
                            {isMarkingAllRead ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                                <CheckCheck className="h-3 w-3 mr-1" />
                            )}
                            Пометить все как прочитанные
                        </Button>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-grow custom-scrollbar h-[300px]">
                <AnimatePresence>
                    {isLoading && notifications.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6 text-center"
                        >
                            <div className="relative mx-auto w-fit">
                                <div className="absolute inset-0 rounded-full bg-[#3eccb2]/20 blur-md"></div>
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#3eccb2] relative" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Загрузка уведомлений...</p>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 m-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg flex items-center gap-2"
                        >
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}

                    {!isLoading && notifications.length === 0 && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-6 text-center"
                        >
                            <Bell className="h-8 w-8 mx-auto text-[#3eccb2]/30 mb-2" />
                            <p className="text-sm text-muted-foreground">У вас нет новых уведомлений.</p>
                        </motion.div>
                    )}

                    {notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))}
                </AnimatePresence>

                {isLoadingMore && (
                    <div className="p-3 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto text-[#3eccb2]" />
                    </div>
                )}
            </ScrollArea>

            <div className="border-t border-gray-200/50 dark:border-gray-800/50 divide-y divide-gray-200/50 dark:divide-gray-800/50">
                {totalPages && currentPage < totalPages && !isLoading && (
                    <div className="p-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#3eccb2]/30 dark:border-[#3eccb2]/20 hover:bg-white/90 dark:hover:bg-gray-900/90 hover:border-[#3eccb2]/50 transition-all"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                        >
                            {isLoadingMore ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : null}
                            Загрузить еще
                        </Button>
                    </div>
                )}

                <div className="p-2">
                    <Link href="/me/notifications" className="block">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full hover:bg-[#3eccb2]/10 hover:text-[#3eccb2] transition-colors group"
                        >
                            Все уведомления
                            <ArrowRight className="h-3 w-3 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotificationDropdownContent;
