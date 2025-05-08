import { CatalogFiltersState, FiltersActionType } from '@/stores/catalog-filters/types';

export interface FiltersAction {
    type: FiltersActionType;
    payload?: string;
}

export const initialFiltersState: CatalogFiltersState = {
    page: 1,
    totalPages: null,
    rating: 'all',
    videoDuration: [],
    categories: [],
    level: [],
    sortBy: 'popular',
    priceStatus: 'all',
};

/**
 * Reducer function for filters state.
 *
 * @param {FiltersState} state - The current state of the filters.
 * @param {FiltersAction} action - The action to perform on the state.
 * @returns {FiltersState} - The new state of the filters.
 */
export const filtersReducer = (state: CatalogFiltersState, action: FiltersAction): CatalogFiltersState => {
    switch (action.type) {
        case 'SET_RATING':
            return { ...state, rating: action.payload ?? 'all' };
        case 'SET_TOTAL_PAGES':
            return { ...state, totalPages: action.payload ? Number(action.payload) : null };
        case 'SET_PAGE':
            return { ...state, page: typeof action.payload === 'number' ? action.payload : 1 };
        case 'TOGGLE_VIDEO_DURATION':
            return {
                ...state,
                videoDuration: state.videoDuration.includes(action.payload as string)
                    ? state.videoDuration.filter((d) => d !== action.payload)
                    : [...state.videoDuration, action.payload as string],
            };
        case 'TOGGLE_CATEGORY':
            return {
                ...state,
                categories: state.categories.includes(action.payload as string)
                    ? state.categories.filter((c) => c !== action.payload)
                    : [...state.categories, action.payload as string],
            };
        case 'TOGGLE_LEVEL':
            return {
                ...state,
                level: state.level.includes(action.payload as string)
                    ? state.level.filter((l) => l !== action.payload)
                    : [...state.level, action.payload as string],
            };
        case 'SET_SORT_BY':
            return {
                ...state,
                sortBy: action.payload as string,
            };
        case 'RESET':
            return initialFiltersState;
        default:
            return state;
    }
};
