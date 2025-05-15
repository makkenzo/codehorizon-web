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

interface AchievementsFiltersMobileProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    filterStatus: 'all' | 'earned' | 'unearned';
    setFilterStatus: (status: 'all' | 'earned' | 'unearned') => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    availableCategories: string[]; // Список доступных категорий
    // Добавьте другие пропсы для фильтров по мере необходимости
}

const AchievementsFiltersMobile: React.FC<AchievementsFiltersMobileProps> = ({
    isOpen,
    onOpenChange,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    availableCategories,
}) => {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[80vh] flex flex-col">
                <SheetHeader className="px-4 pt-4 pb-2">
                    <SheetTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Фильтры достижений
                    </SheetTitle>
                    <SheetDescription>Настройте отображение списка достижений.</SheetDescription>
                </SheetHeader>
                <div className="flex-grow overflow-y-auto px-4 space-y-6 py-4">
                    <div>
                        <label htmlFor="status-filter-mobile" className="text-sm font-medium mb-1.5 block">
                            Статус
                        </label>
                        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
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

                    {/* TODO: Динамический список категорий */}
                    {availableCategories.length > 0 && (
                        <div>
                            <label htmlFor="category-filter-mobile" className="text-sm font-medium mb-1.5 block">
                                Категория
                            </label>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger id="category-filter-mobile" className="w-full h-10 text-sm">
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
                        </div>
                    )}

                    {/* TODO: Добавьте другие фильтры здесь, если они нужны */}
                </div>
                <SheetFooter className="px-4 py-4 border-t">
                    <SheetClose asChild>
                        <Button type="button" className="w-full">
                            Применить
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default AchievementsFiltersMobile;
