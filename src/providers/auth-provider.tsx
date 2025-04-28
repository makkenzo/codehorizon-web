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
    const [isPending, setIsPending] = useState(true); // <--- Изначально true
    const { setProfile } = useProfileStore((state) => state);
    const { setUser } = useUserStore((state) => state);

    const fetchProfile = async () => {
        console.log('AuthProvider: fetchProfile started...'); // <--- Лог А
        try {
            const profile = await new ProfileApiClient().getProfile();
            console.log('AuthProvider: getProfile result:', profile); // <--- Лог Б
            if (profile) {
                setProfile(profile);
                const user = await new AuthApiClient().getMe();
                console.log('AuthProvider: getMe result:', user); // <--- Лог В
                if (user) {
                    setUser(user);
                    setIsAuthenticated(true); // <-- Устанавливаем auth = true
                    console.log('AuthProvider: User and Profile loaded, isAuthenticated=true'); // <--- Лог Г
                } else {
                    // Пользователя не получили, но профиль был? Странно, но возможно.
                    // Все равно завершаем pending, но пользователь не аутентифицирован.
                    setIsAuthenticated(false);
                    console.log('AuthProvider: Profile loaded, but getMe failed, isAuthenticated=false'); // <--- Лог Д
                }
            } else {
                // Профиль не загрузился, считаем неаутентифицированным
                setIsAuthenticated(false);
                console.log('AuthProvider: getProfile failed, isAuthenticated=false'); // <--- Лог Е
            }
        } catch (error) {
            // <--- Обрабатываем ошибки
            setIsAuthenticated(false);
            console.error('AuthProvider: Error in fetchProfile', error); // <--- Лог Ж
        } finally {
            // !!! ВАЖНО: Устанавливаем isPending = false В ЛЮБОМ СЛУЧАЕ !!!
            setIsPending(false); // <--- Вот эта строка должна выполниться
            console.log('AuthProvider: fetchProfile finished, isPending=false'); // <--- Лог З
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
