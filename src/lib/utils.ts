import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { CatalogFiltersState } from '@/stores/catalog-filters/types';
import { PopularAuthorDTO } from '@/types';

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
    console.log(filters);

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

    const isFreeParam: boolean | undefined =
        filters.priceStatus === 'free' ? true : filters.priceStatus === 'paid' ? false : undefined;

    return {
        minRating: filters.rating === 'all' ? undefined : extractNumber(filters.rating),
        minDuration,
        maxDuration,
        category: filters.categories.length > 0 ? filters.categories.join(',') : undefined,
        difficulty: filters.level.length > 0 ? filters.level.map((l) => l.toUpperCase()) : undefined,
        isFree: isFreeParam,
        sortBy: filters.sortBy,
        page: filters.page,
    };
};

export const extractNumber = (value: string) => parseFloat(value.split('-')[0]);

export const getPercentDifference = (initialValue: number, currentValue: number) => {
    const diff = ((currentValue - initialValue) / initialValue) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
};

export const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
};

export const getDisplayName = (author: PopularAuthorDTO) => {
    if (author.firstName && author.lastName) {
        return `${author.firstName} ${author.lastName}`;
    } else if (author.firstName) {
        return author.firstName;
    } else if (author.lastName) {
        return author.lastName;
    } else {
        return author.username;
    }
};

export const getInitials = (author: PopularAuthorDTO) => {
    if (author.firstName && author.lastName) {
        return `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();
    } else if (author.firstName) {
        return author.firstName[0].toUpperCase();
    } else if (author.lastName) {
        return author.lastName[0].toUpperCase();
    } else {
        return author.username[0].toUpperCase();
    }
};

export function pascalToKebabCase(str: string): string {
    if (!str) return '';
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
}

export function kebabToPascalCase(str: string): string {
    if (!str) return '';
    return str
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}
