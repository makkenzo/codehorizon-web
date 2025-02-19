import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { User } from '@/types';

import { UserState, UserStore } from './types';

export const defaultInitState: UserState = {
    user: undefined,
};

export const createUserStore = (initState: UserState = defaultInitState) => {
    return createStore<UserStore>()(
        persist(
            (set) => ({
                ...initState,
                setUser: (user: User) => set({ user }),
                clearUser: () => set({ user: undefined }),
            }),
            {
                name: 'profile-storage',
            }
        )
    );
};

