'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ColumnDef, FilterFn, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MyPagination from '@/components/reusable/my-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkedChart } from '@/components/ui/linked-chart';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApiClient } from '@/server/admin-api-client';
import { PagedResponse } from '@/types';
import { StudentProgressDTO } from '@/types/admin';

export type DateRangeFilterValue = {
    start?: string | Date | number | null;
    end?: string | Date | number | null;
};

const parseToValidDate = (value: string | Date | number | null | undefined, contextForLog: string): Date | null => {
    console.log(`[parseToValidDate] Attempting to parse for ${contextForLog}:`, value, `(type: ${typeof value})`);

    if (value === null || value === undefined || value === '') {
        console.log(
            `[parseToValidDate] Value for ${contextForLog} is null, undefined, or empty string. Returning null.`
        );
        return null;
    }

    let dateObj: Date;

    if (value instanceof Date) {
        dateObj = value;
    } else if (typeof value === 'number') {
        const timestampMs = value > 30000000000 ? value : value * 1000;
        dateObj = new Date(timestampMs);
    } else if (typeof value === 'string') {
        dateObj = new Date(value);
    } else {
        console.error(`[parseToValidDate] Unexpected type for ${contextForLog}: ${typeof value}. Value:`, value);
        return null;
    }

    if (isNaN(dateObj.getTime())) {
        console.error(
            `[parseToValidDate] Failed to parse to valid date for ${contextForLog}. Original value:`,
            value,
            `Resulting Date object:`,
            dateObj
        );
        return null;
    }

    console.log(`[parseToValidDate] Successfully parsed date for ${contextForLog}:`, dateObj.toISOString());
    return dateObj;
};

export const dateRangeFilterFn: FilterFn<StudentProgressDTO> = (
    row,
    columnId,
    filterValue: DateRangeFilterValue | any
) => {
    const rawCellValue = row.getValue<string | null | undefined>(columnId);
    console.log(`[dateRangeFilterFn] Filtering column '${columnId}', Row ID: ${row.id}`);
    console.log(`[dateRangeFilterFn] Raw cell value:`, rawCellValue, `(Type: ${typeof rawCellValue})`);
    console.log(`[dateRangeFilterFn] FilterValue received:`, filterValue);

    const cellDate = parseToValidDate(rawCellValue, `cellValue for column '${columnId}'`);

    if (!cellDate) {
        console.log(`[dateRangeFilterFn] Invalid or null cellDate for column '${columnId}'. Excluding row.`);
        return false;
    }

    const filterStartInput = filterValue?.start;
    const filterEndInput = filterValue?.end;

    const filterStartDate = parseToValidDate(filterStartInput, `filterStart for column '${columnId}'`);
    const filterEndDate = parseToValidDate(filterEndInput, `filterEnd for column '${columnId}'`);

    console.log(
        `[dateRangeFilterFn] Parsed dates - Cell: ${cellDate?.toISOString()}, FilterStart: ${filterStartDate?.toISOString()}, FilterEnd: ${filterEndDate?.toISOString()}`
    );

    if (typeof filterValue !== 'object' || filterValue === null || (!filterStartDate && !filterEndDate)) {
        console.log(`[dateRangeFilterFn] No valid filter range for column '${columnId}'. Including row.`);
        return true;
    }

    const cellTime = cellDate.getTime();

    if (filterStartDate && filterEndDate) {
        const startTime = filterStartDate.getTime();
        let endTime = filterEndDate.getTime();

        if (endTime < startTime) {
            console.warn(
                `[dateRangeFilterFn] Filter end date (${filterEndDate.toISOString()}) is before start date (${filterStartDate.toISOString()}) for column '${columnId}'. Excluding row.`
            );
            return false;
        }
        const isInRange = cellTime >= startTime && cellTime <= endTime;
        console.log(
            `[dateRangeFilterFn] Comparing cellTime ${cellTime} against [${startTime}, ${endTime}]. In range: ${isInRange}`
        );
        return isInRange;
    }
    if (filterStartDate) {
        const isInRange = cellTime >= filterStartDate.getTime();
        console.log(
            `[dateRangeFilterFn] Comparing cellTime ${cellTime} against start ${filterStartDate.getTime()}. In range: ${isInRange}`
        );
        return isInRange;
    }
    if (filterEndDate) {
        const isInRange = cellTime <= filterEndDate.getTime();
        console.log(
            `[dateRangeFilterFn] Comparing cellTime ${cellTime} against end ${filterEndDate.getTime()}. In range: ${isInRange}`
        );
        return isInRange;
    }

    console.log(`[dateRangeFilterFn] Filter conditions not met for column '${columnId}'. Including row by default.`);
    return true;
};

