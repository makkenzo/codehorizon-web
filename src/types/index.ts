import { ElementType } from 'react';

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

export enum TaskType {
    TEXT_INPUT = 'TEXT_INPUT',
    CODE_INPUT = 'CODE_INPUT',
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

export interface Task {
    id: string;
    description: string;
    solution?: string | null;
    tests?: string[] | null;
    taskType: TaskType;
    options?: string[] | null;
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

export enum AchievementTriggerType {
    COURSE_COMPLETION_COUNT = 'COURSE_COMPLETION_COUNT',
    LESSON_COMPLETION_STREAK = 'LESSON_COMPLETION_STREAK',
    REVIEW_COUNT = 'REVIEW_COUNT',
    FIRST_COURSE_COMPLETED = 'FIRST_COURSE_COMPLETED',
    FIRST_REVIEW_WRITTEN = 'FIRST_REVIEW_WRITTEN',
    PROFILE_COMPLETION_PERCENT = 'PROFILE_COMPLETION_PERCENT',
    DAILY_LOGIN_STREAK = 'DAILY_LOGIN_STREAK',
    COURSE_CREATION_COUNT = 'COURSE_CREATION_COUNT',
    TOTAL_XP_EARNED = 'TOTAL_XP_EARNED',
    LEVEL_REACHED = 'LEVEL_REACHED',
}

export enum AchievementRarity {
    COMMON = 'COMMON',
    UNCOMMON = 'UNCOMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
}

export interface Achievement {
    id: string;
    key: string;
    name: string;
    description: string;
    iconUrl: string | null;
    triggerType: AchievementTriggerType;
    triggerThreshold: number;
    xpBonus: number;
    isGlobal: boolean;
    order: number;
    earnedAt?: string;
    category?: string;
    rarity: AchievementRarity;
}

export interface UserAchievement {
    id: string;
    userId: string;
    achievementKey: string;
    earnedAt: string;
    details?: Achievement;
}

export interface GlobalAchievementDTO {
    id: string;
    key: string;
    name: string;
    description: string;
    iconUrl: string | null;
    xpBonus: number;
    order: number;
    category?: string | null;
    isEarnedByUser: boolean;
    earnedAt?: string | null;
    triggerType?: AchievementTriggerType;
    triggerThreshold?: number;
    isGlobal?: boolean;
    rarity: AchievementRarity;
    prerequisites?: string[];
}
