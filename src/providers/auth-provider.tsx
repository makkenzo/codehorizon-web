'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import AuthApiClient from '@/server/auth';
import { useAuthStore } from '@/stores/auth-store-provider';

interface AuthContextType {
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { setAccessToken, setRefreshToken } = useAuthStore((state) => state);

    useEffect(() => {
        const fetchToken = async () => {
            const response = await new AuthApiClient().getToken();

            if (response) {
                setAccessToken(response.access_token);
                setRefreshToken(response.refresh_token);
                setIsAuthenticated(true);
            }
        };

        fetchToken();
    }, []);

    return <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

