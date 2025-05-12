import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { User } from '@/models';

import { UserState, UserStore } from './types';

export const defaultInitState: UserState = {
    user: undefined,
    permissions: undefined,
};

export const createUserStore = (initState: UserState = defaultInitState) => {
    return createStore<UserStore>()(
        persist(
            (set) => ({
                ...initState,
                setUser: (user: User) => set({ user, permissions: user.permissions ?? null }),
                clearUser: () => set({ user: undefined, permissions: null }),
            }),
            {
                name: 'user-storage',
            }
        )
    );
};
