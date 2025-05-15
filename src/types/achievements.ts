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
