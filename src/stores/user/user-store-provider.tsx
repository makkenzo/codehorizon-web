'use client';

import { type ReactNode, createContext, useContext, useRef } from 'react';

import { useStore } from 'zustand';

import { UserStore } from './types';
import { createUserStore } from './user-store';

export type UserStoreApi = ReturnType<typeof createUserStore>;

export const UserStoreContext = createContext<UserStoreApi | undefined>(undefined);

export interface UserStoreProviderProps {
    children: ReactNode;
}

export const UserStoreProvider = ({ children }: UserStoreProviderProps) => {
    const storeRef = useRef<UserStoreApi>(null);
    if (!storeRef.current) {
        storeRef.current = createUserStore();
    }

    return <UserStoreContext.Provider value={storeRef.current}>{children}</UserStoreContext.Provider>;
};

export const useUserStore = <T,>(selector: (store: UserStore) => T): T => {
    const userStoreContext = useContext(UserStoreContext);

    if (!userStoreContext) {
        throw new Error(`useUserStore must be used within UserStoreProvider`);
    }

    return useStore(userStoreContext, selector);
};

