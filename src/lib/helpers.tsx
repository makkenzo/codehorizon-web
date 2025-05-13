import { BellRing, CheckCircle, MessageSquare, Package, UserPlus, XCircle } from 'lucide-react';

import { NotificationType } from '@/types';

export const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case NotificationType.MENTORSHIP_APPLICATION_NEW:
            return <UserPlus className="h-4 w-4 text-blue-500" />;
        case NotificationType.MENTORSHIP_APPLICATION_APPROVED:
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case NotificationType.MENTORSHIP_APPLICATION_REJECTED:
            return <XCircle className="h-4 w-4 text-red-500" />;
        case NotificationType.COURSE_PURCHASED:
            return <Package className="h-4 w-4 text-indigo-500" />;
        case NotificationType.NEW_REVIEW_ON_COURSE:
            return <MessageSquare className="h-4 w-4 text-purple-500" />;

        default:
            return <BellRing className="h-4 w-4 text-gray-500" />;
    }
};
