import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { CatalogFiltersState } from '@/stores/catalog-filters/types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatNumber = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
};

export const mapFiltersToApiParams = (filters: Omit<CatalogFiltersState, 'totalPages'>) => {
    const parseDuration = (duration: string) => {
        if (duration.includes('and-more')) {
            const match = duration.match(/(\d+)-and-more-hours/);
            return match ? [Number(match[1])] : [];
        }

        const match = duration.match(/(\d+)-(\d+)-hours/);
        return match ? [Number(match[1]), Number(match[2])] : [];
    };

    const durations = filters.videoDuration.flatMap(parseDuration);
    const minDuration = durations.length > 0 ? Math.min(...durations) : undefined;
    const maxDuration = durations.length > 1 ? Math.max(...durations) : undefined;

    return {
        minRating: filters.rating === 'all' ? undefined : extractNumber(filters.rating),
        minDuration,
        maxDuration,
        category: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
        difficulty: filters.level.length > 0 ? filters.level.map((l) => l.toUpperCase()) : undefined,
        sortBy: filters.sortBy,
        page: filters.page,
    };
};

export const extractNumber = (value: string) => parseFloat(value.split('-')[0]);

export const getPercentDifference = (initialValue: number, currentValue: number) => {
    const diff = ((currentValue - initialValue) / initialValue) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
};
