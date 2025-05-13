'use client';

import { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
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
import { adminApiClient } from '@/server/admin-api-client';
import { PagedResponse } from '@/types';
import { AuthorCourseListItemAnalytics } from '@/types/admin';

export default function MyCoursesAnalyticsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [data, setData] = useState<PagedResponse<AuthorCourseListItemAnalytics> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
        return currentDirection === 'asc' ? '▲' : '▼';
    };

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skel-course-${index}`}>
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
        <Card>
            <CardHeader>
                <CardTitle>Аналитика моих курсов</CardTitle>
                <CardDescription>Обзор успеваемости и популярности ваших курсов.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden sm:table-cell w-[100px]">Превью</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('courseTitle')}
                            >
                                Название курса <p>{renderSortIcon('courseTitle')}</p>
                            </TableHead>
                            <TableHead
                                className="text-center cursor-pointer hover:bg-muted/50 "
                                onClick={() => handleSort('totalEnrolledStudents')}
                            >
                                Студенты {renderSortIcon('totalEnrolledStudents')}
                            </TableHead>
                            <TableHead
                                className="text-center cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('averageCompletionRate')}
                            >
                                Завершение {renderSortIcon('averageCompletionRate')}
                            </TableHead>
                            <TableHead
                                className="text-center cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort('averageRating')}
                            >
                                Рейтинг {renderSortIcon('averageRating')}
                            </TableHead>
                            <TableHead className="text-right">Детали</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            renderSkeletons(pageSize)
                        ) : data && data.content.length > 0 ? (
                            data.content.map((course) => (
                                <TableRow key={course.courseId}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            src={course.imagePreview || '/image_not_available.webp'}
                                            alt={course.courseTitle}
                                            width={64}
                                            height={36}
                                            className="rounded object-cover aspect-video"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{course.courseTitle}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            {course.totalEnrolledStudents}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                                            {course.averageCompletionRate.toFixed(1)}%
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="h-3.5 w-3.5 text-muted-foreground fill-muted-foreground" />
                                            {course.averageRating.toFixed(1)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/my-analytics/course/${course.courseId}`}>
                                            <Button variant="outline" size="sm">
                                                <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                                                <span className="hidden sm:inline">Подробнее</span>
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    У вас пока нет курсов для отображения аналитики.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            {data && data.totalPages > 1 && (
                <div className="p-4 border-t">
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
