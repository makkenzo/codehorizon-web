'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import AuthApiClient from '@/server/auth';
import ProfileApiClient from '@/server/profile';
import { useProfileStore } from '@/stores/profile/profile-store-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

interface AuthContextType {
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { setProfile } = useProfileStore((state) => state);
    const { setUser } = useUserStore((state) => state);

    useEffect(() => {
        const fetchToken = async () => {
            const response = await new AuthApiClient().getToken();

            if (response) {
                setIsAuthenticated(true);
            }
        };

        const fetchProfile = async () => {
            await fetchToken();
            const profile = await new ProfileApiClient().getProfile();
            if (profile) {
                setProfile(profile);

                const user = await new AuthApiClient().getMe();

                if (user) setUser(user);
            }
        };

        fetchProfile();
    }, []);

    return <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

