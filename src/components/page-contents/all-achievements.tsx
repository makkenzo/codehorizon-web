'use client';

import { useCallback, useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';
import { ListFilter, SearchX, ShieldAlert, Trophy } from 'lucide-react';

import AchievementsFiltersMobile from '@/components/achievements/achievements-filters-mobile';
import MyPagination from '@/components/reusable/my-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllAchievementsStore } from '@/stores/achievements/achievements-store-provider';

import AchievementItem from '../achievements/achievement-item';
import AchievementsFilters from '../achievements/achievements-filters';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const AllAchievementsPageContent = () => {
    const {
        achievementsData,
        isLoadingAchievements,
        isLoadingCategories,
        error,
        currentPage,
        sortBy,
        filterStatus,
        filterCategory,
        searchQuery,
        availableCategories,
        fetchAchievements,
        setCurrentPage,
        setSortBy,
        setFilterStatus,
        setFilterCategory,
        setSearchQuery: setStoreSearchQuery,
        fetchAvailableCategories,
    } = useAllAchievementsStore((state) => state);

    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const debouncedSetStoreSearchQuery = useCallback(
        debounce((value: string) => {
            setStoreSearchQuery(value);
        }, 300),
        [setStoreSearchQuery]
    );

    useEffect(() => {
        debouncedSetStoreSearchQuery(localSearchQuery);
        return () => debouncedSetStoreSearchQuery.cancel();
    }, [localSearchQuery, debouncedSetStoreSearchQuery]);

    useEffect(() => {
        if (availableCategories.length === 0) {
            fetchAvailableCategories();
        }
    }, [fetchAvailableCategories, availableCategories.length]);

    useEffect(() => {
        fetchAchievements();
    }, [currentPage, sortBy, filterStatus, filterCategory, searchQuery, fetchAchievements]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const renderSkeletons = (count = 12) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={`skel-ach-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                    <div className="flex flex-col h-full bg-card/70 dark:bg-background/70 backdrop-blur-sm border border-border/20 shadow-sm rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full bg-muted/70 dark:bg-muted/20" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-5 w-3/4 rounded bg-muted/70 dark:bg-muted/20" />
                                <Skeleton className="h-3 w-1/2 rounded bg-muted/70 dark:bg-muted/20" />
                            </div>
                        </div>
                        <Skeleton className="h-3 w-full rounded bg-muted/70 dark:bg-muted/20" />
                        <Skeleton className="h-3 w-5/6 rounded bg-muted/70 dark:bg-muted/20" />
                        <div className="pt-2 mt-auto border-t border-border/10 dark:border-border/20">
                            <Skeleton className="h-5 w-1/3 rounded bg-muted/70 dark:bg-muted/20 mt-2" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2.5">
                    <Trophy className="h-8 w-8 text-primary" />
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Все Достижения
                    </span>
                </h1>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                    Откройте для себя все награды, которые вы можете заработать на CodeHorizon! Каждое достижение - это
                    шаг к новым знаниям и признанию ваших успехов.
                </p>
            </div>

            {/* Filters and Search Section */}
            <div className="sticky top-[var(--header-height,60px)] z-10 py-4 bg-background/80 dark:bg-background/80 backdrop-blur-md -mx-4 px-4 md:mx-0 md:px-0 md:relative md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none md:shadow-none md:border-none md:rounded-none shadow-sm border-b border-border/20 md:p-0">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:max-w-xs">
                        <Input
                            type="search"
                            placeholder="Поиск достижений..."
                            value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}
                            className="h-9 text-xs bg-background"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            className="md:hidden h-9 w-9 bg-background"
                            onClick={() => setIsMobileFiltersOpen(true)}
                        >
                            <ListFilter className="h-4 w-4" />
                            <span className="sr-only">Фильтры</span>
                        </Button>

                        <div className="hidden md:flex items-center gap-2">
                            <AchievementsFilters
                                filterStatus={filterStatus}
                                setFilterStatus={setFilterStatus}
                                filterCategory={filterCategory}
                                setFilterCategory={setFilterCategory}
                                availableCategories={availableCategories}
                                isLoadingCategories={isLoadingCategories}
                            />
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full md:w-auto md:min-w-[160px] h-9 text-xs bg-background">
                                <SelectValue placeholder="Сортировка" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="order_asc">По порядку</SelectItem>
                                <SelectItem value="name_asc">Имени (А-Я)</SelectItem>
                                <SelectItem value="name_desc">Имени (Я-А)</SelectItem>
                                <SelectItem value="xpBonus_desc">XP (убыв.)</SelectItem>
                                <SelectItem value="xpBonus_asc">XP (возр.)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <AchievementsFiltersMobile
                isOpen={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                availableCategories={availableCategories}
                isLoadingCategories={isLoadingCategories}
            />

            {/* Achievements Grid */}
            {isLoadingAchievements && renderSkeletons()}

            {!isLoadingAchievements && error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-6 text-center">
                    <ShieldAlert className="h-12 w-12 mx-auto text-destructive/60 mb-3" />
                    <h3 className="text-lg font-semibold text-destructive mb-1">Не удалось загрузить достижения</h3>
                    <p className="text-sm text-destructive/80">{error}</p>
                </div>
            )}

            {!isLoadingAchievements && !error && achievementsData && achievementsData.content.length === 0 && (
                <div className="text-center py-16 px-4 rounded-xl bg-card/50 dark:bg-background/50 backdrop-blur-sm border border-border/20 shadow-sm">
                    <SearchX className="h-16 w-16 mx-auto text-primary/40 mb-4" />
                    <h3 className="text-xl font-semibold mb-1 text-foreground">Достижения не найдены</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        По вашему запросу ничего не найдено. Попробуйте изменить фильтры или поисковый запрос.
                    </p>
                </div>
            )}

            {!isLoadingAchievements && !error && achievementsData && achievementsData.content.length > 0 && (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    {achievementsData.content.map((achievement, index) => (
                        <AchievementItem key={achievement.id || `ach-${index}`} achievement={achievement} />
                    ))}
                </motion.div>
            )}

            {!isLoadingAchievements && achievementsData && achievementsData.totalPages > 1 && (
                <MyPagination
                    className="mt-10"
                    currentPage={achievementsData.pageNumber}
                    totalPages={achievementsData.totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </motion.div>
    );
};

export default AllAchievementsPageContent;
