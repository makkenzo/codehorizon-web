import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { clearStorage as clearLocalTokens, setAccessToken, setRefreshToken } from '@/helpers/auth';

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
                setAccessToken: (accessToken: string | null) => {
                    set({ accessToken });
                    if (accessToken) setAccessToken(accessToken);
                },
                setRefreshToken: (refreshToken: string | null) => {
                    set({ refreshToken });
                    if (refreshToken) setRefreshToken(refreshToken);
                },
                clearTokens: () => {
                    clearLocalTokens();
                    set({ accessToken: null, refreshToken: null });
                },
            }),
            {
                name: 'auth-storage',
            }
        )
    );
};

