import { User } from '@/models';

export type UserState = {
    user?: User;
    permissions?: string[] | null;
};

export type UserActions = {
    setUser: (user: User) => void;
    clearUser: () => void;
};

export type UserStore = UserState & UserActions;
