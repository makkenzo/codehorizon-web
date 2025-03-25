'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import AuthApiClient from '@/server/auth';
import ProfileApiClient from '@/server/profile';
import { useProfileStore } from '@/stores/profile/profile-store-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

interface AuthContextType {
    isAuthenticated: boolean;
    isPending: boolean;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, isPending: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPending, setIsPending] = useState(true);
    const { setProfile } = useProfileStore((state) => state);
    const { setUser } = useUserStore((state) => state);

    const fetchProfile = async () => {
        try {
            const profile = await new ProfileApiClient().getProfile();
            if (profile) {
                setProfile(profile);
                const user = await new AuthApiClient().getMe();
                if (user) setUser(user);
                setIsAuthenticated(true);
            }
        } catch {
        } finally {
            setIsPending(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        document.addEventListener('tokenRefreshed', fetchProfile);
        return () => {
            document.removeEventListener('tokenRefreshed', fetchProfile);
        };
    }, []);

    return <AuthContext.Provider value={{ isAuthenticated, isPending }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
