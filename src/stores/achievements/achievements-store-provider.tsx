import { ReactNode, createContext, useContext, useRef } from 'react';

import { useStore } from 'zustand';

import { createAllAchievementsStore } from './achievements-store';
import { AllAchievementsStore } from './types';

export type AllAchievementsApi = ReturnType<typeof createAllAchievementsStore>;

export const AllAchievementsStoreContext = createContext<AllAchievementsApi | undefined>(undefined);

export interface AllAchievementsStoreProviderProps {
    children: ReactNode;
}

export const AllAchievementsStoreProvider = ({ children }: AllAchievementsStoreProviderProps) => {
    const storeRef = useRef<AllAchievementsApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createAllAchievementsStore();
    }

    return (
        <AllAchievementsStoreContext.Provider value={storeRef.current}>{children}</AllAchievementsStoreContext.Provider>
    );
};

export const useAllAchievementsStore = <T,>(selector: (store: AllAchievementsStore) => T): T => {
    const allAchievementsStoreContext = useContext(AllAchievementsStoreContext);

    if (!allAchievementsStoreContext) {
        throw new Error(`useAllAchievementsStore must be used within AllAchievementsStoreProvider`);
    }

    return useStore(allAchievementsStoreContext, selector);
};
