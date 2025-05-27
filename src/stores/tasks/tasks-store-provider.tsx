import { type ReactNode, createContext, useContext, useRef } from 'react';

import { useStoreWithEqualityFn } from 'zustand/traditional';

import { createLessonTasksStore } from './tasks-store';
import type { LessonTasksStore } from './types';

export type LessonTasksStoreApi = ReturnType<typeof createLessonTasksStore>;
export const LessonTasksStoreContext = createContext<LessonTasksStoreApi | undefined>(undefined);

export interface LessonTasksStoreProviderProps {
    children: ReactNode;
}

export const LessonTasksStoreProvider = ({ children }: LessonTasksStoreProviderProps) => {
    const storeRef = useRef<LessonTasksStoreApi>(null);
    if (!storeRef.current) {
        storeRef.current = createLessonTasksStore();
    }
    return <LessonTasksStoreContext.Provider value={storeRef.current}>{children}</LessonTasksStoreContext.Provider>;
};

export const useLessonTasksStore = <T,>(
    selector: (store: LessonTasksStore) => T,
    equalityFn?: (a: T, b: T) => boolean
): T => {
    const lessonTasksStoreContext = useContext(LessonTasksStoreContext);
    if (!lessonTasksStoreContext) {
        throw new Error(`useLessonTasksStore must be used within LessonTasksStoreProvider`);
    }
    return useStoreWithEqualityFn(lessonTasksStoreContext, selector, equalityFn);
};
