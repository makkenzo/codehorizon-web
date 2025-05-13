'use client';

import { useEffect } from 'react';

import { Bell } from 'lucide-react';
import { shallow } from 'zustand/shallow';

import { useAuth } from '@/providers/auth-provider';
import { useNotificationsStore } from '@/stores/notifications/notifications-store-provider';

import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import NotificationDropdownContent from './notification-dropdown-content';

const NotificationIcon = () => {
    const { unreadCount, fetchUnreadCount } = useNotificationsStore(
        (state) => ({
            unreadCount: state.unreadCount,
            fetchUnreadCount: state.fetchUnreadCount,
        }),
        shallow
    );
    const { isAuthenticated, isPending } = useAuth();

    useEffect(() => {
        if (isAuthenticated && !isPending) {
            fetchUnreadCount();
            const intervalId = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(intervalId);
        }
    }, [isAuthenticated, isPending, fetchUnreadCount]);

    if (!isAuthenticated || isPending) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-muted">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 w-4 min-w-0 p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96 p-0" align="end">
                <NotificationDropdownContent />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationIcon;
