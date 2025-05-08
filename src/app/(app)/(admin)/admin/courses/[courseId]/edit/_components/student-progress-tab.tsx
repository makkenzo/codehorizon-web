'use client';

import { useCallback, useEffect, useState } from 'react';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MyPagination from '@/components/reusable/my-pagination';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApiClient } from '@/server/admin-api-client';
import { PagedResponse } from '@/types';
import { StudentProgressDTO } from '@/types/admin';

interface StudentProgressTabProps {
    courseId: string;
}

const StudentProgressTab = ({ courseId }: StudentProgressTabProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [data, setData] = useState<PagedResponse<StudentProgressDTO> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentPage = parseInt(searchParams.get('spage') || '1', 10);
    const pageSize = 10;
    const currentSort = searchParams.get('ssort') || 'lastAccessedLessonAt,desc';

    const [totalPages, setTotalPages] = useState(0);

    const createUrl = (page: number, sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('spage', page.toString());
        params.set('ssort', sort);
        return `${pathname}?${params.toString()}`;
    };

    const fetchData = useCallback(
        async (page: number, sort: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await adminApiClient.getCourseStudentsProgress(courseId, page, pageSize, sort);
                if (result) {
                    setData(result);
                    setTotalPages(result.totalPages);
                } else {
                    setData(null);
                    setTotalPages(0);
                }
            } catch (err: any) {
                console.error('Failed to fetch student progress:', err);
                setError('Не удалось загрузить прогресс студентов.');
                setData(null);
                setTotalPages(0);
                toast.error(
                    `Ошибка загрузки прогресса: ${err?.response?.data?.message || err?.message || 'Неизвестная ошибка'}`
                );
            } finally {
                setIsLoading(false);
            }
        },
        [courseId, pageSize]
    );

    useEffect(() => {
        fetchData(currentPage, currentSort);
    }, [fetchData, currentPage, currentSort]);

    const handlePageChange = (newPage: number) => {
        router.push(createUrl(newPage, currentSort), { scroll: false });
    };

    const handleSort = (columnBackendName: string) => {
        const [currentColumn, currentDirection] = currentSort.split(',');
        let newDirection = 'asc';
        if (columnBackendName === currentColumn) {
            newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        }
        const newSort = `${columnBackendName},${newDirection}`;
        router.push(createUrl(1, newSort), { scroll: false });
    };

    const renderSortIcon = (columnBackendName: string) => {
        const [currentColumn, currentDirection] = currentSort.split(',');
        if (columnBackendName !== currentColumn) {
            return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/50" />;
        }
        return currentDirection === 'asc' ? '▲' : '▼';
    };

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skel-stud-${index}`}>
                <TableCell>
                    <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-28" />
                </TableCell>
            </TableRow>
        ));

    return (
        <div className="space-y-4">
            {error && <p className="text-destructive text-center">{error}</p>}
            <div className="overflow-x-auto border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer hover:bg-muted/50 flex items-center justify-between">
                                Имя пользователя
                            </TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead
                                className="text-right cursor-pointer hover:bg-muted/50 flex items-center justify-between"
                                onClick={() => handleSort('progress')}
                            >
                                Прогресс <p>{renderSortIcon('progress')}</p>
                            </TableHead>
                            <TableHead className="text-right">Уроков пройдено</TableHead>
                            <TableHead
                                className="hidden md:flex text-right cursor-pointer hover:bg-muted/50  items-center justify-between"
                                onClick={() => handleSort('lastUpdated')}
                            >
                                Последняя активность <p>{renderSortIcon('lastUpdated')}</p>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            renderSkeletons(pageSize)
                        ) : data && data.content.length > 0 ? (
                            data.content.map((student) => (
                                <TableRow key={student.userId}>
                                    <TableCell className="font-medium">{student.username}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xs text-muted-foreground w-8">
                                                {student.progressPercent.toFixed(0)}%
                                            </span>
                                            <Progress value={student.progressPercent} className="h-1.5 w-20" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {student.completedLessonsCount} из {student.totalLessonsCount}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-right">
                                        {student.lastAccessedLessonAt
                                            ? format(new Date(student.lastAccessedLessonAt), 'dd MMM yyyy, HH:mm', {
                                                  locale: ru,
                                              })
                                            : 'Нет данных'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Студентов нет или прогресс отсутствует.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {!isLoading && data && data.totalPages > 1 && (
                <MyPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
        </div>
    );
};

export default StudentProgressTab;
