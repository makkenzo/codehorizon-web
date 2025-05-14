'use client';

import { X } from 'lucide-react';

import { useCatalogFiltersStore } from '@/stores/catalog-filters/catalog-filters-store-provider';
import { PriceStatus } from '@/stores/catalog-filters/types';
import { CourseDifficultyLevels } from '@/types';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const videoDurationLabels: Record<string, string> = {
    '0-2-hours': '0-2 часа',
    '3-5-hours': '3-5 часов',
    '6-12-hours2': '6-12 часов',
    '12-and-more-hours': '12+ часов',
};

const levelLabels: Record<string, string> = {
    [CourseDifficultyLevels.BEGINNER]: 'Начинающий',
    [CourseDifficultyLevels.INTERMEDIATE]: 'Средний',
    [CourseDifficultyLevels.ADVANCED]: 'Продвинутый',
};

const priceStatusLabels: Record<PriceStatus, string> = {
    all: 'Все',
    free: 'Бесплатные',
    paid: 'Платные',
};

const ratingLabels: Record<string, string> = {
    all: 'Все',
    '4.5': '4.5+',
    '3.5': '3.5+',
    '3.0': '3.0+',
};

const ActiveFiltersDisplay = () => {
    const {
        categories,
        level,
        rating,
        videoDuration,
        priceStatus,
        toggleCategory,
        toggleLevel,
        setRating,
        toggleVideoDuration,
        setPriceStatus,
        reset,
        setPage,
    } = useCatalogFiltersStore((state) => state);

    const activeFilters: { type: string; label: string; value: string; onRemove: () => void }[] = [];

    const handleRemoveFilter = (removeAction: () => void) => {
        removeAction();
        setPage(1);
    };

    if (priceStatus !== 'all') {
        activeFilters.push({
            type: 'priceStatus',
            label: `Цена: ${priceStatusLabels[priceStatus]}`,
            value: priceStatus,
            onRemove: () => handleRemoveFilter(() => setPriceStatus('all')),
        });
    }
    if (rating !== 'all') {
        activeFilters.push({
            type: 'rating',
            label: `Рейтинг: ${ratingLabels[rating] || rating}`,
            value: rating,
            onRemove: () => handleRemoveFilter(() => setRating('all')),
        });
    }
    videoDuration.forEach((vd) => {
        activeFilters.push({
            type: 'videoDuration',
            label: `Длительность: ${videoDurationLabels[vd] || vd}`,
            value: vd,
            onRemove: () => handleRemoveFilter(() => toggleVideoDuration(vd)),
        });
    });
    categories.forEach((cat) => {
        activeFilters.push({
            type: 'categories',
            label: `Категория: ${cat}`,
            value: cat,
            onRemove: () => handleRemoveFilter(() => toggleCategory(cat)),
        });
    });
    level.forEach((lvl) => {
        activeFilters.push({
            type: 'level',
            label: `Уровень: ${levelLabels[lvl] || lvl}`,
            value: lvl,
            onRemove: () => handleRemoveFilter(() => toggleLevel(lvl)),
        });
    });

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-border/20 pb-3">
            <span className="text-sm font-medium text-muted-foreground mr-1">Активные фильтры:</span>
            {activeFilters.map((filter) => (
                <Badge
                    key={`${filter.type}-${filter.value}`}
                    variant="secondary"
                    className="py-1 pl-2 pr-1 text-xs bg-secondary/40 text-foreground/70 hover:bg-secondary/70"
                >
                    {filter.label}
                    <button
                        onClick={filter.onRemove}
                        className="ml-1.5 rounded-full p-0.5 hover:bg-background/50 focus:outline-none focus:ring-1 focus:ring-ring"
                        aria-label={`Удалить фильтр ${filter.label}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
            {activeFilters.length > 0 && (
                <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                        reset();
                        setPage(1);
                    }}
                    className="text-xs text-destructive p-0 h-auto hover:text-destructive/80 ml-2"
                >
                    Сбросить все
                </Button>
            )}
        </div>
    );
};

export default ActiveFiltersDisplay;
