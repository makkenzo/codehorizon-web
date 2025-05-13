'use client';

import { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { Activity, BookOpen, MessageSquare, Percent, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
    }: {
        title: string;
        value: string | number;
        icon: React.ElementType;
        description?: string;
        isLoadingCard?: boolean;
    }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoadingCard ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
                {description && !isLoadingCard && <p className="text-xs text-muted-foreground">{description}</p>}
                {description && isLoadingCard && <Skeleton className="h-4 w-3/4 mt-1" />}
            </CardContent>
        </Card>
    );

    if (isLoading && !analytics) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <StatCard
                            key={`skel-stat-${i}`}
                            title="Загрузка..."
                            value=""
                            icon={Activity}
                            isLoadingCard={true}
                        />
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
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
            <Card>
                <CardHeader>
                    <CardTitle>Ошибка</CardTitle>
                    <CardDescription>Не удалось загрузить аналитику для этого курса.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/admin/my-analytics')}>Назад к списку</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    Аналитика курса: <span className="text-primary">{analytics.courseTitle}</span>
                </h1>
                <Link href={`/admin/courses/${analytics.courseId}/edit`}>
                    <Button variant="outline">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Редактировать курс
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                <StatCard
                    title="Всего студентов"
                    value={analytics.totalEnrolledStudents}
                    icon={Users}
                    isLoadingCard={isLoading}
                />
                <StatCard
                    title="Активных за 30 дней"
                    value={analytics.activeStudentsLast30Days}
                    icon={Activity}
                    isLoadingCard={isLoading}
                />
                <StatCard
                    title="Среднее завершение"
                    value={`${analytics.averageCompletionRate.toFixed(1)}%`}
                    icon={Percent}
                    isLoadingCard={isLoading}
                />
                <StatCard
                    title="Средний рейтинг"
                    value={analytics.averageRating.toFixed(1)}
                    icon={Star}
                    isLoadingCard={isLoading}
                />
                <StatCard
                    title="Всего отзывов"
                    value={analytics.totalReviews}
                    icon={MessageSquare}
                    isLoadingCard={isLoading}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Прогресс студентов</CardTitle>
                    <CardDescription>Детальный прогресс по каждому студенту курса.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StudentProgressTab courseId={courseId} />
                    {/* 
                        Если StudentProgressTab не использует LinkedChart внутри, 
                        а вы хотите, чтобы он был здесь, вам нужно будет передать 
                        ему данные и конфигурацию для LinkedChart, либо обернуть его.
                        Для StudentProgressTab уже есть своя логика загрузки данных 
                        и пагинации, поэтому интегрировать LinkedChart нужно будет аккуратно.
                    */}
                </CardContent>
            </Card>
        </div>
    );
}
