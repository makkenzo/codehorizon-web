'use client';

import { motion } from 'framer-motion';
import { Award, BookOpen, Briefcase, GraduationCap, LinkIcon, MapPin, UserCheck } from 'lucide-react';

import AchievementsList from '@/components/achievements/achievement-list';
import CourseCard from '@/components/course/card';
import PageWrapper from '@/components/reusable/page-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/models';
import { PublicCertificateInfoDTO } from '@/types';
import { GlobalAchievementDTO } from '@/types/achievements';

interface UserProfileClientPageProps {
    userProfile: UserProfile;
    userCertificates: PublicCertificateInfoDTO[];
    userAchievements: GlobalAchievementDTO[];
}

const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
    <motion.div
        className="flex items-center space-x-3 p-3 bg-muted/30 dark:bg-muted/10 rounded-lg transition-all hover:bg-muted/50 dark:hover:bg-muted/20"
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 300 }}
    >
        <div className="flex-shrink-0 text-primary">{icon}</div>
        <div>
            <p className="text-sm font-medium text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </motion.div>
);

const UserCertificatesList = ({ certificates }: { certificates: PublicCertificateInfoDTO[] }) => {
    if (!certificates || certificates.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                У этого пользователя пока нет сертификатов.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {certificates.map((cert, index) => (
                <motion.div
                    key={index}
                    className="flex items-center gap-4 p-4 border border-border/30 dark:border-border/20 rounded-xl bg-card hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold text-foreground">{cert.courseTitle}</p>
                        <p className="text-xs text-muted-foreground">
                            Получен: {new Date(cert.completionDate).toLocaleDateString('ru-RU')}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const StatCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="overflow-hidden bg-card/80 dark:bg-background/60 backdrop-blur-sm border-border/30 dark:border-border/20 shadow-lg hover:shadow-xl transition-shadow py-0 pb-0 gap-5">
        <CardHeader className="border-b border-border/20 dark:border-border/10 pt-4 px-5 !pb-0">
            <CardTitle className="text-lg font-semibold text-primary pb-0">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">{children}</CardContent>
    </Card>
);

export default function UserProfileClientPage({
    userProfile,
    userCertificates,
    userAchievements,
}: UserProfileClientPageProps) {
    const { profile, coursesInProgress, completedCoursesCount, createdCourses, username, level } = userProfile;
    const showCertificates = userCertificates && userCertificates.length > 0;
    const avatarColorFallback = profile.avatarColor || '#3ECCB2';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
            },
        },
    };

    return (
        <PageWrapper className="mb-16">
            {/* Hero Section */}
            <motion.div
                className="relative mb-28"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div
                    className="w-full h-[200px] md:h-[280px] rounded-xl shadow-inner"
                    style={{
                        background: `${avatarColorFallback}`,
                    }}
                />
                <div className="absolute -bottom-20 left-6 md:left-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                    <Avatar className="size-32 md:size-40 border-4 border-background bg-background shadow-xl">
                        {profile.avatarUrl ? (
                            <AvatarImage src={profile.avatarUrl} alt={username} className="object-cover" />
                        ) : null}
                        <AvatarFallback
                            className="text-5xl md:text-6xl font-semibold select-none"
                            style={{ backgroundColor: avatarColorFallback, color: '#fff' }}
                        >
                            {username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="pb-2 sm:pb-4 text-center sm:text-left">
                        <h1 className="font-bold text-2xl md:text-3xl text-foreground flex items-center gap-2 justify-center sm:justify-start">
                            {profile.firstName || profile.lastName
                                ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                                : username}
                            {level && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs font-semibold bg-primary/10 text-primary border-primary/30"
                                >
                                    Ур. {level}
                                </Badge>
                            )}
                        </h1>
                        {(profile.firstName || profile.lastName) && (
                            <h2 className="text-muted-foreground text-sm md:text-base">@{username}</h2>
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mt-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="md:col-span-4 space-y-6" variants={itemVariants}>
                    {profile.bio && (
                        <StatCard title="Обо мне">
                            <p className="text-sm text-foreground/90 dark:text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                {profile.bio}
                            </p>
                        </StatCard>
                    )}

                    {(profile.location || profile.website) && (
                        <StatCard title="Информация">
                            {profile.location && (
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                                    <span className="text-foreground/90 dark:text-foreground/80">
                                        {profile.location}
                                    </span>
                                </div>
                            )}
                            {profile.website && (
                                <div className="flex items-center gap-3 text-sm">
                                    <LinkIcon className="h-5 w-5 text-primary flex-shrink-0" />
                                    <a
                                        href={profile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline truncate"
                                    >
                                        {profile.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}
                        </StatCard>
                    )}

                    <StatCard title="Статистика">
                        <StatItem
                            icon={<BookOpen size={20} />}
                            label="Курсов в процессе"
                            value={coursesInProgress?.length ?? 0}
                        />
                        <StatItem
                            icon={<GraduationCap size={20} />}
                            label="Завершено курсов"
                            value={completedCoursesCount}
                        />
                        {showCertificates && (
                            <StatItem
                                icon={<Award size={20} />}
                                label="Получено сертификатов"
                                value={userCertificates?.length ?? 0}
                            />
                        )}
                        {createdCourses && createdCourses.length > 0 && (
                            <StatItem
                                icon={<UserCheck size={20} />}
                                label="Создано курсов"
                                value={createdCourses.length}
                            />
                        )}
                    </StatCard>

                    {userAchievements && userAchievements.length > 0 && (
                        <StatCard title="Достижения">
                            <AchievementsList achievements={userAchievements} itemsPerRow={4} compact />
                        </StatCard>
                    )}
                </motion.div>

                {/* Right Column */}
                <motion.div className="md:col-span-8 space-y-8" variants={itemVariants}>
                    {coursesInProgress && coursesInProgress.length > 0 && (
                        <motion.section variants={itemVariants}>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Сейчас изучает</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {coursesInProgress.map((courseInfo, idx) => (
                                    <motion.div key={courseInfo.id} variants={itemVariants} custom={idx}>
                                        <CourseCard course={courseInfo} progress={courseInfo.progress ?? undefined} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {createdCourses && createdCourses.length > 0 && (
                        <motion.section variants={itemVariants}>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Созданные курсы</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {createdCourses.map((courseInfo, idx) => (
                                    <motion.div key={courseInfo.id} variants={itemVariants} custom={idx}>
                                        <CourseCard course={courseInfo} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {showCertificates && userCertificates && (
                        <motion.section variants={itemVariants}>
                            <Card className="overflow-hidden bg-card/80 dark:bg-background/60 backdrop-blur-sm border-border/30 dark:border-border/20 shadow-lg">
                                <CardHeader className="border-b border-border/20 dark:border-border/10 pb-3 pt-4 px-5">
                                    <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                                        <Award size={22} /> Полученные сертификаты
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <UserCertificatesList certificates={userCertificates} />
                                </CardContent>
                            </Card>
                        </motion.section>
                    )}

                    {(!coursesInProgress || coursesInProgress.length === 0) &&
                        (!createdCourses || createdCourses.length === 0) && (
                            <motion.div
                                className="text-center text-muted-foreground mt-10 bg-card/50 dark:bg-background/30 p-8 rounded-xl shadow-sm border border-border/20"
                                variants={itemVariants}
                            >
                                <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="text-lg">Пользователь пока не добавил курсы или не начал обучение.</p>
                            </motion.div>
                        )}
                </motion.div>
            </motion.div>
        </PageWrapper>
    );
}
