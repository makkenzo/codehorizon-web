'use client';

import { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowUpDown, BarChart3, BookOpen, Eye, Star, Target, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MyPagination from '@/components/reusable/my-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApiClient } from '@/server/admin-api-client';
import { PagedResponse } from '@/types';
import { AuthorCourseListItemAnalytics } from '@/types/admin';

export default function MyCoursesAnalyticsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [data, setData] = useState<PagedResponse<AuthorCourseListItemAnalytics> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 10;
    const currentSort = searchParams.get('sortBy') || 'totalEnrolledStudents_desc';

    const createUrl = (page: number, sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        params.set('sortBy', sort);
        return `${pathname}?${params.toString()}`;
    };

    const fetchData = useCallback(
        async (page: number, sort: string) => {
            setIsLoading(true);
            try {
                const result = await adminApiClient.getAuthorCoursesWithAnalytics(page, pageSize, sort);
                setData(result);
            } catch (error: unknown) {
                console.error('Failed to fetch author courses analytics:', error);
                let errorMsg = 'Не удалось загрузить аналитику курсов.';
                if (isAxiosError(error)) {
                    errorMsg = error?.response?.data?.message || error.message || errorMsg;
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }
                toast.error(errorMsg);
                setData(null);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize]
    );

    useEffect(() => {
        fetchData(currentPage, currentSort);
    }, [fetchData, currentPage, currentSort]);

    const handlePageChange = (newPage: number) => {
        router.push(createUrl(newPage, currentSort), { scroll: false });
    };

    const handleSort = (columnKey: string) => {
        const [currentColumn, currentDirection = 'desc'] = currentSort.split('_');
        let newDirection = 'desc';
        if (columnKey === currentColumn) {
            newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        }
        const newSort = `${columnKey}_${newDirection}`;
        router.push(createUrl(1, newSort), { scroll: false });
    };

    const renderSortIcon = (columnKey: string) => {
        const [currentColumn, currentDirection = 'desc'] = currentSort.split('_');
        if (columnKey !== currentColumn) {
            return <ArrowUpDown className="ml-2 h-3 w-3 text-slate-400 opacity-50" />;
        }
        return (
            <span
                className={`ml-2 text-xs font-bold transition-colors duration-200 ${
                    currentDirection === 'asc' ? 'text-emerald-600' : 'text-violet-600'
                }`}
            >
                {currentDirection === 'asc' ? '▲' : '▼'}
            </span>
        );
    };

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skel-course-${index}`} className="bg-white/40 backdrop-blur-sm">
                <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-12 w-20 rounded-lg" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                </TableCell>
                <TableCell className="text-center">
                    <Skeleton className="h-5 w-12 rounded-md mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                    <Skeleton className="h-5 w-16 rounded-md mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                    <Skeleton className="h-5 w-20 rounded-md mx-auto" />
                </TableCell>
                <TableCell className="text-right">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </TableCell>
            </TableRow>
        ));

    const summaryStats = data?.content
        ? {
              totalStudents: data.content.reduce((sum, course) => sum + course.totalEnrolledStudents, 0),
              avgCompletion:
                  data.content.reduce((sum, course) => sum + course.averageCompletionRate, 0) / data.content.length,
              avgRating: data.content.reduce((sum, course) => sum + course.averageRating, 0) / data.content.length,
              totalCourses: data.content.length,
          }
        : null;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <div className="relative min-h-screen p-8">
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
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg blur opacity-75"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-3">
                                <BarChart3 className="h-8 w-8 text-violet-600" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                Аналитика моих курсов
                            </h1>
                            <p className="text-slate-600 mt-2">Обзор успеваемости и популярности ваших курсов</p>
                        </div>
                    </div>

                    {summaryStats && (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            <motion.div variants={item}>
                                <Card className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-100 rounded-xl">
                                                <BookOpen className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium">Всего курсов</p>
                                                <p className="text-2xl font-bold text-blue-800">
                                                    {summaryStats.totalCourses}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={item}>
                                <Card className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-emerald-100 rounded-xl">
                                                <Users className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-emerald-600 font-medium">Всего студентов</p>
                                                <p className="text-2xl font-bold text-emerald-800">
                                                    {summaryStats.totalStudents}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={item}>
                                <Card className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardContent className="px-6 py-[14px]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-amber-100 rounded-xl">
                                                <Target className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-amber-600 font-medium">Среднее завершение</p>
                                                <p className="text-2xl font-bold text-amber-800">
                                                    {summaryStats.avgCompletion.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={item}>
                                <Card className="bg-gradient-to-br from-violet-50/80 to-purple-50/80 backdrop-blur-sm border border-violet-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-violet-100 rounded-xl">
                                                <Star className="h-6 w-6 text-violet-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-violet-600 font-medium">Средний рейтинг</p>
                                                <p className="text-2xl font-bold text-violet-800">
                                                    {summaryStats.avgRating.toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5"></div>
                        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -top-32 -left-32 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <CardHeader className="relative z-10 flex items-center bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-b border-white/30 !py-0">
                            <div className="flex items-center gap-3 p-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg blur opacity-75"></div>
                                    <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                        <Activity className="h-5 w-5 text-violet-600" />
                                    </div>
                                </div>
                                <div>
                                    <CardTitle className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                        Детальная аналитика курсов
                                    </CardTitle>
                                    <CardDescription>Подробная статистика по каждому курсу</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="relative z-10 p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-slate-50/50 to-slate-100/50 hover:from-slate-50/70 hover:to-slate-100/70 border-b border-slate-200/50">
                                            <TableHead className="hidden sm:table-cell w-[120px] font-semibold text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    Превью
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-slate-100/50 transition-colors duration-200 font-semibold text-slate-700"
                                                onClick={() => handleSort('courseTitle')}
                                            >
                                                <div className="flex items-center">
                                                    <BookOpen className="h-4 w-4 mr-2" />
                                                    Название курса {renderSortIcon('courseTitle')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-center cursor-pointer hover:bg-slate-100/50 transition-colors duration-200 font-semibold text-slate-700"
                                                onClick={() => handleSort('totalEnrolledStudents')}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Студенты {renderSortIcon('totalEnrolledStudents')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-center cursor-pointer hover:bg-slate-100/50 transition-colors duration-200 font-semibold text-slate-700"
                                                onClick={() => handleSort('averageCompletionRate')}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <Target className="h-4 w-4 mr-2" />
                                                    Завершение {renderSortIcon('averageCompletionRate')}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="text-center cursor-pointer hover:bg-slate-100/50 transition-colors duration-200 font-semibold text-slate-700"
                                                onClick={() => handleSort('averageRating')}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <Star className="h-4 w-4 mr-2" />
                                                    Рейтинг {renderSortIcon('averageRating')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-slate-700">
                                                <div className="flex items-center justify-end gap-2">
                                                    <BarChart3 className="h-4 w-4" />
                                                    Детали
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence>
                                            {isLoading ? (
                                                renderSkeletons(pageSize)
                                            ) : data && data.content.length > 0 ? (
                                                data.content.map((course, index) => (
                                                    <motion.tr
                                                        key={course.courseId}
                                                        className={`transition-all duration-300 border-b border-slate-100/50 ${
                                                            hoveredRow === course.courseId
                                                                ? 'bg-gradient-to-r from-violet-50/30 to-fuchsia-50/30 shadow-sm'
                                                                : 'bg-white/40 hover:bg-white/60'
                                                        }`}
                                                        onMouseEnter={() => setHoveredRow(course.courseId)}
                                                        onMouseLeave={() => setHoveredRow(null)}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                                    >
                                                        <TableCell className="hidden sm:table-cell">
                                                            <div className="relative overflow-hidden rounded-lg group/image shadow-md">
                                                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-10"></div>
                                                                <Image
                                                                    src={
                                                                        course.imagePreview ||
                                                                        '/placeholder.svg?height=90&width=160'
                                                                    }
                                                                    alt={course.courseTitle}
                                                                    width={160}
                                                                    height={90}
                                                                    className="object-cover aspect-video transition-transform duration-300 group-hover/image:scale-110 rounded-lg"
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 rounded-lg transition-colors duration-300"></div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            <div className="space-y-1">
                                                                <span
                                                                    className={`transition-all duration-300 block ${
                                                                        hoveredRow === course.courseId
                                                                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-semibold'
                                                                            : 'text-slate-800'
                                                                    }`}
                                                                >
                                                                    {course.courseTitle.slice(0, 30)}
                                                                    {course.courseTitle.length > 30 ? '...' : ''}
                                                                </span>
                                                                <div className="text-xs text-slate-500">
                                                                    ID: {course.courseId}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div
                                                                    className={`relative transition-all duration-300 ${
                                                                        hoveredRow === course.courseId
                                                                            ? 'scale-110'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`absolute inset-0 bg-emerald-500/20 rounded-full blur-sm opacity-0 transition-opacity duration-300 ${
                                                                            hoveredRow === course.courseId
                                                                                ? 'opacity-100'
                                                                                : ''
                                                                        }`}
                                                                    ></div>
                                                                    <div className="relative bg-emerald-100 rounded-full p-2">
                                                                        <Users
                                                                            className={`h-4 w-4 transition-colors duration-300 ${
                                                                                hoveredRow === course.courseId
                                                                                    ? 'text-emerald-600'
                                                                                    : 'text-emerald-500'
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <span
                                                                        className={`text-lg font-bold transition-colors duration-300 ${
                                                                            hoveredRow === course.courseId
                                                                                ? 'text-emerald-600'
                                                                                : 'text-slate-800'
                                                                        }`}
                                                                    >
                                                                        {course.totalEnrolledStudents}
                                                                    </span>
                                                                    <div className="text-xs text-slate-500">
                                                                        студентов
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`relative transition-all duration-300 ${
                                                                        hoveredRow === course.courseId
                                                                            ? 'scale-110'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`absolute inset-0 bg-amber-500/20 rounded-full blur-sm opacity-0 transition-opacity duration-300 ${
                                                                            hoveredRow === course.courseId
                                                                                ? 'opacity-100'
                                                                                : ''
                                                                        }`}
                                                                    ></div>
                                                                    <div className="relative bg-amber-100 rounded-full p-2">
                                                                        <Target
                                                                            className={`h-4 w-4 transition-colors duration-300 ${
                                                                                hoveredRow === course.courseId
                                                                                    ? 'text-amber-600'
                                                                                    : 'text-amber-500'
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="w-full max-w-[80px]">
                                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                                        <span
                                                                            className={`font-medium transition-colors duration-300 ${
                                                                                hoveredRow === course.courseId
                                                                                    ? 'text-amber-600'
                                                                                    : 'text-slate-600'
                                                                            }`}
                                                                        >
                                                                            {course.averageCompletionRate.toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                    <Progress
                                                                        value={course.averageCompletionRate}
                                                                        className="h-2 bg-amber-100"
                                                                        indicatorClassName={`transition-all duration-500 ${
                                                                            course.averageCompletionRate >= 80
                                                                                ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                                                                : course.averageCompletionRate >= 50
                                                                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                                                                                  : 'bg-gradient-to-r from-rose-500 to-red-500'
                                                                        }`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div
                                                                    className={`relative transition-all duration-300 ${
                                                                        hoveredRow === course.courseId
                                                                            ? 'scale-110'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`absolute inset-0 bg-yellow-500/20 rounded-full blur-sm opacity-0 transition-opacity duration-300 ${
                                                                            hoveredRow === course.courseId
                                                                                ? 'opacity-100'
                                                                                : ''
                                                                        }`}
                                                                    ></div>
                                                                    <div className="relative bg-yellow-100 rounded-full p-2">
                                                                        <Star
                                                                            className={`h-4 w-4 transition-colors duration-300 ${
                                                                                hoveredRow === course.courseId
                                                                                    ? 'text-yellow-600 fill-yellow-600'
                                                                                    : 'text-yellow-500 fill-yellow-500'
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <span
                                                                        className={`text-lg font-bold transition-colors duration-300 ${
                                                                            hoveredRow === course.courseId
                                                                                ? 'text-yellow-600'
                                                                                : 'text-slate-800'
                                                                        }`}
                                                                    >
                                                                        {course.averageRating.toFixed(1)}
                                                                    </span>
                                                                    <div className="text-xs text-slate-500">из 5.0</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Link
                                                                href={`/admin/my-analytics/course/${course.courseId}`}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className={`relative overflow-hidden group/btn transition-all duration-300 ${
                                                                        hoveredRow === course.courseId
                                                                            ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 border-violet-300 shadow-md'
                                                                            : 'bg-white/80 backdrop-blur-sm border-white/50'
                                                                    }`}
                                                                >
                                                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                                                                    <div
                                                                        className={`relative flex items-center gap-2 transition-all duration-300 ${
                                                                            hoveredRow === course.courseId
                                                                                ? 'scale-105'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        <div
                                                                            className={`relative transition-all duration-300 ${
                                                                                hoveredRow === course.courseId
                                                                                    ? 'scale-110'
                                                                                    : ''
                                                                            }`}
                                                                        >
                                                                            <div
                                                                                className={`absolute inset-0 bg-violet-500/20 rounded-full blur-sm opacity-0 transition-opacity duration-300 ${
                                                                                    hoveredRow === course.courseId
                                                                                        ? 'opacity-100'
                                                                                        : ''
                                                                                }`}
                                                                            ></div>
                                                                            <BarChart3
                                                                                className={`h-4 w-4 relative z-10 transition-colors duration-300 ${
                                                                                    hoveredRow === course.courseId
                                                                                        ? 'text-violet-600'
                                                                                        : 'text-slate-600'
                                                                                }`}
                                                                            />
                                                                        </div>
                                                                        <span className="hidden sm:inline relative z-10 font-medium">
                                                                            Подробнее
                                                                        </span>
                                                                        <Zap
                                                                            className={`h-3 w-3 relative z-10 transition-all duration-300 ${
                                                                                hoveredRow === course.courseId
                                                                                    ? 'text-violet-600 opacity-100'
                                                                                    : 'text-slate-400 opacity-0'
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <TableRow className="bg-white/40 backdrop-blur-sm">
                                                    <TableCell colSpan={6} className="h-32 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-4">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full blur-lg opacity-75"></div>
                                                                <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-4">
                                                                    <BarChart3 className="h-12 w-12 text-violet-600" />
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-lg font-medium text-slate-700">
                                                                    Нет курсов для аналитики
                                                                </p>
                                                                <p className="text-sm text-slate-500 mt-1">
                                                                    Создайте свой первый курс, чтобы увидеть аналитику
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>

                        {data && data.totalPages > 1 && (
                            <div className="relative z-10 p-6 bg-gradient-to-t from-slate-50/50 to-transparent border-t border-white/30">
                                <MyPagination
                                    currentPage={currentPage}
                                    totalPages={data.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}

                        <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                            <BarChart3 className="h-20 w-20 text-violet-500 transform rotate-12" />
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
