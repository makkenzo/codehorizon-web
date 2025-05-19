import { AchievementRarity, AchievementTriggerType } from './achievements';

export interface AdminAchievementDTO {
    id: string;
    key: string;
    name: string;
    description: string;
    iconUrl: string;
    triggerType: AchievementTriggerType;
    triggerThreshold: number;
    triggerThresholdValue?: string | null;
    xpBonus: number;
    rarity: AchievementRarity;
    isGlobal: boolean;
    order: number;
    category?: string | null;
    isHidden: boolean;
    prerequisites: string[];
}

export interface AdminCreateAchievementDTO {
    key: string;
    name: string;
    description: string;
    iconUrl: string;
    triggerType: AchievementTriggerType;
    triggerThreshold: number;
    triggerThresholdValue?: string | null;
    xpBonus?: number;
    rarity?: AchievementRarity;
    isGlobal?: boolean;
    order?: number;
    category?: string | null;
    isHidden?: boolean;
    prerequisites?: string[];
}

export interface AdminUpdateAchievementDTO {
    key?: string;
    name?: string;
    description?: string;
    iconUrl?: string;
    triggerType?: AchievementTriggerType;
    triggerThreshold?: number;
    triggerThresholdValue?: string | null;
    xpBonus?: number;
    rarity?: AchievementRarity;
    isGlobal?: boolean;
    order?: number;
    category?: string | null;
    isHidden?: boolean;
    prerequisites?: string[];
}
