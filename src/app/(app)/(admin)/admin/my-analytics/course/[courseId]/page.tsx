'use client';

import { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { Activity, ArrowLeft, BookOpen, MessageSquare, Percent, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApiClient } from '@/server/admin-api-client';
import { AuthorCourseAnalytics } from '@/types/admin';

import StudentProgressTab from '../../../courses/[courseId]/edit/_components/student-progress-tab';

export default function CourseDetailedAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const [analytics, setAnalytics] = useState<AuthorCourseAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            const data = await adminApiClient.getAuthorCourseAnalytics(courseId);
            setAnalytics(data);
        } catch (error) {
            console.error(`Failed to fetch analytics for course ${courseId}:`, error);
            let errorMsg = 'Не удалось загрузить детальную аналитику курса.';
            if (isAxiosError(error)) {
                errorMsg = error?.response?.data?.message || error.message || errorMsg;
                if (error.response?.status === 403 || error.response?.status === 401) {
                    router.push('/admin/my-analytics');
                }
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }
            toast.error(errorMsg);
            setAnalytics(null);
        } finally {
            setIsLoading(false);
        }
    }, [courseId, router]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const StatCard = ({
        title,
        value,
        icon: Icon,
        description,
        isLoadingCard,
        color = 'primary',
        id,
    }: {
        title: string;
        value: string | number;
        icon: React.ElementType;
        description?: string;
        isLoadingCard?: boolean;
        color?: 'primary' | 'secondary' | 'green' | 'purple' | 'yellow';
        id: string;
    }) => {
        const colorMap = {
            primary: {
                bg: 'from-primary/5 to-transparent',
                text: 'from-primary to-primary/70',
                icon: 'text-primary',
                glow: 'bg-primary/10',
            },
            secondary: {
                bg: 'from-secondary/5 to-transparent',
                text: 'from-secondary to-secondary/70',
                icon: 'text-secondary',
                glow: 'bg-secondary/10',
            },
            green: {
                bg: 'from-green-500/5 to-transparent',
                text: 'from-green-500 to-green-500/70',
                icon: 'text-green-500',
                glow: 'bg-green-500/10',
            },
            purple: {
                bg: 'from-purple-500/5 to-transparent',
                text: 'from-purple-500 to-purple-500/70',
                icon: 'text-purple-500',
                glow: 'bg-purple-500/10',
            },
            yellow: {
                bg: 'from-yellow-500/5 to-transparent',
                text: 'from-yellow-500 to-yellow-500/70',
                icon: 'text-yellow-500',
                glow: 'bg-yellow-500/10',
            },
        };

        const isHovered = hoveredCard === id;

        return (
            <Card
                className="overflow-hidden border-border/40 backdrop-blur-sm bg-background/60 relative group hover:shadow-lg transition-all duration-300"
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${colorMap[color].bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>
                <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <div className="relative">
                        <div
                            className={`absolute inset-0 ${
                                colorMap[color].glow
                            } blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        ></div>
                        <Icon
                            className={`h-4 w-4 ${
                                isHovered ? colorMap[color].icon : 'text-muted-foreground'
                            } relative z-10 transition-colors duration-300`}
                        />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    {isLoadingCard ? (
                        <Skeleton className="h-8 w-24" />
                    ) : (
                        <div
                            className={`text-2xl font-bold bg-gradient-to-r ${
                                colorMap[color].text
                            } bg-clip-text text-transparent transition-all duration-300`}
                        >
                            {value}
                        </div>
                    )}
                    {description && !isLoadingCard && (
                        <p
                            className={`text-xs ${
                                isHovered ? colorMap[color].icon : 'text-muted-foreground'
                            } transition-colors duration-300`}
                        >
                            {description}
                        </p>
                    )}
                    {description && isLoadingCard && <Skeleton className="h-4 w-3/4 mt-1" />}
                </CardContent>
            </Card>
        );
    };

    if (isLoading && !analytics) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {[...Array(5)].map((_, i) => (
                        <StatCard
                            key={`skel-stat-${i}`}
                            id={`skel-${i}`}
                            title="Загрузка..."
                            value=""
                            icon={Activity}
                            isLoadingCard={true}
                            color={
                                i === 0
                                    ? 'primary'
                                    : i === 1
                                      ? 'secondary'
                                      : i === 2
                                        ? 'green'
                                        : i === 3
                                          ? 'yellow'
                                          : 'purple'
                            }
                        />
                    ))}
                </div>
                <Card className="border-border/40 backdrop-blur-sm bg-background/60 overflow-hidden relative">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!analytics) {
        return (
            <Card className="border-border/40 backdrop-blur-sm bg-background/60 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-destructive/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10">
                    <CardTitle className="bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
                        Ошибка
                    </CardTitle>
                    <CardDescription>Не удалось загрузить аналитику для этого курса.</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                    <Button
                        onClick={() => router.push('/admin/my-analytics')}
                        className="relative overflow-hidden group/btn"
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-destructive/10 to-destructive/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                        <ArrowLeft className="mr-2 h-4 w-4 relative z-10" />
                        <span className="relative z-10">Назад к списку</span>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    Аналитика курса:{' '}
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {analytics.courseTitle}
                    </span>
                </h1>
                <div className="flex gap-2">
                    <Link href="/admin/my-analytics">
                        <InteractiveHoverButton
                            icon={<ArrowLeft className="-4 w-4 relative z-10" />}
                            className="relative overflow-hidden group/btn border-border/40 bg-background/60 backdrop-blur-sm"
                        >
                            <span className="relative z-10">Назад</span>
                        </InteractiveHoverButton>
                    </Link>
                    <Link href={`/admin/courses/${analytics.courseId}/edit`}>
                        <InteractiveHoverButton
                            icon={<BookOpen className="h-4 w-4 relative z-10" />}
                            className="relative overflow-hidden group/btn border-border/40 bg-background/60 backdrop-blur-sm"
                        >
                            <span className="relative z-10">Редактировать курс</span>
                        </InteractiveHoverButton>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <StatCard
                    id="students"
                    title="Всего студентов"
                    value={analytics.totalEnrolledStudents}
                    icon={Users}
                    isLoadingCard={isLoading}
                    color="primary"
                />
                <StatCard
                    id="active"
                    title="Активных за 30 дней"
                    value={analytics.activeStudentsLast30Days}
                    icon={Activity}
                    isLoadingCard={isLoading}
                    color="secondary"
                />
                <StatCard
                    id="completion"
                    title="Среднее завершение"
                    value={`${analytics.averageCompletionRate.toFixed(1)}%`}
                    icon={Percent}
                    isLoadingCard={isLoading}
                    color="green"
                />
                <StatCard
                    id="rating"
                    title="Средний рейтинг"
                    value={analytics.averageRating.toFixed(1)}
                    icon={Star}
                    isLoadingCard={isLoading}
                    color="yellow"
                />
                <StatCard
                    id="reviews"
                    title="Всего отзывов"
                    value={analytics.totalReviews}
                    icon={MessageSquare}
                    isLoadingCard={isLoading}
                    color="purple"
                />
            </div>

            <Card className="border-border/40 backdrop-blur-sm bg-background/60 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-secondary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10">
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Прогресс студентов
                    </CardTitle>
                    <CardDescription>Детальный прогресс по каждому студенту курса.</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="rounded-md backdrop-blur-sm bg-background/40 overflow-hidden">
                        <StudentProgressTab courseId={courseId} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
