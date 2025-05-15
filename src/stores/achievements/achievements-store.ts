import { createStore } from 'zustand';

import { achievementsApiClient } from '@/server/achievements';

import { AllAchievementsState, AllAchievementsStore } from './types';

export const defaultAllAchievementsState: AllAchievementsState = {
    achievementsData: null,
    isLoadingAchievements: true,
    isLoadingCategories: true,
    error: null,
    currentPage: 1,
    sortBy: 'order_asc',
    filterStatus: 'all',
    filterCategory: 'all',
    searchQuery: '',
    availableCategories: [],
};

export const createAllAchievementsStore = (initState: AllAchievementsState = defaultAllAchievementsState) => {
    return createStore<AllAchievementsStore>()((set, get) => ({
        ...initState,
        fetchAchievements: async (params = {}) => {
            set({ isLoadingAchievements: true, error: null });
            const {
                page = get().currentPage,
                sortBy = get().sortBy,
                status = get().filterStatus,
                category = get().filterCategory,
                q = get().searchQuery,
            } = params;

            try {
                const queryParams: any = { page, size: 12, sortBy };
                if (status !== 'all') queryParams.status = status;
                if (category !== 'all' && category.trim() !== '') queryParams.category = category;
                if (q.trim().length >= 2) queryParams.q = q.trim();

                const response = await achievementsApiClient.getAllAchievementDefinitions(queryParams);
                set({
                    achievementsData: response,
                    isLoadingAchievements: false,
                    currentPage: response ? response.pageNumber : 1,
                });
            } catch (err: any) {
                console.error('Failed to fetch all achievement definitions:', err);
                set({
                    error: err.message || 'Failed to fetch achievements',
                    isLoadingAchievements: false,
                    achievementsData: null,
                });
            }
        },
        fetchAvailableCategories: async () => {
            set({ isLoadingCategories: true, error: null });
            try {
                const categories = await achievementsApiClient.getAchievementCategories();
                set({
                    availableCategories: categories ?? [],
                    isLoadingCategories: false,
                });
            } catch (error: any) {
                console.error('Failed to fetch achievement categories for store', error);
                set({
                    availableCategories: [],
                    isLoadingCategories: false,
                    error: error.message || 'Failed to load categories',
                });
            }
        },
        setCurrentPage: (page) => {
            set({ currentPage: page });
        },
        setSortBy: (sort) => {
            set({ sortBy: sort, currentPage: 1 });
        },
        setFilterStatus: (status) => {
            set({ filterStatus: status, currentPage: 1 });
        },
        setFilterCategory: (category) => {
            set({ filterCategory: category, currentPage: 1 });
        },
        setSearchQuery: (query) => {
            set({ searchQuery: query, currentPage: 1 });
        },
        resetFilters: () => {
            set({
                filterStatus: 'all',
                filterCategory: 'all',
                searchQuery: '',
                sortBy: 'order_asc',
                currentPage: 1,
            });
        },
    }));
};
