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

interface AchievementsFiltersProps {
    filterStatus: 'all' | 'earned' | 'unearned';
    setFilterStatus: (status: 'all' | 'earned' | 'unearned') => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
}

const AchievementsFilters: React.FC<AchievementsFiltersProps> = ({
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
}) => {
    // TODO: Получать доступные категории/теги для фильтрации, если они есть
    const availableCategories = ['Общие', 'Курсы', 'Сообщество', 'Особые'];

    return (
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-card/50 dark:bg-background/50 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm">
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground mr-2 whitespace-nowrap">
                    Фильтровать по:
                </span>

                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                    <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs bg-background">
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="earned">Полученные</SelectItem>
                        <SelectItem value="unearned">Неполученные</SelectItem>
                    </SelectContent>
                </Select>

                {availableCategories.length > 0 && (
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs bg-background">
                            <SelectValue placeholder="Категория" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все категории</SelectItem>
                            {availableCategories.map((cat) => (
                                <SelectItem key={cat} value={cat.toLowerCase()}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
};

export default AchievementsFilters;
