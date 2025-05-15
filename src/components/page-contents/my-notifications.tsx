'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';

import NotificationItem from '@/components/notifications/notification-item';
import MyPagination from '@/components/reusable/my-pagination';
import { Button } from '@/components/ui/button';
import { useNotificationsStore } from '@/stores/notifications/notifications-store-provider';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const MyNotificationsPageContent = () => {
    const {
        notifications,
        isLoading,
        error,
        fetchNotifications,
        markAllAsRead,
        totalPages: storeTotalPages,
    } = useNotificationsStore((state) => state);

    const [currentPage, setCurrentPage] = useState(1);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [fetchNotifications, currentPage]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        fetchNotifications(newPage);
    };

    const handleMarkAllAsRead = async () => {
        setIsMarkingAllRead(true);
        await markAllAsRead();
        setIsMarkingAllRead(false);
    };

    const totalPages = storeTotalPages ?? 1;

    return (
        <div className="relative min-h-screen">
            {/* Subtle background gradients */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#3eccb2]/5 via-transparent to-transparent"></div>
                <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-gradient-to-bl from-[hsl(58,83%,62%)]/5 via-[hsl(68,27%,74%)]/5 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/3 w-[30vw] h-[30vw] bg-gradient-to-tr from-[hsl(173,58%,39%)]/5 via-[hsl(197,37%,24%)]/5 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-5xl mx-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Bell className="h-6 w-6 text-[#3eccb2]" />
                            <span className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent">
                                Все уведомления
                            </span>
                        </h1>
                        {notifications.some((n) => !n.read) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAllRead}
                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#3eccb2]/30 dark:border-[#3eccb2]/20 hover:bg-white/90 dark:hover:bg-gray-900/90 hover:border-[#3eccb2]/50 transition-all"
                            >
                                {isMarkingAllRead ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                )}
                                Пометить все как прочитанные
                            </Button>
                        )}
                    </div>

                    {isLoading && notifications.length === 0 && (
                        <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md rounded-xl overflow-hidden p-10">
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3eccb2]/30 to-[hsl(173,58%,39%)]/30 blur-md"></div>
                                    <Loader2 className="h-12 w-12 animate-spin text-[#3eccb2] relative" />
                                </div>
                                <p className="mt-4 text-muted-foreground">Загрузка уведомлений...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-red-200/50 dark:border-red-800/50 shadow-md rounded-xl overflow-hidden">
                            <div className="p-4 text-red-600 dark:text-red-400 bg-gradient-to-r from-red-500/5 to-rose-500/5">
                                {error}
                            </div>
                        </div>
                    )}

                    {!isLoading && notifications.length === 0 && !error && (
                        <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md rounded-xl overflow-hidden">
                            <div className="p-10 text-center">
                                <Bell className="h-12 w-12 mx-auto text-[#3eccb2]/50 mb-3" />
                                <p className="text-muted-foreground">У вас нет уведомлений.</p>
                            </div>
                        </div>
                    )}

                    {notifications.length > 0 && (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md rounded-xl overflow-hidden"
                        >
                            <AnimatePresence>
                                {notifications.map((notification) => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {totalPages > 1 && !isLoading && (
                        <MyPagination
                            className="mt-8"
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default MyNotificationsPageContent;
