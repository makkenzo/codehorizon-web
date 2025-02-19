'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { setAccessToken } from '@/helpers/auth';
import AuthApiClient from '@/server/auth';

interface AuthContextType {
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            const token = await new AuthApiClient().getToken();
            if (token) {
                setAccessToken(token);
                setIsAuthenticated(true);
            }
        };

        fetchToken();
    }, []);

    return <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

