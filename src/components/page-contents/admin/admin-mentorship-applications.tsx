'use client';

import { useCallback, useEffect, useState } from 'react';

import {
    Calendar,
    CheckCircle,
    Clock,
    ExternalLink,
    FileText,
    Loader2,
    Mail,
    User,
    UserCheck,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';

import MyPagination from '@/components/reusable/my-pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { mentorshipApiClient } from '@/server/mentorship';
import { PagedResponse } from '@/types';
import { ApplicationStatus, MentorshipApplication } from '@/types/mentorship';

const AdminMentorshipApplicationsPageContent = () => {
    const [applicationsData, setApplicationsData] = useState<PagedResponse<MentorshipApplication> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [filterStatus, setFilterStatus] = useState<ApplicationStatus | undefined>(undefined);
    const [sortBy, setSortBy] = useState<string>('appliedAt,desc');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectingApplication, setRejectingApplication] = useState<MentorshipApplication | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<MentorshipApplication | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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
                toast.success(`Заявка одобрена успешно!`, {
                    description: 'Пользователь получил роль ментора.',
                });
            } else {
                result = await mentorshipApiClient.rejectApplication(applicationId, reason);
                toast.success(`Заявка отклонена.`, {
                    description: reason ? `Причина: ${reason}` : 'Причина не указана.',
                });
                setIsRejectDialogOpen(false);
            }
            if (result) {
                fetchApplications();
            }
        } catch (error: any) {
            toast.error(
                `Ошибка ${action === 'approve' ? 'одобрения' : 'отклонения'} заявки: ${
                    error?.response?.data?.message || error.message || 'Неизвестная ошибка'
                }`
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

    const openDetailsDialog = (app: MentorshipApplication) => {
        setSelectedApplication(app);
        setIsDetailsDialogOpen(true);
    };

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-7 w-28 rounded-full" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-5 w-28" />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                    <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell className="text-right">
                    <Skeleton className="h-9 w-9 rounded-full inline-block" />
                </TableCell>
            </TableRow>
        ));

    const getStatusConfig = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.PENDING:
                return {
                    color: 'bg-amber-100 text-amber-800 border-amber-200',
                    hoverBg: 'hover:bg-amber-50',
                    icon: <Clock className="h-4 w-4" />,
                    label: 'В ожидании',
                    gradient: 'from-amber-500 to-orange-500',
                };
            case ApplicationStatus.APPROVED:
                return {
                    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    hoverBg: 'hover:bg-emerald-50',
                    icon: <CheckCircle className="h-4 w-4" />,
                    label: 'Одобрено',
                    gradient: 'from-emerald-500 to-green-500',
                };
            case ApplicationStatus.REJECTED:
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    hoverBg: 'hover:bg-red-50',
                    icon: <XCircle className="h-4 w-4" />,
                    label: 'Отклонено',
                    gradient: 'from-red-500 to-pink-500',
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    hoverBg: 'hover:bg-gray-50',
                    icon: <Clock className="h-4 w-4" />,
                    label: 'Неизвестно',
                    gradient: 'from-gray-500 to-gray-600',
                };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getInitials = (username: string) => {
        return username.substring(0, 2).toUpperCase();
    };

    return (
        <div className="w-full mx-auto">
            <div className="relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-primary to-cyan-500/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-600/30 to-pink-500/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>
                <div className="relative backdrop-blur-sm">
                    <Card className="border-0 bg-white/70 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden py-0">
                        <CardHeader className="bg-gradient-to-r from-primary to-secondary p-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-3 text-3xl text-white">
                                        <UserCheck className="h-8 w-8" />
                                        Заявки на менторство
                                    </CardTitle>
                                    <CardDescription className="text-white/80 text-lg">
                                        Просмотр и управление заявками пользователей на получение роли ментора.
                                    </CardDescription>
                                </div>
                                <div className="flex gap-3">
                                    <Select
                                        value={filterStatus || 'ALL'}
                                        onValueChange={(value) => {
                                            setFilterStatus(value === 'ALL' ? undefined : (value as ApplicationStatus));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="hover:bg-white/30 border-0 h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-[200px] bg-white/90">
                                            <SelectValue placeholder="Фильтр по статусу" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-lg shadow-xl">
                                            <SelectItem value="ALL" className="flex items-center gap-2 py-2">
                                                <UserPlus className="h-4 w-4 text-blue-500" />
                                                <span>Все статусы</span>
                                            </SelectItem>
                                            <SelectItem
                                                value={ApplicationStatus.PENDING}
                                                className="flex items-center gap-2 py-2 text-amber-600"
                                            >
                                                <Clock className="h-4 w-4" />
                                                <span>В ожидании</span>
                                            </SelectItem>
                                            <SelectItem
                                                value={ApplicationStatus.APPROVED}
                                                className="flex items-center gap-2 py-2 text-emerald-600"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                <span>Одобренные</span>
                                            </SelectItem>
                                            <SelectItem
                                                value={ApplicationStatus.REJECTED}
                                                className="flex items-center gap-2 py-2 text-red-600"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                <span>Отклоненные</span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="hover:bg-white/30 border-0 h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-[200px] bg-white/90">
                                            <SelectValue placeholder="Сортировка" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-lg shadow-xl">
                                            <SelectItem value="appliedAt,desc" className="flex items-center gap-2 py-2">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                <span>Сначала новые</span>
                                            </SelectItem>
                                            <SelectItem value="appliedAt,asc" className="flex items-center gap-2 py-2">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                <span>Сначала старые</span>
                                            </SelectItem>
                                            <SelectItem value="username,asc" className="flex items-center gap-2 py-2">
                                                <User className="h-4 w-4 text-blue-500" />
                                                <span>По имени (А-Я)</span>
                                            </SelectItem>
                                            <SelectItem value="username,desc" className="flex items-center gap-2 py-2">
                                                <User className="h-4 w-4 text-blue-500" />
                                                <span>По имени (Я-А)</span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/80">
                                                <TableHead>Пользователь</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead className="hidden md:table-cell">Дата регистрации</TableHead>
                                                <TableHead>Статус</TableHead>
                                                <TableHead className="hidden lg:table-cell">Дата подачи</TableHead>
                                                <TableHead className="hidden xl:table-cell">
                                                    Причина (от юзера)
                                                </TableHead>
                                                <TableHead className="text-right">Действия</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                renderSkeletons(pageSize)
                                            ) : applicationsData && applicationsData.totalElements > 0 ? (
                                                applicationsData.content.map((app) => {
                                                    const statusConfig = getStatusConfig(app.status);
                                                    return (
                                                        <TableRow
                                                            key={app.id}
                                                            className={`transition-all duration-300 ${
                                                                hoveredRow === app.id
                                                                    ? statusConfig.hoverBg
                                                                    : 'hover:bg-gray-50/80'
                                                            }`}
                                                            onMouseEnter={() => setHoveredRow(app.id)}
                                                            onMouseLeave={() => setHoveredRow(null)}
                                                        >
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-10 w-10 border-2 border-gray-200">
                                                                        <AvatarImage
                                                                            src={`https://avatar.vercel.sh/${app.username}`}
                                                                        />
                                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                                                                            {getInitials(app.username)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <Link
                                                                        href={`/u/${app.username}`}
                                                                        target="_blank"
                                                                        className="hover:underline text-blue-600 font-medium flex items-center gap-1 group"
                                                                    >
                                                                        {app.username}
                                                                        <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                                    </Link>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="table-cell">
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-gray-600">
                                                                        {app.userEmail}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-gray-600">
                                                                        {app.userRegisteredAt
                                                                            ? formatDate(app.userRegisteredAt)
                                                                            : '-'}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`${statusConfig.color} px-3 py-1 rounded-full flex items-center gap-1`}
                                                                >
                                                                    {statusConfig.icon}
                                                                    <span>{statusConfig.label}</span>
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="hidden lg:table-cell">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-gray-600">
                                                                        {formatDate(app.appliedAt)}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell
                                                                className="hidden xl:table-cell max-w-xs truncate"
                                                                title={app.reason || ''}
                                                            >
                                                                {app.reason ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                        <span className="text-gray-600 truncate">
                                                                            {app.reason}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="ghost"
                                                                                    className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                                                                    onClick={() =>
                                                                                        openDetailsDialog(app)
                                                                                    }
                                                                                >
                                                                                    <FileText className="h-4 w-4" />
                                                                                    <span className="sr-only">
                                                                                        Детали
                                                                                    </span>
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Просмотреть детали</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>

                                                                    {app.status === ApplicationStatus.PENDING && (
                                                                        <>
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            size="icon"
                                                                                            variant="ghost"
                                                                                            className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                                                                            onClick={() =>
                                                                                                handleAction(
                                                                                                    'approve',
                                                                                                    app.id
                                                                                                )
                                                                                            }
                                                                                            disabled={
                                                                                                isProcessingAction
                                                                                            }
                                                                                        >
                                                                                            <CheckCircle className="h-4 w-4" />
                                                                                            <span className="sr-only">
                                                                                                Одобрить
                                                                                            </span>
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p>Одобрить заявку</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>

                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            size="icon"
                                                                                            variant="ghost"
                                                                                            className="h-9 w-9 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                                                                            onClick={() =>
                                                                                                openRejectDialog(app)
                                                                                            }
                                                                                            disabled={
                                                                                                isProcessingAction
                                                                                            }
                                                                                        >
                                                                                            <XCircle className="h-4 w-4" />
                                                                                            <span className="sr-only">
                                                                                                Отклонить
                                                                                            </span>
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p>Отклонить заявку</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                                            <UserPlus className="h-8 w-8 text-gray-400" />
                                                            <p>Заявок не найдено.</p>
                                                            {filterStatus && (
                                                                <Button
                                                                    variant="link"
                                                                    onClick={() => setFilterStatus(undefined)}
                                                                    className="text-blue-500"
                                                                >
                                                                    Сбросить фильтр
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                        {applicationsData && applicationsData.totalPages > 1 && (
                            <CardFooter className="justify-center pt-0 pb-8">
                                <MyPagination
                                    currentPage={currentPage}
                                    totalPages={applicationsData.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="bg-white/90 backdrop-blur-md border-0 rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-red-600">
                            <XCircle className="h-6 w-6" />
                            Отклонить заявку
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            {rejectingApplication && (
                                <div className="flex items-center gap-2 mt-2 mb-4">
                                    <Avatar className="h-10 w-10 border-2 border-gray-200">
                                        <AvatarImage
                                            src={`https://avatar.vercel.sh/${rejectingApplication.username}`}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                                            {rejectingApplication.username.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{rejectingApplication.username}</p>
                                        <p className="text-sm text-gray-500">{rejectingApplication.userEmail}</p>
                                    </div>
                                </div>
                            )}
                            Укажите причину отклонения (необязательно, но рекомендуется).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="rejectionReason" className="text-left text-gray-700 font-medium">
                            Причина отклонения
                        </Label>
                        <Textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Например, недостаточно опыта или неполная информация..."
                            className="col-span-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                            rows={3}
                            disabled={isProcessingAction}
                        />
                    </div>
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectDialogOpen(false)}
                            disabled={isProcessingAction}
                            className="h-12 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                rejectingApplication && handleAction('reject', rejectingApplication.id, rejectionReason)
                            }
                            disabled={isProcessingAction}
                            className="h-12 px-6 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {isProcessingAction ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <XCircle className="h-5 w-5 mr-2" />
                            )}
                            Отклонить заявку
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="bg-white/90 backdrop-blur-md border-0 rounded-2xl shadow-xl max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                            <FileText className="h-6 w-6" />
                            Детали заявки
                        </DialogTitle>
                    </DialogHeader>
                    {selectedApplication && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-1 rounded-2xl shadow-lg">
                                    <Avatar className="h-24 w-24 rounded-xl border-4 border-white">
                                        <AvatarImage src={`https://avatar.vercel.sh/${selectedApplication.username}`} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl">
                                            {selectedApplication.username.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <User className="h-5 w-5 text-blue-500" />
                                            {selectedApplication.username}
                                        </h3>
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            {selectedApplication.userEmail}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-sm text-gray-500">Дата регистрации</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                {selectedApplication.userRegisteredAt
                                                    ? formatDateTime(selectedApplication.userRegisteredAt)
                                                    : 'Не указана'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-sm text-gray-500">Дата подачи заявки</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                {formatDateTime(selectedApplication.appliedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <Badge
                                            variant="outline"
                                            className={`${getStatusConfig(selectedApplication.status).color} px-3 py-1 rounded-full flex items-center gap-1 w-fit`}
                                        >
                                            {getStatusConfig(selectedApplication.status).icon}
                                            <span>{getStatusConfig(selectedApplication.status).label}</span>
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    Причина запроса (от пользователя)
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[100px]">
                                    {selectedApplication.reason || (
                                        <p className="text-gray-400 italic">Пользователь не указал причину</p>
                                    )}
                                </div>
                            </div>
                            {selectedApplication.rejectionReason && (
                                <div className="bg-red-50 p-4 rounded-xl">
                                    <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        Причина отклонения
                                    </h4>
                                    <div className="bg-white p-4 rounded-lg border border-red-100">
                                        {selectedApplication.rejectionReason}
                                    </div>
                                </div>
                            )}
                            {selectedApplication.status === ApplicationStatus.PENDING && (
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsDetailsDialogOpen(false);
                                            openRejectDialog(selectedApplication);
                                        }}
                                        className="h-12 px-6 rounded-xl bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <XCircle className="h-5 w-5 mr-2" />
                                        Отклонить
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleAction('approve', selectedApplication.id);
                                            setIsDetailsDialogOpen(false);
                                        }}
                                        disabled={isProcessingAction}
                                        className="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        {isProcessingAction ? (
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        ) : (
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                        )}
                                        Одобрить заявку
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMentorshipApplicationsPageContent;
