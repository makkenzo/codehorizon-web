import { User } from '@/models';

export type UserState = {
    user?: User;
};

export type UserActions = {
    setUser: (user: User) => void;
    clearUser: () => void;
};

export type UserStore = UserState & UserActions;

