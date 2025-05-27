import { ReactNode, createContext, useContext, useRef } from 'react';

import { useStoreWithEqualityFn } from 'zustand/traditional';

import { createNotificationsStore } from './notifications-store';
import { NotificationsStore } from './types';

export type NotificationsApi = ReturnType<typeof createNotificationsStore>;

export const NotificationsStoreContext = createContext<NotificationsApi | undefined>(undefined);

export interface NotificationsStoreProviderProps {
    children: ReactNode;
}

export const NotificationsStoreProvider = ({ children }: NotificationsStoreProviderProps) => {
    const storeRef = useRef<NotificationsApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createNotificationsStore();
    }

    return <NotificationsStoreContext.Provider value={storeRef.current}>{children}</NotificationsStoreContext.Provider>;
};

export const useNotificationsStore = <T,>(
    selector: (store: NotificationsStore) => T,
    equalityFn?: (a: T, b: T) => boolean
): T => {
    const notificationsStoreContext = useContext(NotificationsStoreContext);

    if (!notificationsStoreContext) {
        throw new Error(`useNotificationsStore must be used within NotificationsStoreProvider`);
    }

    return useStoreWithEqualityFn(notificationsStoreContext, selector, equalityFn);
};
