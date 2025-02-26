'use client';

import { ReactNode } from 'react';

import { ProfileStoreProvider } from './profile/profile-store-provider';
import { UserStoreProvider } from './user/user-store-provider';

interface ZustandProviderProps {
    children: ReactNode;
}

const ZustandProvider = ({ children }: ZustandProviderProps) => {
    return (
        <ProfileStoreProvider>
            <UserStoreProvider>{children}</UserStoreProvider>
        </ProfileStoreProvider>
    );
};

export default ZustandProvider;

