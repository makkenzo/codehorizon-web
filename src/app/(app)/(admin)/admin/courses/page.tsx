'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from 'lucide-react';
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
import { formatNumber } from '@/lib/utils';
import { adminApiClient } from '@/server/admin-api-client';
import { useUserStore } from '@/stores/user/user-store-provider';
import { PagedResponse } from '@/types';
import { AdminCourseListItemDTO } from '@/types/admin';

export default function AdminCoursesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
                const params: any = { page, size };
                if (!isAdmin && isMentor && user?.id) {
                    params.authorId = user.id;
                } else if (!isAdmin && !isMentor) {
                    setData(null);
                    setIsLoading(false);
                    return;
                }

                const result = await adminApiClient.getCoursesAdmin(
                    params.page,
                    params.size,
                    undefined,
                    undefined,
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
        [currentPage, pageSize, isAdmin, isMentor, user?.id]
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
                    <Skeleton className="h-10 w-16 rounded" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 inline-block" />
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <Card x-chunk="dashboard-06-chunk-0">
            <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2">
                <div>
                    <CardTitle>Courses</CardTitle>
                    <CardDescription>Manage your courses. Add, edit, or delete courses.</CardDescription>
                </div>

                {(isAdmin || isMentor) && (
                    <Link href="/admin/courses/new">
                        <Button size="sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Course
                        </Button>
                    </Link>
                )}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[80px] sm:table-cell">Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Lessons</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            renderSkeletons(pageSize)
                        ) : data && data.content.length > 0 ? (
                            data.content.map((course: AdminCourseListItemDTO) => (
                                <TableRow key={course.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="hidden sm:table-cell">
                                        <div className="h-10 w-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                            <Image
                                                src={course.imagePreview ?? '/image_not_available.webp'}
                                                alt={course.title}
                                                width={80}
                                                height={80}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/courses/${course.id}/edit`} className="hover:underline">
                                            {course.title}
                                        </Link>
                                        <div className="text-xs text-muted-foreground">{course.slug}</div>
                                    </TableCell>
                                    <TableCell>{course.authorUsername}</TableCell>
                                    <TableCell>
                                        {course.discount > 0 ? (
                                            <>
                                                <span className="text-destructive line-through mr-1">
                                                    ${formatNumber(course.price)}
                                                </span>
                                                <span>${formatNumber(course.price - course.discount)}</span>
                                            </>
                                        ) : (
                                            <span>${formatNumber(course.price)}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{course.lessonCount}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{course.difficulty?.toString() ?? 'N/A'}</Badge>
                                    </TableCell>
                                    <TableCell className="flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    aria-haspopup="true"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="px-3"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 px-4 py-2">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                {(isAdmin || course.authorId === user?.id) && (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                )}
                                                {(isAdmin || course.authorId === user?.id) && (
                                                    <DropdownMenuItem
                                                        className="text-destructive cursor-pointer"
                                                        onClick={() => handleDeleteCourse(course.id, course.title)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                {data && data.totalElements > 0 && (
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{data.content.length}</strong> of <strong>{data.totalElements}</strong> courses
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
    );
}
