export type FiltersActionType =
    | 'SET_RATING'
    | 'SET_PAGE'
    | 'SET_TOTAL_PAGES'
    | 'SET_SORT_BY'
    | 'TOGGLE_VIDEO_DURATION'
    | 'TOGGLE_CATEGORY'
    | 'TOGGLE_LEVEL'
    | 'SET_CATEGORIES'
    | 'SET_LEVELS'
    | 'SET_VIDEO_DURATIONS'
    | 'RESET';

export type CatalogFiltersState = {
    page: number;
    totalPages: number | null;
    rating: string;
    videoDuration: string[];
    categories: string[];
    level: string[];
    sortBy: string;
};

export type CatalogFiltersActions = {
    setPage: (page: number) => void;
    setTotalPages: (totalPages: number) => void;
    setRating: (rating: string) => void;
    toggleVideoDuration: (duration: string) => void;
    toggleCategory: (category: string) => void;
    toggleLevel: (level: string) => void;
    setSortBy: (sortBy: string) => void;
    setCategories: (categories: string[]) => void;
    setLevels: (levels: string[]) => void;
    setVideoDurations: (durations: string[]) => void;
    reset: () => void;
};

export type CatalogFiltersStore = CatalogFiltersState & CatalogFiltersActions;
