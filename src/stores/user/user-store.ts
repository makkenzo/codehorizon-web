import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { User } from '@/models';
import { achievementsApiClient } from '@/server/achievements';
import AuthApiClient from '@/server/auth';
import { Achievement } from '@/types/achievements';

import { UserState, UserStore } from './types';

export const defaultInitState: UserState = {
    user: undefined,
    permissions: undefined,
    earnedAchievements: undefined,
};

export const createUserStore = (initState: UserState = defaultInitState) => {
    return createStore<UserStore>()(
        persist(
            (set, get) => ({
                ...initState,
                setUser: (user: User) => {
                    set({ user, permissions: user.permissions ?? null });
                    if (user?.id) {
                        get().fetchUserEarnedAchievements();
                    } else {
                        set({ earnedAchievements: null });
                    }
                },
                clearUser: () => set({ user: undefined, permissions: null, earnedAchievements: null }),
                setEarnedAchievements: (achievements: Achievement[]) => set({ earnedAchievements: achievements }),

                fetchUserEarnedAchievements: async () => {
                    const userId = get().user?.id;
                    if (!userId) {
                        set({ earnedAchievements: null });
                        return;
                    }
                    try {
                        const myAchievements = await achievementsApiClient.getMyAchievements();
                        set({ earnedAchievements: myAchievements || [] });
                    } catch (error) {
                        console.error('Failed to fetch user earned achievements', error);
                        set({ earnedAchievements: [] });
                    }
                },
                updateUserXPLevel: (xp, level, xpForNextLevel, dailyLoginStreak, lessonCompletionStreakDaily) => {
                    set((state) => {
                        if (state.user) {
                            return {
                                user: {
                                    ...state.user,
                                    xp,
                                    level,
                                    xpForNextLevel,
                                    dailyStreak: dailyLoginStreak,
                                    lessonCompletionStreakDaily: lessonCompletionStreakDaily,
                                },
                            };
                        }
                        return state;
                    });
                },
                resendVerificationEmail: async () => {
                    try {
                        const response = await new AuthApiClient().resendVerificationEmail();
                        return { success: true, message: response.message };
                    } catch (error: any) {
                        console.error('Error resending verification email:', error);
                        return {
                            success: false,
                            message: error.response?.data?.message || error.message || 'Не удалось отправить письмо.',
                        };
                    }
                },
            }),
            {
                name: 'user-storage',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    user: state.user,
                    permissions: state.permissions,
                }),
            }
        )
    );
};
