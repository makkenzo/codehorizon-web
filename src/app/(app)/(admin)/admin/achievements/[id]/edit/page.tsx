'use client';

import { useEffect, useState } from 'react';

import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { useParams, useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';
import { adminApiClient } from '@/server/admin-api-client';
import { AdminAchievementDTO } from '@/types/achievementsAdmin';

import AchievementForm from '../../_components/achievement-form';

const EditAchievementPage = () => {
    const router = useRouter();
    const params = useParams();
    const achievementId = params.id as string;
    const { hasPermission } = usePermissions();

    const [initialData, setInitialData] = useState<AdminAchievementDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (achievementId && hasPermission('achievement:admin:manage')) {
            const fetchAchievement = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await adminApiClient.getAchievementDefinitionById(achievementId);
                    setInitialData(data);
                } catch (err) {
                    console.error(err);
                    setError('Не удалось загрузить данные достижения.');
                    toast.error('Ошибка загрузки данных достижения.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAchievement();
        } else if (!hasPermission('achievement:admin:manage')) {
            setError('У вас нет прав для редактирования достижений.');
            setIsLoading(false);
        }
    }, [achievementId]);

    const handleFormSuccess = (updatedAchievement: AdminAchievementDTO) => {
        setInitialData(updatedAchievement);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Загрузка данных достижения...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        Ошибка
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!initialData && !isLoading) {
        return (
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        Достижение не найдено
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Достижение с ID {achievementId} не найдено.</p>
                </CardContent>
            </Card>
        );
    }

    return <AchievementForm initialData={initialData} onFormSubmitSuccess={handleFormSuccess} />;
};

export default EditAchievementPage;
