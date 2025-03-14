import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { FiltersState } from './reducers/filters-reducer';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatNumber = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
};

export const mapFiltersToApiParams = (filters: FiltersState) => {
    return {
        minRating: filters.rating === 'all' ? undefined : extractNumber(filters.rating),
        maxDuration: filters.videoDuration.length > 0 ? Math.max(...filters.videoDuration.map(Number)) : undefined,
        category: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
        difficulty: filters.level.length > 0 ? filters.level.map((l) => l.toUpperCase()) : undefined,
    };
};

export const extractNumber = (value: string) => parseFloat(value.split('-')[0]);
