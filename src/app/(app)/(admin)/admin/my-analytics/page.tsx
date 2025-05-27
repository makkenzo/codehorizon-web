'use client';

import { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { ArrowUpDown, BarChart3, Percent, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MyPagination from '@/components/reusable/my-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
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
            return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/50" />;
        }
        return (
            <span
                className={`ml-2 text-xs ${
                    currentDirection === 'asc' ? 'text-primary' : 'text-secondary'
                } font-bold transition-colors duration-200`}
            >
                {currentDirection === 'asc' ? '▲' : '▼'}
            </span>
        );
    };

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skel-course-${index}`} className="backdrop-blur-sm bg-background/40">
                <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-10 w-16 rounded" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-3/4" />
                </TableCell>
                <TableCell className="text-center">
                    <Skeleton className="h-5 w-12 inline-block" />
                </TableCell>
                <TableCell className="text-center">
                    <Skeleton className="h-5 w-16 inline-block" />
                </TableCell>
                <TableCell className="text-center">
                    <Skeleton className="h-5 w-20 inline-block" />
                </TableCell>
                <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 inline-block" />
                </TableCell>
            </TableRow>
        ));

    return (
        <Card className="border-border/40 backdrop-blur-sm bg-background/60 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-secondary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
                <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-2xl">
                    Аналитика моих курсов
                </CardTitle>
                <CardDescription>Обзор успеваемости и популярности ваших курсов.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="rounded-md border border-border/40 backdrop-blur-sm bg-background/40 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/40">
                                <TableHead className="hidden sm:table-cell w-[100px]">Превью</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                                    onClick={() => handleSort('courseTitle')}
                                >
                                    <div className="flex items-center">
                                        Название курса {renderSortIcon('courseTitle')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-center cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                                    onClick={() => handleSort('totalEnrolledStudents')}
                                >
                                    <div className="flex items-center justify-center">
                                        Студенты {renderSortIcon('totalEnrolledStudents')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-center cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                                    onClick={() => handleSort('averageCompletionRate')}
                                >
                                    <div className="flex items-center justify-center">
                                        Завершение {renderSortIcon('averageCompletionRate')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="text-center cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                                    onClick={() => handleSort('averageRating')}
                                >
                                    <div className="flex items-center justify-center">
                                        Рейтинг {renderSortIcon('averageRating')}
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Детали</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                renderSkeletons(pageSize)
                            ) : data && data.content.length > 0 ? (
                                data.content.map((course) => (
                                    <TableRow
                                        key={course.courseId}
                                        className={`backdrop-blur-sm transition-all duration-300 ${
                                            hoveredRow === course.courseId
                                                ? 'bg-gradient-to-r from-primary/5 to-secondary/5'
                                                : 'bg-background/40 hover:bg-background/60'
                                        }`}
                                        onMouseEnter={() => setHoveredRow(course.courseId)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="relative overflow-hidden group/image">
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-10"></div>
                                                <Image
                                                    src={course.imagePreview || '/image_not_available.webp'}
                                                    alt={course.courseTitle}
                                                    width={160}
                                                    height={90}
                                                    className="object-cover aspect-video transition-transform duration-300 group-hover/image:scale-110"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className={cn('font-medium')}>
                                            <span
                                                className={`transition-all duration-300 ${
                                                    hoveredRow === course.courseId
                                                        ? 'bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent'
                                                        : ''
                                                }`}
                                            >
                                                {course.courseTitle}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <div
                                                    className={`relative transition-all duration-300 ${
                                                        hoveredRow === course.courseId ? 'scale-110' : ''
                                                    }`}
                                                >
                                                    <div
                                                        className={`absolute inset-0 bg-primary/20 rounded-full blur-sm opacity-0 transition-opacity duration-300 ${
                                                            hoveredRow === course.courseId ? 'opacity-100' : ''
                                                        }`}
                                                    ></div>
                                                    <Users
                                                        className={`h-3.5 w-3.5 transition-colors duration-300 relative z-10 ${
                                                            hoveredRow === course.courseId
                                                                ? 'text-primary'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    />
                                                </div>
                                                <span
                                                    className={`transition-colors duration-300 ${
                                                        hoveredRow === course.courseId ? 'text-primary font-medium' : ''
                                                    }`}
                                                >
                                                    {course.totalEnrolledStudents}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <div
                                                    className={`relative transition-all duration-300 ${
                                                        hoveredRow === course.courseId ? 'scale-110' : ''
                                                    }`}
                                                >
                                                    <div
                                                        className={`absolute inset-0 bg-secondary/20 rounded-full blur-sm opacity-0 transition-opacity duration-300 ${
                                                            hoveredRow === course.courseId ? 'opacity-100' : ''
                                                        }`}
                                                    ></div>
                                                    <Percent
                                                        className={`h-3.5 w-3.5 transition-colors duration-300 relative z-10 ${
                                                            hoveredRow === course.courseId
                                                                ? 'text-success'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    />
                                                </div>
                                                <span
                                                    className={`transition-colors duration-300 ${
                                                        hoveredRow === course.courseId ? 'text-success font-medium' : ''
                                                    }`}
                                                >
                                                    {course.averageCompletionRate.toFixed(1)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <div
                                                    className={`relative transition-all duration-300 ${
                                                        hoveredRow === course.courseId ? 'scale-110' : ''
                                                    }`}
                                                >
                                                    <div
                                                        className={`absolute inset-0 bg-yellow-500/20 rounded-full blur-sm opacity-0 transition-opacity duration-300 ${
                                                            hoveredRow === course.courseId ? 'opacity-100' : ''
                                                        }`}
                                                    ></div>
                                                    <Star
                                                        className={`h-3.5 w-3.5 transition-colors duration-300 relative z-10 ${
                                                            hoveredRow === course.courseId
                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                : 'text-muted-foreground fill-muted-foreground'
                                                        }`}
                                                    />
                                                </div>
                                                <span
                                                    className={`transition-colors duration-300 ${
                                                        hoveredRow === course.courseId
                                                            ? 'text-yellow-500 font-medium'
                                                            : ''
                                                    }`}
                                                >
                                                    {course.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/my-analytics/course/${course.courseId}`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={`relative overflow-hidden group/btn border-border/40 transition-all duration-300 ${
                                                        hoveredRow === course.courseId
                                                            ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/40'
                                                            : ''
                                                    }`}
                                                >
                                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                                                    <div
                                                        className={`relative transition-all duration-300 ${
                                                            hoveredRow === course.courseId ? 'scale-110' : ''
                                                        }`}
                                                    >
                                                        <div
                                                            className={`absolute inset-0 bg-primary/20 rounded-full blur-sm opacity-0 transition-opacity duration-300 ${
                                                                hoveredRow === course.courseId ? 'opacity-100' : ''
                                                            }`}
                                                        ></div>
                                                        <BarChart3
                                                            className={`h-4 w-4 mr-1 sm:mr-2 relative z-10 transition-colors duration-300 ${
                                                                hoveredRow === course.courseId ? 'text-primary' : ''
                                                            }`}
                                                        />
                                                    </div>
                                                    <span className="hidden sm:inline relative z-10">Подробнее</span>
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow className="backdrop-blur-sm bg-background/40">
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-muted-foreground/10 rounded-full blur-lg"></div>
                                                <BarChart3 className="h-10 w-10 text-muted-foreground/50 relative z-10" />
                                            </div>
                                            <p className="text-muted-foreground">
                                                У вас пока нет курсов для отображения аналитики.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            {data && data.totalPages > 1 && (
                <div className="p-4 border-t border-border/40 backdrop-blur-sm bg-background/40 relative z-10">
                    <MyPagination
                        currentPage={currentPage}
                        totalPages={data.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </Card>
    );
}
