import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { AuthState, AuthStore } from './types';

export const defaultInitState: AuthState = {
    accessToken: null,
    refreshToken: null,
};

export const createAuthStore = (initState: AuthState = defaultInitState) => {
    return createStore<AuthStore>()(
        persist(
            (set) => ({
                ...initState,
                setAccessToken: (accessToken: string | null) => set({ accessToken }),
                setRefreshToken: (refreshToken: string | null) => set({ refreshToken }),
                clearTokens: () => set({ accessToken: null, refreshToken: null }),
            }),
            {
                name: 'auth-storage',
            }
        )
    );
};

