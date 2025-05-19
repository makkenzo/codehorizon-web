'use client';

import { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { Edit, MoreHorizontal, PlusCircle, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MyPagination from '@/components/reusable/my-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';
import { adminApiClient } from '@/server/admin-api-client';
import { PagedResponse } from '@/types';
import { AdminAchievementDTO } from '@/types/achievementsAdmin';

const AdminAchievementsPage = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { hasPermission } = usePermissions();

    const [achievementsData, setAchievementsData] = useState<PagedResponse<AdminAchievementDTO> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [achievementToDelete, setAchievementToDelete] = useState<AdminAchievementDTO | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'order,asc');

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 10;

    const fetchData = useCallback(
        async (page: number, currentSearchTerm: string, currentSortOption: string) => {
            setIsLoading(true);
            setError(null);
            try {
                // На данный момент API бэкенда не поддерживает поиск по названию для достижений
                const sortParam = currentSortOption || 'order,asc';
                const result = await adminApiClient.getAllAchievementsDefinitions(page, pageSize, sortParam);
                setAchievementsData(result);
            } catch (err: unknown) {
                console.error('Failed to fetch achievements:', err);
                let errorMsg = 'Unknown error';
                if (isAxiosError(err)) {
                    errorMsg = err.response?.data?.message || err.message || 'Failed to fetch achievements';
                } else if (err instanceof Error) {
                    errorMsg = err.message;
                }
                setError(errorMsg);
                toast.error(`Ошибка загрузки достижений: ${errorMsg}`);
                setAchievementsData(null);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize]
    );

    useEffect(() => {
        fetchData(currentPage, searchTerm, sortOption);
    }, [currentPage, searchTerm, sortOption, fetchData]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        const params = new URLSearchParams(searchParams.toString());
        params.set('search', newSearchTerm);
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSortChange = (value: string) => {
        setSortOption(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', value);
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const openDeleteDialog = (achievement: AdminAchievementDTO) => {
        setAchievementToDelete(achievement);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!achievementToDelete) return;
        setIsDeleting(true);
        try {
            await adminApiClient.deleteAchievementDefinition(achievementToDelete.id);
            toast.success(`Достижение "${achievementToDelete.name}" успешно удалено.`);
            setIsDeleteDialogOpen(false);
            setAchievementToDelete(null);
            fetchData(currentPage, searchTerm, sortOption);
        } catch (err) {
            toast.error('Ошибка удаления достижения.');
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredAchievements =
        achievementsData?.content?.filter(
            (ach) =>
                ach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ach.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ach.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ach.category && ach.category.toLowerCase().includes(searchTerm.toLowerCase()))
        ) || [];

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skel-ach-${index}`}>
                <TableCell>
                    <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-12" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 inline-block" />
                </TableCell>
            </TableRow>
        ));

    if (!hasPermission('achievement:admin:manage')) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        Доступ запрещен
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>У вас нет прав для управления достижениями.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Управление Достижениями</CardTitle>
                        <CardDescription>Создавайте, редактируйте и удаляйте определения достижений.</CardDescription>
                    </div>
                    <Link href="/admin/achievements/new">
                        <Button size="sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Добавить Достижение
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Поиск по названию, ключу, категории..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-8 w-full h-9"
                            />
                        </div>
                        <Select value={sortOption} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-full sm:w-auto h-9 text-xs">
                                <SelectValue placeholder="Сортировка" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="order,asc">По порядку (возр.)</SelectItem>
                                <SelectItem value="order,desc">По порядку (убыв.)</SelectItem>
                                <SelectItem value="name,asc">По имени (А-Я)</SelectItem>
                                <SelectItem value="name,desc">По имени (Я-А)</SelectItem>
                                <SelectItem value="key,asc">По ключу (А-Я)</SelectItem>
                                <SelectItem value="key,desc">По ключу (Я-А)</SelectItem>
                                <SelectItem value="xpBonus,desc">По XP (убыв.)</SelectItem>
                                <SelectItem value="xpBonus,asc">По XP (возр.)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ключ</TableHead>
                                    <TableHead>Название</TableHead>
                                    <TableHead className="hidden md:table-cell">XP</TableHead>
                                    <TableHead className="hidden md:table-cell">Категория</TableHead>
                                    <TableHead className="hidden lg:table-cell">Скрыто</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    renderSkeletons(pageSize)
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-destructive">
                                            {error}
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAchievements.length > 0 ? (
                                    filteredAchievements.map((ach) => (
                                        <TableRow key={ach.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium">{ach.key}</TableCell>
                                            <TableCell>{ach.name}</TableCell>
                                            <TableCell className="hidden md:table-cell">{ach.xpBonus}</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {ach.category ? <Badge variant="secondary">{ach.category}</Badge> : '-'}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <Badge
                                                    variant={ach.isHidden ? 'outline' : 'default'}
                                                    className={ach.isHidden ? 'border-amber-500 text-amber-600' : ''}
                                                >
                                                    {ach.isHidden ? 'Да' : 'Нет'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Действия</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                router.push(`/admin/achievements/${ach.id}/edit`)
                                                            }
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" /> Редактировать
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive cursor-pointer"
                                                            onClick={() => openDeleteDialog(ach)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Удалить
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Достижения не найдены.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                {achievementsData && achievementsData.totalPages > 1 && (
                    <CardFooter className="justify-center pt-6">
                        <MyPagination
                            currentPage={currentPage}
                            totalPages={achievementsData.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </CardFooter>
                )}
            </Card>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удалить достижение?</DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите удалить достижение "{achievementToDelete?.name}" (ключ:{' '}
                            {achievementToDelete?.key})? Это действие необратимо.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                onClick={() => setAchievementToDelete(null)}
                                disabled={isDeleting}
                            >
                                Отмена
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            isLoading={isDeleting}
                            disabled={isDeleting}
                        >
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminAchievementsPage;
