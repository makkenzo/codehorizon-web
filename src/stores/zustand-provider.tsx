'use client';

import { ReactNode } from 'react';

import { AllAchievementsStoreProvider } from './achievements/achievements-store-provider';
import { CatalogFiltersStoreProvider } from './catalog-filters/catalog-filters-store-provider';
import { NotificationsStoreProvider } from './notifications/notifications-store-provider';
import { ProfileStoreProvider } from './profile/profile-store-provider';
import { LessonTasksStoreProvider } from './tasks/tasks-store-provider';
import { UserStoreProvider } from './user/user-store-provider';

interface ZustandProviderProps {
    children: ReactNode;
}

const ZustandProvider = ({ children }: ZustandProviderProps) => {
    return (
        <ProfileStoreProvider>
            <UserStoreProvider>
                <CatalogFiltersStoreProvider>
                    <LessonTasksStoreProvider>
                        <NotificationsStoreProvider>
                            <AllAchievementsStoreProvider>{children}</AllAchievementsStoreProvider>
                        </NotificationsStoreProvider>
                    </LessonTasksStoreProvider>
                </CatalogFiltersStoreProvider>
            </UserStoreProvider>
        </ProfileStoreProvider>
    );
};

export default ZustandProvider;
