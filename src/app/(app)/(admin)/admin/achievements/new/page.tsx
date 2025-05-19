'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { AdminAchievementDTO } from '@/types/achievementsAdmin';

import AchievementForm from '../_components/achievement-form';

const CreateAchievementPage = () => {
    const router = useRouter();

    const handleFormSuccess = (createdAchievement: AdminAchievementDTO) => {
        router.push(`/admin/achievements/${createdAchievement.id}/edit`);
    };

    return <AchievementForm onFormSubmitSuccess={handleFormSuccess} />;
};

export default CreateAchievementPage;
