import { Profile } from '@/types';

export type ProfileState = {
    profile?: Profile;
};

export type ProfileActions = {
    setProfile: (profile: Profile) => void;
    clearProfile: () => void;
};

export type ProfileStore = ProfileState & ProfileActions;

