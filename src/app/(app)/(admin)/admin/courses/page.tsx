'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import Image from 'next/image';
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
import { AdminCourseListItemDTO, PagedResponse } from '@/types/admin';

import AdminCourseEditDialog from './_components/course-edit-dialog';

export default function AdminCoursesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [data, setData] = useState<PagedResponse<AdminCourseListItemDTO> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState<AdminCourseListItemDTO | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('size') || '10', 10);

    const fetchData = useCallback(
        async (page = currentPage, size = pageSize) => {
            setIsLoading(true);
            try {
                const result = await adminApiClient.getCoursesAdmin(page, size);
                setData(result);
            } catch (error: any) {
                console.error('Failed to fetch courses:', error);
                toast.error(`Failed to fetch courses: ${error.message || 'Unknown error'}`);
                setData(null);
            } finally {
                setIsLoading(false);
            }
        },
        [currentPage, pageSize]
    );

    useEffect(() => {
        fetchData(currentPage, pageSize);
    }, [fetchData, currentPage, pageSize]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDialogSuccess = () => {
        setEditingCourse(null);
        setIsCreateDialogOpen(false);
        fetchData();
    };

    const handleCourseUpdate = (updatedCourse: AdminCourseListItemDTO) => {
        setData((prevData) =>
            prevData
                ? {
                      ...prevData,
                      content: prevData.content.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)),
                  }
                : null
        );
        setEditingCourse(null);
        setIsCreateDialogOpen(false);
    };

    const handleCourseCreate = (newCourse: AdminCourseListItemDTO) => {
        if (currentPage === 1) {
            setData((prevData) =>
                prevData
                    ? {
                          ...prevData,
                          content: [newCourse, ...prevData.content],
                          totalElements: prevData.totalElements + 1,
                      }
                    : {
                          content: [newCourse],
                          pageNumber: 0,
                          pageSize: pageSize,
                          totalElements: 1,
                          totalPages: 1,
                          isLast: true,
                      }
            );
        } else {
            fetchData();
        }
        setIsCreateDialogOpen(false);
    };

    const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
        if (confirm(`Are you sure you want to delete course "${courseTitle}"? This action cannot be undone.`)) {
            try {
                await adminApiClient.deleteCourseAdmin(courseId);
                toast.success(`Course "${courseTitle}" deleted.`);
                fetchData();
            } catch (error: any) {
                console.error(`Failed to delete course ${courseId}:`, error);
                toast.error(`Failed to delete course: ${error.message || 'Unknown error'}`);
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
                <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Course
                </Button>
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
                                        <span
                                            className="hover:underline cursor-pointer"
                                            onClick={() => setEditingCourse(course)}
                                        >
                                            {course.title}
                                        </span>
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
                                                <DropdownMenuItem
                                                    onClick={() => setEditingCourse(course)}
                                                    className="cursor-pointer"
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive cursor-pointer"
                                                    onClick={() => handleDeleteCourse(course.id, course.title)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
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

            {isCreateDialogOpen && (
                <AdminCourseEditDialog
                    onOpenChange={(open) => !open && setIsCreateDialogOpen(false)}
                    onSuccess={handleDialogSuccess}
                />
            )}

            {editingCourse && (
                <AdminCourseEditDialog
                    course={editingCourse}
                    onOpenChange={(open) => !open && setEditingCourse(null)}
                    onSuccess={handleDialogSuccess}
                />
            )}
        </Card>
    );
}
