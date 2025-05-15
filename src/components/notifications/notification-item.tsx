'use client';

import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Circle } from 'lucide-react';

import Link from 'next/link';

import { getNotificationIcon } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/stores/notifications/notifications-store-provider';
import { NotificationDTO } from '@/types';

interface NotificationItemProps {
    notification: NotificationDTO;
}

const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
};

const NotificationItem = ({ notification }: NotificationItemProps) => {
    const { markAsRead } = useNotificationsStore((state) => state);

    const handleItemClick = () => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
    };

    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ru });

    const content = (
        <div
            className={cn(
                'flex items-start gap-3 p-4 relative border-b last:border-b-0 transition-all duration-300',
                notification.read
                    ? 'opacity-70 hover:opacity-90 hover:bg-muted/30'
                    : 'hover:bg-gradient-to-r hover:from-[#3eccb2]/5 hover:to-transparent'
            )}
            onClick={handleItemClick}
        >
            {!notification.read && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#3eccb2] to-[hsl(173,58%,39%)]"></div>
            )}

            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#3eccb2]/10 to-[hsl(173,58%,39%)]/10 border border-[#3eccb2]/20">
                {getNotificationIcon(notification.type)}
            </div>

            <div className="flex-grow">
                <p className={cn('text-sm leading-snug', !notification.read && 'font-medium')}>
                    {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    {!notification.read && (
                        <Circle className="h-2 w-2 mr-1.5 fill-[#3eccb2] text-[#3eccb2] flex-shrink-0" />
                    )}
                    {timeAgo}
                </p>
            </div>
        </div>
    );

    return notification.link ? (
        <Link href={notification.link} passHref legacyBehavior>
            <a onClick={handleItemClick} className="block no-underline text-inherit">
                {content}
            </a>
        </Link>
    ) : (
        content
    );
};

export default NotificationItem;
