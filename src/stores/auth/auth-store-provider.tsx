'use client';

import { type ReactNode, createContext, useContext, useRef } from 'react';

import { useStore } from 'zustand';

import { createAuthStore } from './auth-store';
import { AuthStore } from './types';

export type AuthStoreApi = ReturnType<typeof createAuthStore>;

export const AuthStoreContext = createContext<AuthStoreApi | undefined>(undefined);

export interface AuthStoreProviderProps {
    children: ReactNode;
}

export const AuthStoreProvider = ({ children }: AuthStoreProviderProps) => {
    const storeRef = useRef<AuthStoreApi>(null);
    if (!storeRef.current) {
        storeRef.current = createAuthStore();
    }

    return <AuthStoreContext.Provider value={storeRef.current}>{children}</AuthStoreContext.Provider>;
};

export const useAuthStore = <T,>(selector: (store: AuthStore) => T): T => {
    const authStoreContext = useContext(AuthStoreContext);

    if (!authStoreContext) {
        throw new Error(`useAuthStore must be used within AuthStoreProvider`);
    }

    return useStore(authStoreContext, selector);
};

