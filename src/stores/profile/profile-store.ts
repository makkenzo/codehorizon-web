import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { Profile } from '@/models';

import { ProfileState, ProfileStore } from './types';

export const defaultInitState: ProfileState = {
    profile: undefined,
};

export const createProfileStore = (initState: ProfileState = defaultInitState) => {
    return createStore<ProfileStore>()((set) => ({
        ...initState,
        setProfile: (profile: Profile) => set({ profile }),
        clearProfile: () => set({ profile: undefined }),
    }));
};
