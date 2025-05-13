'use client';

import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Circle } from 'lucide-react';

import Link from 'next/link';

import { getNotificationIcon } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/stores/notifications/notifications-store-provider';
import { NotificationDTO } from '@/types';

interface NotificationItemProps {
    notification: NotificationDTO;
}

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
                'flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0',
                notification.read ? 'opacity-70' : 'font-medium'
            )}
            onClick={handleItemClick}
        >
            {!notification.read && <Circle className="h-2 w-2 mt-1.5 fill-primary text-primary flex-shrink-0" />}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-muted/60">
                {getNotificationIcon(notification.type)}
            </div>
            <div className={cn('flex-grow', notification.read && 'pl-5')}>
                <p className="text-sm leading-snug">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
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
