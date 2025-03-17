export type FiltersActionType =
    | 'SET_RATING'
    | 'SET_SORT_BY'
    | 'TOGGLE_VIDEO_DURATION'
    | 'TOGGLE_CATEGORY'
    | 'TOGGLE_LEVEL'
    | 'RESET';

export type CatalogFiltersState = {
    rating: string;
    videoDuration: string[];
    categories: string[];
    level: string[];
    sortBy: string;
};

export type CatalogFiltersActions = {
    setRating: (rating: string) => void;
    toggleVideoDuration: (duration: string) => void;
    toggleCategory: (category: string) => void;
    toggleLevel: (level: string) => void;
    setSortBy: (sortBy: string) => void;
    reset: () => void;
};

export type CatalogFiltersStore = CatalogFiltersState & CatalogFiltersActions;

