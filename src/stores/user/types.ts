import { User } from '@/models';
import { Achievement } from '@/types';

export type UserState = {
    user?: User;
    permissions?: string[] | null;
    achievements?: Achievement[] | null;
};

export type UserActions = {
    setUser: (user: User) => void;
    clearUser: () => void;
    setAchievements: (achievements: Achievement[]) => void;
    fetchUserAchievements: () => Promise<void>;
};

export type UserStore = UserState & UserActions;
