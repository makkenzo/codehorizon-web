'use client';

import { useSearchParams } from 'next/navigation';

import ProfileForm from '@/app/(app)/(main)/(protected)/me/profile/_components/form';
import MyAchievements from '@/app/(app)/(main)/(protected)/me/profile/_components/my-achievements';
import NotificationSettingsForm from '@/app/(app)/(main)/(protected)/me/profile/_components/notification-settings-form';

import PrivacySettingsForm from '../settings/privacy-settings-form';

const SecuritySettingsForm = () => (
    <div className="p-6 bg-card border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Настройки безопасности</h2>
        <p className="text-muted-foreground">Здесь будут настройки безопасности...</p>
    </div>
);
const PersonalizationSettingsForm = () => (
    <div className="p-6 bg-card border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Персонализация</h2>
        <p className="text-muted-foreground">Здесь будут настройки персонализации...</p>
    </div>
);

export default function ProfilePageContent() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');

    if (currentTab === 'notifications') {
        return <NotificationSettingsForm />;
    }
    if (currentTab === 'privacy') {
        return <PrivacySettingsForm />;
    }
    if (currentTab === 'security') {
        return <SecuritySettingsForm />;
    }
    if (currentTab === 'personalization') {
        return <PersonalizationSettingsForm />;
    }
    if (currentTab === 'achievements') {
        return <MyAchievements />;
    }

    return <ProfileForm />;
}
