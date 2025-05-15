'use client';

import { Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { AchievementsFilterStatus } from '@/stores/achievements/types';

interface AchievementsFiltersMobileProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    filterStatus: AchievementsFilterStatus;
    setFilterStatus: (status: AchievementsFilterStatus) => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    availableCategories: string[];
    isLoadingCategories: boolean;
}

const AchievementsFiltersMobile: React.FC<AchievementsFiltersMobileProps> = ({
    isOpen,
    onOpenChange,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    availableCategories,
    isLoadingCategories,
}) => {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[80vh] flex flex-col rounded-t-2xl">
                <SheetHeader className="px-4 pt-4 pb-2">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5 text-primary" />
                        Фильтры достижений
                    </SheetTitle>
                    <SheetDescription className="text-sm">Настройте отображение списка достижений.</SheetDescription>
                </SheetHeader>
                <div className="flex-grow overflow-y-auto px-4 space-y-6 py-4">
                    <div>
                        <label htmlFor="status-filter-mobile" className="text-sm font-medium mb-1.5 block">
                            Статус
                        </label>
                        <Select
                            value={filterStatus}
                            onValueChange={(value) => setFilterStatus(value as AchievementsFilterStatus)}
                        >
                            <SelectTrigger id="status-filter-mobile" className="w-full h-10 text-sm">
                                <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все статусы</SelectItem>
                                <SelectItem value="earned">Полученные</SelectItem>
                                <SelectItem value="unearned">Неполученные</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor="category-filter-mobile" className="text-sm font-medium mb-1.5 block">
                            Категория
                        </label>
                        <Select
                            value={filterCategory}
                            onValueChange={setFilterCategory}
                            disabled={isLoadingCategories || availableCategories.length === 0}
                        >
                            <SelectTrigger id="category-filter-mobile" className="w-full h-10 text-sm">
                                <SelectValue placeholder={isLoadingCategories ? 'Загрузка...' : 'Категория'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все категории</SelectItem>
                                {isLoadingCategories && (
                                    <SelectItem value="loading_cats_mobile" disabled>
                                        Загрузка...
                                    </SelectItem>
                                )}
                                {!isLoadingCategories && availableCategories.length === 0 && (
                                    <SelectItem value="no_cats_mobile" disabled>
                                        Нет категорий
                                    </SelectItem>
                                )}
                                {!isLoadingCategories &&
                                    availableCategories.map((cat) => (
                                        <SelectItem key={`mob-${cat}`} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <SheetFooter className="px-4 py-4 border-t border-border/20">
                    <SheetClose asChild>
                        <Button type="button" className="w-full bg-primary hover:bg-primary/90">
                            Применить
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default AchievementsFiltersMobile;
