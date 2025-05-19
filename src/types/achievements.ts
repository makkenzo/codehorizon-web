export enum AchievementTriggerType {
    COURSE_COMPLETION_COUNT = 'COURSE_COMPLETION_COUNT',
    LESSON_COMPLETION_COUNT_TOTAL = 'LESSON_COMPLETION_COUNT_TOTAL',
    LESSON_COMPLETION_STREAK_DAILY = 'LESSON_COMPLETION_STREAK_DAILY',
    REVIEW_COUNT = 'REVIEW_COUNT',
    FIRST_COURSE_COMPLETED = 'FIRST_COURSE_COMPLETED',
    FIRST_REVIEW_WRITTEN = 'FIRST_REVIEW_WRITTEN',
    PROFILE_COMPLETION_PERCENT = 'PROFILE_COMPLETION_PERCENT',
    DAILY_LOGIN_STREAK = 'DAILY_LOGIN_STREAK',
    COURSE_CREATION_COUNT = 'COURSE_CREATION_COUNT',
    TOTAL_XP_EARNED = 'TOTAL_XP_EARNED',
    LEVEL_REACHED = 'LEVEL_REACHED',
    SPECIFIC_COURSE_COMPLETED = 'SPECIFIC_COURSE_COMPLETED',
    SPECIFIC_LESSON_COMPLETED = 'SPECIFIC_LESSON_COMPLETED',
    CATEGORY_COURSES_COMPLETED = 'CATEGORY_COURSES_COMPLETED',
    WISHLIST_ITEM_COUNT = 'WISHLIST_ITEM_COUNT',
    MENTOR_STUDENT_COURSE_COMPLETION = 'MENTOR_STUDENT_COURSE_COMPLETION',
    MENTOR_TOTAL_STUDENT_COMPLETIONS = 'MENTOR_TOTAL_STUDENT_COMPLETIONS',
    CUSTOM_FRONTEND_EVENT = 'CUSTOM_FRONTEND_EVENT',
    LESSON_COMPLETED_AT_NIGHT = 'LESSON_COMPLETED_AT_NIGHT',
    FIRST_COURSE_COMPLETED_WITHIN_TIMEFRAME = 'FIRST_COURSE_COMPLETED_WITHIN_TIMEFRAME',
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
