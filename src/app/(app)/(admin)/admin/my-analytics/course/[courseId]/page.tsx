'use client';

import { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, BarChart3, BookOpen, Eye, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
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

    if (isLoading && !analytics) {
        return (
            <div className="relative min-h-screen py-8">
                <div className="absolute inset-0 overflow-hidden -z-10">
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-bl from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl opacity-60 animate-pulse delay-700"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 space-y-8">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-1/2 rounded-lg" />
                        <div className="flex gap-3">
                            <Skeleton className="h-10 w-24 rounded-lg" />
                            <Skeleton className="h-10 w-40 rounded-lg" />
                        </div>
                    </div>
                    <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50">
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4 rounded-md" />
                            <Skeleton className="h-4 w-1/2 rounded-md" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="relative min-h-screen py-8">
                <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 -z-20"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-gradient-to-br from-red-50/80 to-rose-50/80 backdrop-blur-lg shadow-xl border border-red-200/50 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5"></div>
                            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-xl opacity-60"></div>

                            <CardHeader className="relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-100 rounded-xl">
                                        <BarChart3 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                                            Ошибка загрузки
                                        </CardTitle>
                                        <CardDescription>
                                            Не удалось загрузить аналитику для этого курса
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <Button
                                    onClick={() => router.push('/admin/my-analytics')}
                                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Назад к списку
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen py-8">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 to-teal-500/15 rounded-full blur-3xl opacity-60 animate-pulse delay-700"></div>
                <div className="absolute bottom-1/3 -left-20 w-72 h-72 bg-gradient-to-tr from-blue-500/10 to-cyan-500/15 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-bl from-amber-500/10 to-orange-500/15 rounded-full blur-3xl opacity-60 animate-pulse delay-500"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg blur opacity-75"></div>
                                    <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-3">
                                        <BarChart3 className="h-8 w-8 text-violet-600" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
                                        Детальная аналитика
                                    </h1>
                                    <p className="text-slate-600">Полная статистика по курсу</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h2 className="text-xl lg:text-2xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    {analytics.courseTitle}
                                </h2>
                                <Badge variant="outline" className="mt-2 bg-white/80 backdrop-blur-sm">
                                    <Eye className="h-3 w-3 mr-1" />
                                    ID: {analytics.courseId}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/admin/my-analytics">
                                <Button
                                    variant="outline"
                                    className="bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Назад
                                </Button>
                            </Link>
                            <Link href={`/admin/courses/${analytics.courseId}/edit`}>
                                <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Редактировать курс
                                    <Zap className="h-3 w-3 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5"></div>
                        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -top-32 -left-32 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <CardHeader className="relative z-10 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-b border-white/30 py-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg blur opacity-75"></div>
                                    <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                        <TrendingUp className="h-5 w-5 text-violet-600" />
                                    </div>
                                </div>
                                <div>
                                    <CardTitle className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Прогресс студентов
                                    </CardTitle>
                                    <CardDescription>Детальный анализ успеваемости каждого студента</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10 p-6">
                            <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/50 overflow-hidden">
                                <StudentProgressTab courseId={courseId} />
                            </div>
                        </CardContent>

                        {/* Decorative elements */}
                        <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                            <Award className="h-20 w-20 text-violet-500 transform rotate-12" />
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
