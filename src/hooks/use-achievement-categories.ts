import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { adminApiClient } from '@/server/admin-api-client';

export const useAchievementCategories = () => {
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            setError(null);
            try {
                const categories = await adminApiClient.getAchievementCategories();
                if (isMounted) {
                    setAvailableCategories(categories || []);
                }
            } catch (err) {
                console.error('Failed to load achievement categories:', err);
                if (isMounted) {
                    setError('Не удалось загрузить категории достижений.');
                    toast.error('Не удалось загрузить категории достижений.');
                }
            } finally {
                if (isMounted) {
                    setIsLoadingCategories(false);
                }
            }
        };
        fetchCategories();
        return () => {
            isMounted = false;
        };
    }, []);

    return { availableCategories, isLoadingCategories, error };
};
