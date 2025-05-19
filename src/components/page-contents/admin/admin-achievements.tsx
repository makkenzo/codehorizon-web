'use client';

import { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import {
    Award,
    BadgeCheck,
    Crown,
    Edit,
    Eye,
    EyeOff,
    Loader2,
    PlusCircle,
    Search,
    ShieldAlert,
    Sparkles,
    Trash2,
    Trophy,
} from 'lucide-react';
import { toast } from 'sonner';

import Image from 'next/image';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';
import { adminApiClient } from '@/server/admin-api-client';
import { PagedResponse } from '@/types';
import { AchievementRarity } from '@/types/achievements';
import { AdminAchievementDTO } from '@/types/achievementsAdmin';

const AdminAchievementsPageContent = () => {
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
    const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'order,asc');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);

    const currentPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 10;

    const fetchData = useCallback(
        async (page: number, currentSearchTerm: string, currentSortOption: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const sortParam = currentSortOption || 'order,asc';
                const result = await adminApiClient.getAllAchievementsDefinitions(page, pageSize, sortParam);
                setAchievementsData(result);

                const uniqueCategories = Array.from(
                    new Set(
                        result.content
                            .map((ach) => ach.category)
                            .filter((category): category is string => category !== null && category !== undefined)
                    )
                );
                setCategories(uniqueCategories);
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

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value === 'all' ? null : value);
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
        achievementsData?.content
            ?.filter(
                (ach) =>
                    (ach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ach.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ach.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (ach.category && ach.category.toLowerCase().includes(searchTerm.toLowerCase()))) &&
                    (!selectedCategory || ach.category === selectedCategory)
            )
            .sort((a, b) => {
                if (sortOption.startsWith('xpBonus')) {
                    const rarityOrder = {
                        [AchievementRarity.COMMON]: 1,
                        [AchievementRarity.UNCOMMON]: 2,
                        [AchievementRarity.RARE]: 3,
                        [AchievementRarity.EPIC]: 4,
                        [AchievementRarity.LEGENDARY]: 5,
                    };
                    if (a.xpBonus === b.xpBonus) {
                        return (
                            (rarityOrder[b.rarity as AchievementRarity] || 0) -
                            (rarityOrder[a.rarity as AchievementRarity] || 0)
                        );
                    }
                }
                return 0;
            }) || [];

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skel-ach-${index}`}>
                <TableCell>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                </TableCell>
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

    function getRarityIcon(rarity: AchievementRarity) {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return <BadgeCheck className="h-5 w-5" />;
            case AchievementRarity.UNCOMMON:
                return <Award className="h-5 w-5" />;
            case AchievementRarity.RARE:
                return <Trophy className="h-5 w-5" />;
            case AchievementRarity.EPIC:
                return <Sparkles className="h-5 w-5" />;
            case AchievementRarity.LEGENDARY:
                return <Crown className="h-5 w-5" />;
            default:
                return <BadgeCheck className="h-5 w-5" />;
        }
    }

    function getRarityGradient(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'from-cyan-500 to-blue-500';
            case AchievementRarity.UNCOMMON:
                return 'from-emerald-500 to-green-600';
            case AchievementRarity.RARE:
                return 'from-blue-500 to-indigo-600';
            case AchievementRarity.EPIC:
                return 'from-purple-500 to-pink-500';
            case AchievementRarity.LEGENDARY:
                return 'from-amber-400 to-orange-500';
            default:
                return 'from-cyan-500 to-blue-500';
        }
    }

    function getRarityColor(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'text-cyan-500';
            case AchievementRarity.UNCOMMON:
                return 'text-emerald-500';
            case AchievementRarity.RARE:
                return 'text-blue-500';
            case AchievementRarity.EPIC:
                return 'text-purple-500';
            case AchievementRarity.LEGENDARY:
                return 'text-amber-500';
            default:
                return 'text-cyan-500';
        }
    }

    function getRarityBgColor(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'bg-cyan-500';
            case AchievementRarity.UNCOMMON:
                return 'bg-emerald-500';
            case AchievementRarity.RARE:
                return 'bg-blue-500';
            case AchievementRarity.EPIC:
                return 'bg-purple-500';
            case AchievementRarity.LEGENDARY:
                return 'bg-amber-500';
            default:
                return 'bg-cyan-500';
        }
    }

    function getRarityBgLight(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'bg-cyan-50';
            case AchievementRarity.UNCOMMON:
                return 'bg-emerald-50';
            case AchievementRarity.RARE:
                return 'bg-blue-50';
            case AchievementRarity.EPIC:
                return 'bg-purple-50';
            case AchievementRarity.LEGENDARY:
                return 'bg-amber-50';
            default:
                return 'bg-cyan-50';
        }
    }

    function getRarityBorderColor(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'border-cyan-200';
            case AchievementRarity.UNCOMMON:
                return 'border-emerald-200';
            case AchievementRarity.RARE:
                return 'border-blue-200';
            case AchievementRarity.EPIC:
                return 'border-purple-200';
            case AchievementRarity.LEGENDARY:
                return 'border-amber-200';
            default:
                return 'border-cyan-200';
        }
    }

    if (!hasPermission('achievement:admin:manage')) {
        return (
            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 p-8">
                    <CardTitle className="flex items-center gap-3 text-3xl text-white">
                        <ShieldAlert className="h-8 w-8" />
                        Доступ запрещен
                    </CardTitle>
                    <CardDescription className="text-white/80 text-lg">
                        У вас нет прав для управления достижениями.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-purple-600/30 to-pink-500/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-600/30 to-cyan-500/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>
                <div className="relative backdrop-blur-sm">
                    <Card className="border-0 bg-white/70 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden py-0">
                        <CardHeader className="bg-gradient-to-r from-primary to-secondary p-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-3 text-3xl text-white">
                                        <Trophy className="h-8 w-8" />
                                        Управление Достижениями
                                    </CardTitle>
                                    <CardDescription className="text-white/80 text-lg">
                                        Создавайте, редактируйте и удаляйте определения достижений.
                                    </CardDescription>
                                </div>
                                <Link href="/admin/achievements/new">
                                    <Button
                                        size="lg"
                                        className="bg-white/20 hover:bg-white/30 text-white border-0 h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <PlusCircle className="h-5 w-5 mr-2" />
                                        Добавить Достижение
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8">
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                                <div className="relative w-full md:max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Поиск по названию, ключу, категории..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="pl-12 w-full h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                    <Select value={sortOption} onValueChange={handleSortChange}>
                                        <SelectTrigger className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-full md:w-[200px]">
                                            <SelectValue placeholder="Сортировка" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-xl shadow-xl">
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
                                    {categories.length > 0 && (
                                        <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
                                            <SelectTrigger className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-full md:w-[200px]">
                                                <SelectValue placeholder="Категория" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-xl shadow-xl">
                                                <SelectItem value="all">Все категории</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/80">
                                                <TableHead className="w-[60px]">Иконка</TableHead>
                                                <TableHead>Ключ</TableHead>
                                                <TableHead>Название</TableHead>
                                                <TableHead className="hidden md:table-cell">XP</TableHead>
                                                <TableHead className="hidden md:table-cell">Категория</TableHead>
                                                <TableHead className="hidden lg:table-cell">Статус</TableHead>
                                                <TableHead className="text-right">Действия</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                renderSkeletons(pageSize)
                                            ) : error ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={7}
                                                        className="h-24 text-center text-destructive"
                                                    >
                                                        {error}
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredAchievements.length > 0 ? (
                                                filteredAchievements.map((ach) => (
                                                    <TableRow
                                                        key={ach.id}
                                                        className={`transition-all duration-300 ${
                                                            hoveredAchievement === ach.id
                                                                ? `${getRarityBgLight(ach.rarity as AchievementRarity)}`
                                                                : 'hover:bg-gray-50/80'
                                                        }`}
                                                        onMouseEnter={() => setHoveredAchievement(ach.id)}
                                                        onMouseLeave={() => setHoveredAchievement(null)}
                                                    >
                                                        <TableCell>
                                                            <div
                                                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRarityGradient(
                                                                    ach.rarity as AchievementRarity
                                                                )} flex items-center justify-center text-white overflow-hidden`}
                                                            >
                                                                {getRarityIcon(ach.rarity as AchievementRarity)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{ach.key}</TableCell>
                                                        <TableCell className="font-semibold">{ach.name}</TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <div className="flex items-center gap-1">
                                                                <Sparkles
                                                                    className={`h-4 w-4 ${getRarityColor(ach.rarity as AchievementRarity)}`}
                                                                />
                                                                <span className="font-medium">{ach.xpBonus}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {ach.category ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`${getRarityBorderColor(
                                                                        ach.rarity as AchievementRarity
                                                                    )} ${getRarityColor(ach.rarity as AchievementRarity)} px-3 py-1 rounded-full`}
                                                                >
                                                                    {ach.category}
                                                                </Badge>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <div className="flex items-center gap-2">
                                                                {ach.isHidden ? (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-amber-200 text-amber-600 px-3 py-1 rounded-full flex items-center gap-1"
                                                                    >
                                                                        <EyeOff className="h-3 w-3" /> Скрыто
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-emerald-200 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1"
                                                                    >
                                                                        <Eye className="h-3 w-3" /> Видимо
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                                                    onClick={() =>
                                                                        router.push(
                                                                            `/admin/achievements/${ach.id}/edit`
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    <span className="sr-only">Редактировать</span>
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-9 w-9 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                                                    onClick={() => openDeleteDialog(ach)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Удалить</span>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center">
                                                        Достижения не найдены.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                        {achievementsData && achievementsData.totalPages > 1 && (
                            <CardFooter className="justify-center pt-0 pb-8">
                                <MyPagination
                                    currentPage={currentPage}
                                    totalPages={achievementsData.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-white/90 backdrop-blur-md border-0 rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-red-600">
                            <Trash2 className="h-6 w-6" />
                            Удалить достижение?
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            Вы уверены, что хотите удалить достижение "{achievementToDelete?.name}" (ключ:{' '}
                            {achievementToDelete?.key}
                            )? Это действие необратимо.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                onClick={() => setAchievementToDelete(null)}
                                disabled={isDeleting}
                                className="h-12 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                Отмена
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="h-12 px-6 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-5 w-5 mr-2" />
                            )}
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAchievementsPageContent;
