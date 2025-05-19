import { useCallback, useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ACHIEVEMENT_FORM_SCHEMA, AchievementFormData, INITIAL_ACHIEVEMENT_FORM_DATA } from '@/lib/constants';
import { adminApiClient } from '@/server/admin-api-client';
import { AchievementRarity, AchievementTriggerType } from '@/types/achievements';
import { AdminAchievementDTO, AdminCreateAchievementDTO, AdminUpdateAchievementDTO } from '@/types/achievementsAdmin';

import { usePermissions } from './use-permissions';

export const useAchievementFormEngine = (
    initialData?: AdminAchievementDTO | null,
    onFormSubmitSuccess?: (data: AdminAchievementDTO) => void
) => {
    const { hasPermission } = usePermissions();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!initialData?.id;

    const defaultFormValues = useMemo<AchievementFormData>(() => {
        if (initialData) {
            return {
                key: initialData.key,
                name: initialData.name,
                description: initialData.description,
                iconUrl: initialData.iconUrl,
                triggerType: initialData.triggerType,
                triggerThreshold: initialData.triggerThreshold,
                triggerThresholdValue: initialData.triggerThresholdValue || undefined,
                xpBonus: initialData.xpBonus,
                rarity: initialData.rarity,
                isGlobal: initialData.isGlobal,
                order: initialData.order,
                category: initialData.category || undefined,
                isHidden: initialData.isHidden,
                prerequisites: initialData.prerequisites || [],
            };
        }
        return INITIAL_ACHIEVEMENT_FORM_DATA;
    }, [initialData]);

    const form = useForm<AchievementFormData>({
        resolver: zodResolver(ACHIEVEMENT_FORM_SCHEMA),
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        form.reset(defaultFormValues);
    }, [defaultFormValues, form]);

    const watchedRarity = form.watch('rarity', initialData?.rarity || AchievementRarity.COMMON);

    const handleSubmit = useCallback(
        async (data: AchievementFormData) => {
            if (!hasPermission('achievement:admin:manage')) {
                toast.error('У вас нет прав для выполнения этого действия.');
                return;
            }
            setIsSubmitting(true);
            try {
                const payload = {
                    ...data,
                    triggerThresholdValue:
                        data.triggerThresholdValue?.trim() === '' ? null : data.triggerThresholdValue,
                    category: data.category?.trim() === '' ? null : data.category,
                };

                let result: AdminAchievementDTO;
                if (isEditMode && initialData) {
                    result = await adminApiClient.updateAchievementDefinition(
                        initialData.id,
                        payload as AdminUpdateAchievementDTO
                    );
                    toast.success(`Достижение "${result.name}" успешно обновлено!`);
                } else {
                    result = await adminApiClient.createAchievementDefinition(payload as AdminCreateAchievementDTO);
                    toast.success(`Достижение "${result.name}" успешно создано!`);
                }
                onFormSubmitSuccess?.(result);
            } catch (err: unknown) {
                let errorMsg = 'Произошла непредвиденная ошибка при сохранении достижения.';
                if (isAxiosError(err)) {
                    errorMsg = err.response?.data?.message || err.message || errorMsg;
                } else if (err instanceof Error) {
                    errorMsg = err.message;
                }
                toast.error(`Ошибка: ${errorMsg}`);
                console.error('Achievement form submission error:', err);
            } finally {
                setIsSubmitting(false);
            }
        },
        [hasPermission, isEditMode, initialData, onFormSubmitSuccess, form]
    );

    const {
        fields: prerequisiteFields,
        append: appendPrerequisite,
        remove: removePrerequisite,
    } = useFieldArray({
        control: form.control,
        name: 'prerequisites' as never,
    });

    return {
        form,
        isEditMode,
        isSubmitting,
        currentRarity: watchedRarity,
        handleSubmit,
        prerequisiteFields,
        appendPrerequisite,
        removePrerequisite,
    };
};
