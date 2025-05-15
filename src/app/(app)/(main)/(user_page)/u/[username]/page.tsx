import { Suspense } from 'react';

import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { createMetadata } from '@/lib/metadata';
import { achievementsApiClient } from '@/server/achievements';
import { certificateApiClient } from '@/server/certificate';
import ProfileApiClient from '@/server/profile';

import UserProfileClientPage from './_components/user-profile-client-page';

interface UserPageProps {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
    const { username } = await params;
    const profileApiClient = new ProfileApiClient();
    const userProfile = await profileApiClient.getUserProfile(username).catch(() => null);

    if (!userProfile) {
        return createMetadata({
            title: 'Профиль не найден',
            description: `Профиль пользователя ${username} не найден на CodeHorizon.`,
            path: `/u/${username}`,
        });
    }

    const displayName =
        userProfile.profile.firstName || userProfile.profile.lastName
            ? `${userProfile.profile.firstName || ''} ${userProfile.profile.lastName || ''}`.trim()
            : userProfile.username;

    return createMetadata({
        title: `Профиль ${displayName}`,
        description:
            userProfile.profile.bio?.substring(0, 160) ||
            `Профиль пользователя ${displayName} на CodeHorizon. Узнайте о его курсах и достижениях.`,
        imageUrl: userProfile.profile.avatarUrl || undefined,
        path: `/u/${username}`,
    });
}

export default async function UserPage({ params }: UserPageProps) {
    const { username } = await params;
    const profileApiClient = new ProfileApiClient();

    const [userProfile, userCertificates, userAchievements] = await Promise.all([
        profileApiClient.getUserProfile(username),
        certificateApiClient.getPublicUserCertificates(username),
        achievementsApiClient.getPublicUserAchievements(username),
    ]).catch((error) => {
        console.error(`Ошибка при загрузке данных для профиля ${username}:`, error);

        return [null, null, null];
    });

    if (!userProfile) {
        notFound();
    }

    const safeUserCertificates = userCertificates ?? [];
    const safeUserAchievements = userAchievements ?? [];

    return (
        <Suspense
            fallback={
                <div className="flex h-screen w-full items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            }
        >
            <UserProfileClientPage
                userProfile={userProfile}
                userCertificates={safeUserCertificates}
                userAchievements={safeUserAchievements}
            />
        </Suspense>
    );
}
