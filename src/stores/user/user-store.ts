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
                    console.log('Fetching user achievements');
                    if (!get().user?.id) {
                        console.log('No user ID, clearing achievements');
                        set({ achievements: [] });
                        return;
                    }
                    try {
                        const myAchievements = await achievementsApiClient.getMyAchievements();
                        console.log('Fetched user achievements', myAchievements);
                        if (myAchievements) {
                            console.log('Setting achievements');
                            set({ achievements: myAchievements });
                        } else {
                            console.log('No achievements found, clearing');
                            set({ achievements: [] });
                        }
                    } catch (error) {
                        console.error('Failed to fetch user achievements', error);
                        console.log('Clearing achievements');
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
