import { User } from '@/models';
import { Achievement } from '@/types';

export type UserState = {
    user?: User;
    permissions?: string[] | null;
    earnedAchievements?: Achievement[] | null;
};

export type UserActions = {
    setUser: (user: User) => void;
    clearUser: () => void;
    setEarnedAchievements: (achievements: Achievement[]) => void;
    fetchUserEarnedAchievements: () => Promise<void>;
    updateUserXPLevel: (
        xp: number,
        level: number,
        xpForNextLevel: number,
        dailyStreak: number,
        lessonStreak: number
    ) => void;
};

export type UserStore = UserState & UserActions;
