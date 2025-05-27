'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ColumnDef, FilterFn, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowUpDown,
    Award,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MyPagination from '@/components/reusable/my-pagination';
import { Badge } from '@/components/ui/badge';
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
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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
                    <div className="flex items-center justify-end gap-3">
                        <span className="text-sm font-medium text-slate-600 w-10 text-right">
                            {row.original.progressPercent.toFixed(0)}%
                        </span>
                        <Progress
                            value={row.original.progressPercent}
                            className="h-2 w-24 bg-slate-200/50 overflow-hidden"
                            indicatorClassName={`transition-all duration-500 ${
                                row.original.progressPercent >= 80
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                    : row.original.progressPercent >= 50
                                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                                      : 'bg-gradient-to-r from-rose-500 to-red-500'
                            }`}
                        />
                    </div>
                ),
            },
            {
                accessorKey: 'completedLessonsCount',
                header: 'Уроков пройдено',
                cell: ({ row }) => (
                    <div className="text-center">
                        <span className="font-medium">{row.original.completedLessonsCount}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600">{row.original.totalLessonsCount}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'lastAccessedLessonAt',
                header: 'Последняя активность',
                cell: ({ row }) => {
                    const dateString = row.getValue<string>('lastAccessedLessonAt');
                    if (!dateString) {
                        return (
                            <Badge variant="outline" className="text-slate-400 border-slate-300">
                                Нет данных
                            </Badge>
                        );
                    }
                    try {
                        const date = new Date(dateString);
                        const now = new Date();
                        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

                        let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
                        let badgeText = '';

                        if (diffDays === 0) {
                            badgeVariant = 'default';
                            badgeText = 'Сегодня';
                        } else if (diffDays === 1) {
                            badgeVariant = 'secondary';
                            badgeText = 'Вчера';
                        } else if (diffDays <= 7) {
                            badgeVariant = 'secondary';
                            badgeText = `${diffDays} дн. назад`;
                        } else {
                            badgeVariant = 'outline';
                            badgeText = date.toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                            });
                        }

                        return (
                            <Badge variant={badgeVariant} className="font-medium">
                                {badgeText}
                            </Badge>
                        );
                    } catch {
                        return (
                            <Badge variant="destructive" className="text-xs">
                                Ошибка даты
                            </Badge>
                        );
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
            return <ArrowUpDown className="ml-2 h-3 w-3 text-slate-400" />;
        }
        return (
            <span
                className={`ml-2 text-xs ${
                    currentDirection === 'asc' ? 'text-violet-600' : 'text-fuchsia-600'
                } font-bold transition-colors duration-200`}
            >
                {currentDirection === 'asc' ? '▲' : '▼'}
            </span>
        );
    };

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skel-stud-${index}`} className="bg-white/40 backdrop-blur-sm">
                <TableCell>
                    <Skeleton className="h-5 w-24 rounded-md" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-40 rounded-md" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-16 rounded-md" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-24 rounded-md" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-28 rounded-md" />
                </TableCell>
            </TableRow>
        ));

    const stats = useMemo(() => {
        if (!rawData.length) return null;

        const totalStudents = rawData.length;
        const activeStudents = rawData.filter((s) => s.lastAccessedLessonAt).length;
        const completedStudents = rawData.filter((s) => s.progressPercent >= 100).length;
        const avgProgress = rawData.reduce((sum, s) => sum + s.progressPercent, 0) / totalStudents;

        return {
            totalStudents,
            activeStudents,
            completedStudents,
            avgProgress,
        };
    }, [rawData]);

    return (
        <div className="space-y-8">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-red-50/80 to-rose-50/80 backdrop-blur-sm border border-red-200/50 shadow-lg"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-red-800">Ошибка загрузки</h3>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {!isLoading && stats && (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200/50 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Всего студентов</p>
                                    <p className="text-2xl font-bold text-blue-800">{stats.totalStudents}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 backdrop-blur-sm border border-emerald-200/50 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-100 rounded-xl">
                                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-600 font-medium">Активные</p>
                                    <p className="text-2xl font-bold text-emerald-800">{stats.activeStudents}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm border border-amber-200/50 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-amber-100 rounded-xl">
                                    <Target className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-600 font-medium">Средний прогресс</p>
                                    <p className="text-2xl font-bold text-amber-800">{stats.avgProgress.toFixed(1)}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-violet-50/80 to-purple-50/80 backdrop-blur-sm border border-violet-200/50 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-violet-100 rounded-xl">
                                    <Award className="h-6 w-6 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-violet-600 font-medium">Завершили</p>
                                    <p className="text-2xl font-bold text-violet-800">{stats.completedStudents}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {!isLoading && rawData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
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
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden py-0">
                    <CardHeader className="bg-gradient-to-r from-slate-50/50 to-slate-100/50 py-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-lg blur opacity-75"></div>
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                    <Users className="h-5 w-5 text-slate-600" />
                                </div>
                            </div>
                            <div>
                                <CardTitle className="text-slate-800">Список студентов</CardTitle>
                                <CardDescription>Детальная информация о прогрессе каждого студента</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-slate-50/30 to-slate-100/30 hover:from-slate-50/50 hover:to-slate-100/50 border-b border-slate-200/50">
                                        <TableHead className="font-semibold text-slate-700 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Имя пользователя
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-700">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Email
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="text-right cursor-pointer hover:bg-slate-100/50 font-semibold text-slate-700 transition-colors"
                                            onClick={() => handleSort('progress')}
                                        >
                                            <div className="flex items-center justify-end gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Прогресс
                                                {renderSortIcon('progress')}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center font-semibold text-slate-700">
                                            <div className="flex items-center justify-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Уроков пройдено
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="hidden md:table-cell text-center cursor-pointer hover:bg-slate-100/50 font-semibold text-slate-700 transition-colors"
                                            onClick={() => handleSort('lastUpdated')}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Последняя активность
                                                {renderSortIcon('lastUpdated')}
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        renderSkeletons(pageSize)
                                    ) : pagedData && pagedData.content.length > 0 ? (
                                        pagedData.content.map((student, index) => (
                                            <motion.tr
                                                key={student.userId}
                                                className={`group transition-all duration-300 border-b border-slate-100/50 ${
                                                    hoveredRow === student.userId
                                                        ? 'bg-gradient-to-r from-violet-50/30 to-fuchsia-50/30 shadow-sm'
                                                        : 'bg-white/40 hover:bg-white/60'
                                                }`}
                                                onMouseEnter={() => setHoveredRow(student.userId)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-300 ${
                                                                hoveredRow === student.userId
                                                                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg'
                                                                    : 'bg-gradient-to-r from-slate-400 to-slate-500'
                                                            }`}
                                                        >
                                                            {student.username.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-800">
                                                                {student.username}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                ID: {student.userId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-slate-600">{student.email}</p>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <span className="text-sm font-medium text-slate-600 w-10 text-right">
                                                            {student.progressPercent.toFixed(0)}%
                                                        </span>
                                                        <Progress
                                                            value={student.progressPercent}
                                                            className="h-2 w-24 bg-slate-200/50 overflow-hidden"
                                                            indicatorClassName={`transition-all duration-500 ${
                                                                student.progressPercent >= 80
                                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                                                    : student.progressPercent >= 50
                                                                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                                                                      : 'bg-gradient-to-r from-rose-500 to-red-500'
                                                            }`}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                                                        <span className="font-medium">
                                                            {student.completedLessonsCount}
                                                        </span>
                                                        <span className="text-slate-400">/</span>
                                                        <span>{student.totalLessonsCount}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-center">
                                                    {student.lastAccessedLessonAt ? (
                                                        (() => {
                                                            const date = new Date(student.lastAccessedLessonAt);
                                                            const now = new Date();
                                                            const diffDays = Math.floor(
                                                                (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
                                                            );

                                                            let badgeVariant:
                                                                | 'default'
                                                                | 'secondary'
                                                                | 'destructive'
                                                                | 'outline' = 'default';
                                                            let badgeText = '';

                                                            if (diffDays === 0) {
                                                                badgeVariant = 'default';
                                                                badgeText = 'Сегодня';
                                                            } else if (diffDays === 1) {
                                                                badgeVariant = 'secondary';
                                                                badgeText = 'Вчера';
                                                            } else if (diffDays <= 7) {
                                                                badgeVariant = 'secondary';
                                                                badgeText = `${diffDays} дн. назад`;
                                                            } else {
                                                                badgeVariant = 'outline';
                                                                badgeText = format(date, 'dd MMM yyyy', { locale: ru });
                                                            }

                                                            return (
                                                                <Badge variant={badgeVariant} className="font-medium">
                                                                    {badgeText}
                                                                </Badge>
                                                            );
                                                        })()
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-slate-400 border-slate-300"
                                                        >
                                                            Нет данных
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-500">
                                                    <div className="rounded-full bg-slate-100 p-4 mb-4">
                                                        <Users className="h-8 w-8 text-slate-400" />
                                                    </div>
                                                    <p className="text-lg font-medium">Студентов пока нет</p>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        Когда студенты запишутся на курс, их прогресс появится здесь
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    {!isLoading && pagedData && pagedData.totalPages > 1 && (
                        <div className="p-6 bg-gradient-to-t from-slate-50/50 to-transparent border-t border-slate-100">
                            <MyPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};

export default StudentProgressTab;
