'use client';

import { ListFilter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AchievementsFilterStatus } from '@/stores/achievements/types';

interface AchievementsFiltersProps {
    filterStatus: AchievementsFilterStatus;
    setFilterStatus: (status: AchievementsFilterStatus) => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    availableCategories: string[];
    isLoadingCategories: boolean;
}

const AchievementsFilters: React.FC<AchievementsFiltersProps> = ({
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    availableCategories,
    isLoadingCategories,
}) => {
    return (
        <>
            <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as AchievementsFilterStatus)}>
                <SelectTrigger className="w-auto min-w-[130px] h-9 text-xs bg-background">
                    <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="earned">Полученные</SelectItem>
                    <SelectItem value="unearned">Неполученные</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
                disabled={isLoadingCategories || availableCategories.length === 0}
            >
                <SelectTrigger className="w-auto min-w-[150px] h-9 text-xs bg-background">
                    <SelectValue placeholder={isLoadingCategories ? 'Загрузка...' : 'Категория'} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {isLoadingCategories && (
                        <SelectItem value="loading_cats" disabled>
                            Загрузка...
                        </SelectItem>
                    )}
                    {!isLoadingCategories && availableCategories.length === 0 && (
                        <SelectItem value="no_cats" disabled>
                            Нет категорий
                        </SelectItem>
                    )}
                    {!isLoadingCategories &&
                        availableCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
        </>
    );
};

export default AchievementsFilters;
