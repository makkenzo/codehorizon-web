import { createStore } from 'zustand';

import { achievementsApiClient } from '@/server/achievements';

import { AchievementsFilterStatus, AllAchievementsState, AllAchievementsStore } from './types';

export const defaultAllAchievementsState: AllAchievementsState = {
    achievementsData: null,
    isLoading: true,
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
            set({ isLoading: true, error: null });
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
                if (category !== 'all') queryParams.category = category;
                if (q.trim().length >= 2) queryParams.q = q.trim();

                const response = await achievementsApiClient.getAllAchievementDefinitions(queryParams);
                set({
                    achievementsData: response,
                    isLoading: false,
                    currentPage: response ? response.pageNumber : 1,
                });
            } catch (err: any) {
                console.error('Failed to fetch all achievement definitions:', err);
                set({ error: err.message || 'Failed to fetch achievements', isLoading: false, achievementsData: null });
            }
        },
        setCurrentPage: (page) => {
            set({ currentPage: page });
            get().fetchAchievements({ page });
        },
        setSortBy: (sort) => {
            set({ sortBy: sort, currentPage: 1 });
            get().fetchAchievements({ sortBy: sort, page: 1 });
        },
        setFilterStatus: (status) => {
            set({ filterStatus: status, currentPage: 1 });
            get().fetchAchievements({ status, page: 1 });
        },
        setFilterCategory: (category) => {
            set({ filterCategory: category, currentPage: 1 });
            get().fetchAchievements({ category, page: 1 });
        },
        setSearchQuery: (query) => {
            set({ searchQuery: query, currentPage: 1 });
            get().fetchAchievements({ q: query, page: 1 });
        },
        fetchAvailableCategories: async () => {
            console.warn('fetchAvailableCategories: Backend endpoint for achievement categories not implemented yet.');
            set({ availableCategories: [] });
        },
        resetFilters: () => {
            set({
                filterStatus: 'all',
                filterCategory: 'all',
                searchQuery: '',
                sortBy: 'order_asc',
                currentPage: 1,
            });
            get().fetchAchievements({
                status: 'all',
                category: 'all',
                q: '',
                sortBy: 'order_asc',
                page: 1,
            });
        },
    }));
};
