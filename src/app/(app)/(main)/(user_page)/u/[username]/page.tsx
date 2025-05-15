import { Award, LinkIcon, MapPin } from 'lucide-react';
import { Metadata } from 'next';

import { notFound } from 'next/navigation';

import AchievementsList from '@/components/achievements/achievement-list';
import CourseCard from '@/components/course/card';
import PageWrapper from '@/components/reusable/page-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createMetadata } from '@/lib/metadata';
import { achievementsApiClient } from '@/server/achievements';
import { certificateApiClient } from '@/server/certificate';
import ProfileApiClient from '@/server/profile';
import { GlobalAchievementDTO, PublicCertificateInfoDTO } from '@/types';

interface UserPageProps {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
    const username = (await params).username;
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

const UserCertificatesList = ({ certificates }: { certificates: PublicCertificateInfoDTO[] }) => {
    if (!certificates || certificates.length === 0) {
        return <p className="text-sm text-muted-foreground">У этого пользователя пока нет сертификатов.</p>;
    }

    return (
        <div className="space-y-3">
            {certificates.map((cert, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-md bg-card/50">
                    <Award className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-grow">
                        <p className="font-medium text-sm">{cert.courseTitle}</p>
                        <p className="text-xs text-muted-foreground">Получен: {cert.completionDate}</p>
                    </div>
                    {/* Если будет ссылка на валидацию:
                    {cert.uniqueCertificateId && (
                        <Link href={`/verify-certificate/${cert.uniqueCertificateId}`} passHref>
                            <Button variant="outline" size="sm" className="text-xs">Проверить</Button>
                        </Link>
                    )}
                    */}
                </div>
            ))}
        </div>
    );
};

const UserPage = async ({ params }: UserPageProps) => {
    const { username } = await params;
    const profileApiClient = new ProfileApiClient();

    const userProfilePromise = profileApiClient.getUserProfile(username);
    const userCertificatesPromise = certificateApiClient.getPublicUserCertificates(username);
    const userAchievementsPromise = achievementsApiClient.getPublicUserAchievements(username);

    const [userProfile, userCertificates, userAchievements] = await Promise.all([
        userProfilePromise,
        userCertificatesPromise,
        userAchievementsPromise,
    ]).catch((error) => {
        console.error(`Ошибка при загрузке данных для профиля ${username}:`, error);
        return [null, null, null];
    });

    if (!userProfile) {
        notFound();
    }

    const { profile, coursesInProgress, completedCoursesCount, createdCourses } = userProfile;

    const showCertificates = userCertificates && userCertificates.length > 0;

    return (
        <PageWrapper className="mb-10">
            <div
                className="w-full h-[150px] md:h-[200px] relative rounded-lg mb-20 md:mb-24"
                style={{ backgroundColor: profile.avatarColor ?? '#3ECCB2' }}
            >
                <div className="absolute -bottom-16 md:-bottom-20 left-6 md:left-10 flex items-end gap-4">
                    <Avatar className="size-32 md:size-40 border-4 border-white dark:border-background shadow-md">
                        {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={userProfile.username} /> : null}
                        <AvatarFallback className="text-[50px] md:text-[70px] select-none">
                            {userProfile.username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="pb-2 flex flex-col">
                        <h1 className="font-bold text-xl md:text-2xl leading-tight flex items-center gap-2">
                            {profile.firstName || profile.lastName
                                ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                                : userProfile.username}
                            {userProfile.level && (
                                <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary">
                                    Ур. {userProfile.level}
                                </Badge>
                            )}
                        </h1>

                        {(profile.firstName || profile.lastName) && (
                            <h2 className="text-muted-foreground text-sm md:text-base">@{userProfile.username}</h2>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-6">
                <div className="md:col-span-1 space-y-6">
                    {profile.bio ? (
                        <div className="bg-card p-4 rounded-lg shadow-sm border">
                            <h3 className="font-semibold mb-2 text-lg">О себе</h3>
                            <p className="text-sm text-card-foreground/80 whitespace-pre-wrap">{profile.bio}</p>
                        </div>
                    ) : null}

                    <div className="bg-card p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold mb-3 text-lg">Статистика</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Курсов в процессе:</span>
                                <span className="font-medium">{coursesInProgress?.length ?? 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Завершено курсов:</span>
                                <span className="font-medium">{completedCoursesCount}</span>
                            </div>

                            {showCertificates && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Получено сертификатов:</span>
                                    <span className="font-medium">{userCertificates?.length ?? 0}</span>
                                </div>
                            )}
                            {createdCourses && createdCourses.length > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Создано курсов:</span>
                                    <span className="font-medium">{createdCourses.length}</span>
                                </div>
                            )}
                        </div>
                        {userAchievements && userAchievements.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-semibold mb-3 text-lg">Достижения</h3>
                                <AchievementsList achievements={userAchievements} itemsPerRow={3} compact />
                            </div>
                        )}
                    </div>

                    {(profile.location || profile.website) && (
                        <div className="bg-card p-4 rounded-lg shadow-sm border">
                            <h3 className="font-semibold mb-3 text-lg">Информация</h3>
                            <div className="space-y-2 text-sm">
                                {profile.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                {profile.website && (
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline truncate"
                                        >
                                            {profile.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 space-y-8">
                    {coursesInProgress && coursesInProgress.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-4 text-xl">Сейчас изучает</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {coursesInProgress.map((courseInfo) => (
                                    <CourseCard
                                        key={courseInfo.id}
                                        course={courseInfo}
                                        progress={courseInfo.progress ?? undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {createdCourses && createdCourses.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-4 text-xl">Созданные курсы</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {createdCourses.map((courseInfo) => (
                                    <CourseCard key={courseInfo.id} course={courseInfo} />
                                ))}
                            </div>
                        </div>
                    )}

                    {showCertificates && userCertificates && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Полученные сертификаты</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <UserCertificatesList certificates={userCertificates} />
                            </CardContent>
                        </Card>
                    )}

                    {(!coursesInProgress || coursesInProgress.length === 0) &&
                        (!createdCourses || createdCourses.length === 0) && (
                            <div className="text-center text-muted-foreground mt-10 bg-card p-6 rounded-lg shadow-sm border">
                                Пользователь пока не добавил курсы или не начал обучение.
                            </div>
                        )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default UserPage;
