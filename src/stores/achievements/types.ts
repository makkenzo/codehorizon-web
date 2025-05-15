import { PagedResponse } from '@/types';
import { GlobalAchievementDTO } from '@/types/achievements';

export type AchievementsFilterStatus = 'all' | 'earned' | 'unearned';

export interface AllAchievementsState {
    achievementsData: PagedResponse<GlobalAchievementDTO> | null;
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    sortBy: string;
    filterStatus: AchievementsFilterStatus;
    filterCategory: string;
    searchQuery: string;
    availableCategories: string[];
}

export interface AllAchievementsActions {
    fetchAchievements: (params?: {
        page?: number;
        sortBy?: string;
        status?: AchievementsFilterStatus;
        category?: string;
        q?: string;
    }) => Promise<void>;
    setCurrentPage: (page: number) => void;
    setSortBy: (sort: string) => void;
    setFilterStatus: (status: AchievementsFilterStatus) => void;
    setFilterCategory: (category: string) => void;
    setSearchQuery: (query: string) => void;
    fetchAvailableCategories: () => Promise<void>;
    resetFilters: () => void;
}

export type AllAchievementsStore = AllAchievementsState & AllAchievementsActions;
