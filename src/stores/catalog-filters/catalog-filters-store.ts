import { createStore } from 'zustand';

import { CatalogFiltersState, CatalogFiltersStore } from './types';

export const defaultInitState: CatalogFiltersState = {
    page: 1,
    totalPages: null,
    rating: 'all',
    videoDuration: [],
    categories: [],
    level: [],
    sortBy: 'popular',
};

export const createCatalogFiltersStore = (initState: CatalogFiltersState = defaultInitState) => {
    return createStore<CatalogFiltersStore>()((set) => ({
        ...initState,
        setPage: (page: number) => set(() => ({ page })),
        setTotalPages: (totalPages: number) => set(() => ({ totalPages })),
        setRating: (rating: string) => set(() => ({ rating: rating || 'all' })),
        toggleVideoDuration: (duration: string) =>
            set((state) => ({
                videoDuration: state.videoDuration.includes(duration)
                    ? state.videoDuration.filter((d) => d !== duration)
                    : [...state.videoDuration, duration],
            })),
        toggleCategory: (category: string) =>
            set((state) => ({
                categories: state.categories.includes(category)
                    ? state.categories.filter((c) => c !== category)
                    : [...state.categories, category],
            })),
        toggleLevel: (level: string) =>
            set((state) => ({
                level: state.level.includes(level) ? state.level.filter((l) => l !== level) : [...state.level, level],
            })),
        setSortBy: (sortBy: string) => set(() => ({ sortBy })),
        reset: () => set({ ...defaultInitState }),
    }));
};

