'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { MoreHorizontal, Pencil, PlusCircle, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MyPagination from '@/components/reusable/my-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';
import { formatNumber } from '@/lib/utils';
import { adminApiClient } from '@/server/admin-api-client';
import { useUserStore } from '@/stores/user/user-store-provider';
import { PagedResponse } from '@/types';
import { AdminCourseListItemDTO } from '@/types/admin';

export default function AdminCoursesPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { hasPermission } = usePermissions();

    const [data, setData] = useState<PagedResponse<AdminCourseListItemDTO> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('size') || '10', 10);

    const { user } = useUserStore((state) => state);
    const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN');
    const isMentor = user?.roles?.includes('MENTOR') || user?.roles?.includes('ROLE_MENTOR');

    const fetchData = useCallback(
        async (page = currentPage, size = pageSize) => {
            setIsLoading(true);
            try {
                const params: { page: number; size: number; authorId?: string; sortBy?: string; titleSearch?: string } =
                    {
                        page,
                        size,
                        sortBy: searchParams.get('sortBy') ?? undefined,
                        titleSearch: searchParams.get('titleSearch') ?? undefined,
                    };

                if (!isAdmin && isMentor && user?.id) {
                    params.authorId = user.id;
                } else if (!isAdmin && !isMentor) {
                    setData(null);
                    setIsLoading(false);

                    toast.error('У вас нет прав для просмотра этой страницы.');

                    return;
                }

                const result = await adminApiClient.getCoursesAdmin(
                    params.page,
                    params.size,
                    params.sortBy,
                    params.titleSearch,
                    params.authorId
                );

                setData(result);
            } catch (error: unknown) {
                console.error('Failed to fetch courses:', error);

                let errorMsg = 'Unknown error';

                if (isAxiosError(error)) {
                    errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                toast.error(`Failed to fetch courses: ${errorMsg}`);
                setData(null);
            } finally {
                setIsLoading(false);
            }
        },
        [currentPage, pageSize, isAdmin, isMentor, user?.id, searchParams]
    );

    useEffect(() => {
        fetchData(currentPage, pageSize);
    }, [fetchData, currentPage, pageSize]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
        if (confirm(`Are you sure you want to delete course "${courseTitle}"? This action cannot be undone.`)) {
            try {
                await adminApiClient.deleteCourseAdmin(courseId);
                toast.success(`Course "${courseTitle}" deleted.`);
                fetchData();
            } catch (error: unknown) {
                console.error(`Failed to delete course ${courseId}:`, error);

                let errorMsg = 'Unknown error';

                if (isAxiosError(error)) {
                    errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                toast.error(`Failed to delete course: ${errorMsg}`);
            }
        }
    };

    const renderSkeletons = (count: number) => {
        return Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
                <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-10 w-16" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-40 rounded-md" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-24 rounded-md" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-20 rounded-md" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-16 rounded-md" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-16 rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-full inline-block" />
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-primary to-cyan-500/30 rounded-full blur-3xl opacity-70 animate-pulse -z-10"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-600/30 to-pink-500/30 rounded-full blur-3xl opacity-70 animate-pulse -z-10"></div>

            <div className="container mx-auto relative z-10">
                <Card className="border-0 bg-white/70 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden py-0">
                    <CardHeader className="bg-gradient-to-r from-primary to-secondary p-8 flex flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-3xl text-white">Курсы</CardTitle>
                            <CardDescription className="text-white/80 text-lg">
                                Управляйте своими курсами. Добавляйте, редактируйте или удаляйте курсы.
                            </CardDescription>
                        </div>
                        {hasPermission('course:create') && (
                            <Link href="/admin/courses/new">
                                <Button
                                    size="lg"
                                    className="bg-white/20 hover:bg-white/30 text-white border-0 h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <PlusCircle className="h-5 w-5 mr-2" />
                                    Добавить курс
                                </Button>
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead className="hidden md:table-cell">Изображение</TableHead>
                                            <TableHead>Название</TableHead>
                                            <TableHead>Автор</TableHead>
                                            <TableHead>Цена</TableHead>
                                            <TableHead className="hidden md:table-cell">Уроки</TableHead>
                                            <TableHead className="hidden md:table-cell">Сложность</TableHead>
                                            <TableHead className="text-right">Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            renderSkeletons(pageSize)
                                        ) : data && data.content.length > 0 ? (
                                            data.content.map((course: AdminCourseListItemDTO) => {
                                                const canEditThisCourse =
                                                    hasPermission('course:edit:any') ||
                                                    (hasPermission('course:edit:own') && course.authorId === user?.id);
                                                const canDeleteThisCourse =
                                                    hasPermission('course:delete:any') ||
                                                    (hasPermission('course:delete:own') &&
                                                        course.authorId === user?.id);

                                                return (
                                                    <TableRow
                                                        key={course.id}
                                                        className="hover:bg-muted/50 transition-colors"
                                                    >
                                                        <TableCell className="hidden sm:table-cell">
                                                            <div className="h-12 w-20 bg-slate-100 overflow-hidden shadow-sm border border-slate-200/50 transition-transform hover:scale-105 duration-300">
                                                                <Image
                                                                    src={
                                                                        course.imagePreview ??
                                                                        '/image_not_available.webp'
                                                                    }
                                                                    alt={course.title}
                                                                    width={80}
                                                                    height={80}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            <Link
                                                                href={`/admin/courses/${course.id}/edit`}
                                                                className="hover:underline"
                                                            >
                                                                {course.title}
                                                            </Link>
                                                            <div className="text-xs text-muted-foreground">
                                                                {course.slug}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-700">
                                                            {course.authorUsername}
                                                        </TableCell>
                                                        <TableCell>
                                                            {course.discount > 0 ? (
                                                                <div className="space-y-1">
                                                                    <span className="text-destructive line-through text-xs">
                                                                        ${formatNumber(course.price)}
                                                                    </span>
                                                                    <div className="font-medium text-emerald-600">
                                                                        ${formatNumber(course.price - course.discount)}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="font-medium">
                                                                    ${formatNumber(course.price)}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="bg-slate-100 text-slate-700 rounded-full w-8 h-8 flex items-center justify-center font-medium">
                                                                {course.lessonCount}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={`
                                                                px-3 py-1 font-medium border-0 
                                                                ${
                                                                    course.difficulty === 'BEGINNER'
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : course.difficulty === 'INTERMEDIATE'
                                                                          ? 'bg-amber-100 text-amber-700'
                                                                          : course.difficulty === 'ADVANCED'
                                                                            ? 'bg-rose-100 text-rose-700'
                                                                            : 'bg-slate-100 text-slate-700'
                                                                }
                                                            `}
                                                            >
                                                                {course.difficulty?.toString() ?? 'N/A'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="flex justify-end">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        aria-haspopup="true"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="rounded-full h-9 w-9 hover:bg-slate-100"
                                                                    >
                                                                        <MoreHorizontal className="h-5 w-5 text-slate-600" />
                                                                        <span className="sr-only">Toggle menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="w-56 px-4 py-2"
                                                                >
                                                                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                                    {canEditThisCourse && (
                                                                        <DropdownMenuItem
                                                                            className="cursor-pointer"
                                                                            onClick={() =>
                                                                                router.push(
                                                                                    `/admin/courses/${course.id}/edit`
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil className="mr-2 h-4 w-4" />{' '}
                                                                            Редактировать
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {canDeleteThisCourse && (
                                                                        <DropdownMenuItem
                                                                            className="text-destructive cursor-pointer"
                                                                            onClick={() =>
                                                                                handleDeleteCourse(
                                                                                    course.id,
                                                                                    course.title
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" /> Удалить
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {!canEditThisCourse && !canDeleteThisCourse && (
                                                                        <DropdownMenuItem disabled>
                                                                            Нет доступных действий
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-32 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                                        <div className="rounded-full bg-slate-100 p-3 mb-3">
                                                            <Search className="h-6 w-6 text-slate-400" />
                                                        </div>
                                                        <p className="text-lg font-medium">Курсы не найдены</p>
                                                        <p className="text-sm text-slate-400 mt-1">
                                                            Попробуйте изменить параметры поиска или создайте новый курс
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-t from-slate-50/50 to-transparent border-t border-slate-100">
                        {data && data.totalElements > 0 && (
                            <div className="text-sm text-slate-500">
                                Показано <strong>{data.content.length}</strong> из <strong>{data.totalElements}</strong>{' '}
                                курсов
                            </div>
                        )}

                        {data && data.totalPages > 1 && (
                            <MyPagination
                                className="mt-0"
                                currentPage={currentPage}
                                totalPages={data.totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
