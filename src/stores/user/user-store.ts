import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { User } from '@/models';
import { achievementsApiClient } from '@/server/achievements';
import { Achievement } from '@/types';

import { UserState, UserStore } from './types';

export const defaultInitState: UserState = {
    user: undefined,
    permissions: undefined,
    achievements: undefined,
};

export const createUserStore = (initState: UserState = defaultInitState) => {
    return createStore<UserStore>()(
        persist(
            (set, get) => ({
                ...initState,
                setUser: (user: User) => {
                    set({ user, permissions: user.permissions ?? null });
                    if (user?.id) {
                        (async () => {
                            try {
                                const myAchievements = await achievementsApiClient.getMyAchievements();
                                if (myAchievements) {
                                    set({ achievements: myAchievements });
                                } else {
                                    set({ achievements: [] });
                                }
                            } catch (error) {
                                console.error('Failed to fetch user achievements on setUser', error);
                                set({ achievements: [] });
                            }
                        })();
                    }
                },
                clearUser: () => set({ user: undefined, permissions: null, achievements: null }),
                setAchievements: (achievements: Achievement[]) => set({ achievements }),
                fetchUserAchievements: async () => {
                    if (!get().user?.id) {
                        set({ achievements: [] });
                        return;
                    }
                    try {
                        const myAchievements = await achievementsApiClient.getMyAchievements();
                        if (myAchievements) {
                            set({ achievements: myAchievements });
                        } else {
                            set({ achievements: [] });
                        }
                    } catch (error) {
                        console.error('Failed to fetch user achievements', error);
                        set({ achievements: [] });
                    }
                },
            }),
            {
                name: 'user-storage',
                partialize: (state) => ({
                    user: state.user,
                    permissions: state.permissions,
                }),
            }
        )
    );
};