interface StudentProgressTabProps {
    courseId: string;
}

const studentChartAggregatorConfig = {
    activeStudents: (student: StudentProgressDTO) => (student.lastAccessedLessonAt ? 1 : 0),
};

const StudentProgressTab = ({ courseId }: StudentProgressTabProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [rawData, setRawData] = useState<StudentProgressDTO[]>([]);
    const [pagedData, setPagedData] = useState<PagedResponse<StudentProgressDTO> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentPage = parseInt(searchParams.get('spage') || '1', 10);
    const pageSize = 10;
    const currentSort = searchParams.get('ssort') || 'lastAccessedLessonAt,desc';
    const [totalPages, setTotalPages] = useState(0);

    const columns = useMemo<ColumnDef<StudentProgressDTO>[]>(
        () => [
            { accessorKey: 'username', header: 'Имя пользователя' },
            { accessorKey: 'email', header: 'Email' },
            {
                accessorKey: 'progressPercent',
                header: 'Прогресс',
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground w-8">
                            {row.original.progressPercent.toFixed(0)}%
                        </span>
                        <Progress value={row.original.progressPercent} className="h-1.5 w-20" />
                    </div>
                ),
            },
            {
                accessorKey: 'completedLessonsCount',
                header: 'Уроков пройдено',
                cell: ({ row }) => `${row.original.completedLessonsCount} из ${row.original.totalLessonsCount}`,
            },
            {
                accessorKey: 'lastAccessedLessonAt',
                header: 'Последняя активность',
                cell: ({ row }) => {
                    const dateString = row.getValue<string>('lastAccessedLessonAt');
                    if (!dateString) return 'N/A';
                    try {
                        return new Date(dateString).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                    } catch {
                        return 'Invalid Date';
                    }
                },
                filterFn: dateRangeFilterFn,
            },
        ],
        []
    );

    const table = useReactTable({
        data: pagedData?.content || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
    });

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
                setPagedData(result);
                setTotalPages(result.totalPages);
                if (page === 1) {
                    const allStudentsResult = await adminApiClient.getCourseStudentsProgress(courseId, 1, 10000, sort);
                    setRawData(allStudentsResult.content);
                }
            } catch (err: any) {
                console.error('Failed to fetch student progress:', err);
                setError('Не удалось загрузить прогресс студентов.');
                setPagedData(null);
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

            {!isLoading && rawData.length > 0 && (
                <LinkedChart
                    data={rawData}
                    // @ts-ignore
                    columns={columns.filter(
                        // @ts-ignore
                        (col) => col.accessorKey !== 'email' && col.accessorKey !== 'username'
                    )}
                    dateFormat="dd/MM/yyyy"
                    setColumnFilters={table.setColumnFilters}
                    dateField="lastAccessedLessonAt"
                    aggregatorConfig={studentChartAggregatorConfig}
                    chartType="area"
                    title="Активность студентов по дате"
                />
            )}

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
                        ) : pagedData && pagedData.content.length > 0 ? (
                            pagedData.content.map((student) => (
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
            {!isLoading && pagedData && pagedData.totalPages > 1 && (
                <MyPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
        </div>
    );
};

export default StudentProgressTab;
