import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { Profile } from '@/types';

import { ProfileState, ProfileStore } from './types';

export const defaultInitState: ProfileState = {
    profile: undefined,
};

export const createProfileStore = (initState: ProfileState = defaultInitState) => {
    return createStore<ProfileStore>()(
        persist(
            (set) => ({
                ...initState,
                setProfile: (profile: Profile) => set({ profile }),
                clearProfile: () => set({ profile: undefined }),
            }),
            {
                name: 'profile-storage',
            }
        )
    );
};

