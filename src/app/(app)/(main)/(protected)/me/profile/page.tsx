'use client';

import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

import PrivacySettingsForm from '@/components/settings/privacy-settings-form';

import ProfileForm from './_components/form';
import NotificationSettingsForm from './_components/notification-settings-form';

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

function ProfilePageContent() {
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

    return <ProfileForm />;
}

const ProfilePage = () => {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center p-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            }
        >
            <ProfilePageContent />
        </Suspense>
    );
};

export default ProfilePage;
