'use client';

import { useCallback, useEffect, useState } from 'react';

import { CheckCircle, ExternalLink, MoreHorizontal, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';

import MyPagination from '@/components/reusable/my-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { mentorshipApiClient } from '@/server/mentorship';
import { PagedResponse } from '@/types';
import { ApplicationStatus, MentorshipApplication } from '@/types/mentorship';

interface AdminMentorshipApplicationsPageProps {}

const AdminMentorshipApplicationsPage = ({}: AdminMentorshipApplicationsPageProps) => {
    const [applicationsData, setApplicationsData] = useState<PagedResponse<MentorshipApplication> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [filterStatus, setFilterStatus] = useState<ApplicationStatus | undefined>(undefined);
    const [sortBy, setSortBy] = useState<string>('appliedAt,desc');

    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectingApplication, setRejectingApplication] = useState<MentorshipApplication | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessingAction, setIsProcessingAction] = useState(false);

    const fetchApplications = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await mentorshipApiClient.getAllApplications(filterStatus, currentPage, pageSize, sortBy);
            setApplicationsData(result);
        } catch (error: any) {
            toast.error(
                `Не удалось загрузить заявки: ${error?.response?.data?.message || error.message || 'Неизвестная ошибка'}`
            );
            setApplicationsData(null);
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, currentPage, pageSize, sortBy]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleAction = async (action: 'approve' | 'reject', applicationId: string, reason?: string) => {
        setIsProcessingAction(true);
        try {
            let result;
            if (action === 'approve') {
                result = await mentorshipApiClient.approveApplication(applicationId);
                toast.success(`Заявка ${applicationId} одобрена.`);
            } else {
                result = await mentorshipApiClient.rejectApplication(applicationId, reason);
                toast.success(`Заявка ${applicationId} отклонена.`);
                setIsRejectDialogOpen(false);
            }
            if (result) {
                fetchApplications();
            }
        } catch (error: any) {
            toast.error(
                `Ошибка ${action === 'approve' ? 'одобрения' : 'отклонения'} заявки: ${error?.response?.data?.message || error.message || 'Неизвестная ошибка'}`
            );
        } finally {
            setIsProcessingAction(false);
        }
    };

    const openRejectDialog = (app: MentorshipApplication) => {
        setRejectingApplication(app);
        setRejectionReason('');
        setIsRejectDialogOpen(true);
    };

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
                <TableCell>
                    <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-28" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-8 w-20" />
                </TableCell>
                <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 inline-block" />
                </TableCell>
            </TableRow>
        ));

    const statusColors: Record<ApplicationStatus, string> = {
        [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-300',
        [ApplicationStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-300',
        [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-300',
    };

    return (
        <Card x-chunk="dashboard-06-chunk-0">
            <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2">
                <div>
                    <CardTitle>Заявки на менторство</CardTitle>
                    <CardDescription>
                        Просмотр и управление заявками пользователей на получение роли ментора.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Select
                        value={filterStatus || 'ALL'}
                        onValueChange={(value) => {
                            setFilterStatus(value === 'ALL' ? undefined : (value as ApplicationStatus));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Фильтр по статусу" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Все статусы</SelectItem>
                            <SelectItem value={ApplicationStatus.PENDING}>В ожидании</SelectItem>
                            <SelectItem value={ApplicationStatus.APPROVED}>Одобренные</SelectItem>
                            <SelectItem value={ApplicationStatus.REJECTED}>Отклоненные</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Пользователь</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="hidden md:table-cell">Дата регистрации</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="hidden lg:table-cell">Дата подачи</TableHead>
                            <TableHead className="hidden xl:table-cell">Причина (от юзера)</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            renderSkeletons(pageSize)
                        ) : applicationsData && applicationsData.totalElements > 0 ? (
                            applicationsData.content.map((app) => (
                                <TableRow key={app.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <Link
                                            href={`/u/${app.username}`}
                                            target="_blank"
                                            className="hover:underline text-primary flex items-center gap-1"
                                        >
                                            {app.username}
                                            <ExternalLink className="h-3 w-3 opacity-70" />
                                        </Link>
                                    </TableCell>
                                    <TableCell>{app.userEmail}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {app.userRegisteredAt
                                            ? new Date(app.userRegisteredAt).toLocaleDateString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[app.status] || ''} variant="outline">
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {new Date(app.appliedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell
                                        className="hidden xl:table-cell max-w-xs truncate"
                                        title={app.reason || ''}
                                    >
                                        {app.reason || '-'}
                                    </TableCell>
                                    <TableCell className="flex justify-end">
                                        {app.status === ApplicationStatus.PENDING && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        aria-haspopup="true"
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={isProcessingAction}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Меню</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56 px-4 py-2" align="end">
                                                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => handleAction('approve', app.id)}
                                                        disabled={isProcessingAction}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Одобрить
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openRejectDialog(app)}
                                                        disabled={isProcessingAction}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Отклонить
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Заявок не найдено.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            {applicationsData && applicationsData.totalPages > 1 && (
                <div className="p-4">
                    <MyPagination
                        currentPage={currentPage}
                        totalPages={applicationsData.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Отклонить заявку от {rejectingApplication?.username}</DialogTitle>
                        <DialogDescription>
                            Укажите причину отклонения (необязательно, но рекомендуется).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="rejectionReason" className="text-left">
                            Причина отклонения
                        </Label>
                        <Textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Например, недостаточно опыта или неполная информация..."
                            className="col-span-3"
                            rows={3}
                            disabled={isProcessingAction}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectDialogOpen(false)}
                            disabled={isProcessingAction}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                rejectingApplication && handleAction('reject', rejectingApplication.id, rejectionReason)
                            }
                            isLoading={isProcessingAction}
                            disabled={isProcessingAction}
                        >
                            Отклонить заявку
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default AdminMentorshipApplicationsPage;
