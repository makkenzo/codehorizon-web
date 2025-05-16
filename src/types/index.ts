import { ElementType } from 'react';

import { Task } from './task';

export type BaseMetadata = {
    title: string;
    description: string;
    keywords?: string;
};

export type NavItem = {
    id: string;
    href?: string;
    label: string;
    description?: string;
    icon?: ElementType;
    variant?: 'ghost' | 'default';
    className?: string;
    subItems?: NavItem[];
} | null;

export interface HorizontalTabNavItem {
    label: string;
    href: string;
    disabled: boolean;
}

export enum CourseDifficultyLevels {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
}

export interface FeatureItem {
    title: string;
    description: string;
}

export interface Testimonial {
    quote: string;
    authorName: string;
    authorTitle: string;
    avatarSrc?: string | null;
    avatarFallback: string;
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    imagePreview?: string;
    videoPreview?: string;
    authorId: string;
    authorName: string;
    authorUsername: string;
    lessons: Lesson[];
    rating: number;
    price: number;
    discount: number;
    isFree: boolean;
    category?: string;
    difficulty: CourseDifficultyLevels;
    videoLength?: number;
    featuresBadge?: string | null;
    featuresTitle?: string | null;
    featuresSubtitle?: string | null;
    featuresDescription?: string | null;
    features?: FeatureItem[] | null;
    benefitTitle?: string | null;
    benefitDescription?: string | null;
    testimonial?: Testimonial | null;
}

export interface LessonWithoutContent {
    slug: string;
    title: string;
}

export interface Lesson {
    id: string;
    title: string;
    slug: string;
    content: string;
    codeExamples?: string[];
    tasks?: Task[];
    attachments?: Attachment[];
    mainAttachment?: string;
    videoLength?: number;
}

export interface Attachment {
    name: string;
    url: string;
}

export interface Review {
    id: string;
    text?: string;
    rating: number;
    authorId: string;
    courseId: string;
}

export type PagedResponse<T> = {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
};

export type CourseProgress = {
    course: Omit<Course, 'lessons'>;
    progress: number;
    completedLessons: string[];
};

export type UserCourseDTO = {
    course: Omit<Course, 'lessons'>;
    progress: number;
};

export interface PopularAuthorDTO {
    userId: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    avatarColor?: string | null;
    courseCount: number;
}

export interface UserSpecificCourseProgressDetails {
    id?: string;
    userId: string;
    courseId: string;
    completedLessons: string[];
    progress: number;
    lastUpdated: string;
}

export type NotificationDTO = {
    id: string;
    userId: string;
    type: NotificationType;
    message: string;
    link?: string | null;
    relatedEntityId?: string | null;
    read: boolean;
    createdAt: string;
};

export enum NotificationType {
    MENTORSHIP_APPLICATION_NEW = 'MENTORSHIP_APPLICATION_NEW',
    MENTORSHIP_APPLICATION_APPROVED = 'MENTORSHIP_APPLICATION_APPROVED',
    MENTORSHIP_APPLICATION_REJECTED = 'MENTORSHIP_APPLICATION_REJECTED',
    COURSE_PURCHASED = 'COURSE_PURCHASED',
    COURSE_COMPLETED = 'COURSE_COMPLETED',
    NEW_REVIEW_ON_COURSE = 'NEW_REVIEW_ON_COURSE',
    LESSON_COMPLETED_BY_STUDENT = 'LESSON_COMPLETED_BY_STUDENT',
    ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
}

export interface PublicCertificateInfoDTO {
    courseTitle: string;
    completionDate: string;
}
