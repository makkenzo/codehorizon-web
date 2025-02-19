'use client';

import { type ReactNode, createContext, useContext, useRef } from 'react';

import { useStore } from 'zustand';

import { createProfileStore } from './profile-store';
import { ProfileStore } from './types';

export type ProfileStoreApi = ReturnType<typeof createProfileStore>;

export const ProfileStoreContext = createContext<ProfileStoreApi | undefined>(undefined);

export interface ProfileStoreProviderProps {
    children: ReactNode;
}

export const ProfileStoreProvider = ({ children }: ProfileStoreProviderProps) => {
    const storeRef = useRef<ProfileStoreApi>(null);
    if (!storeRef.current) {
        storeRef.current = createProfileStore();
    }

    return <ProfileStoreContext.Provider value={storeRef.current}>{children}</ProfileStoreContext.Provider>;
};

export const useProfileStore = <T,>(selector: (store: ProfileStore) => T): T => {
    const profileStoreContext = useContext(ProfileStoreContext);

    if (!profileStoreContext) {
        throw new Error(`useProfileStore must be used within ProfileStoreProvider`);
    }

    return useStore(profileStoreContext, selector);
};

