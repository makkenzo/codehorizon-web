export type FiltersActionType =
    | 'SET_RATING'
    | 'TOGGLE_VIDEO_DURATION'
    | 'TOGGLE_CATEGORY'
    | 'TOGGLE_LEVEL'
    | 'RESET';

export interface FiltersAction {
    type: FiltersActionType;
    payload?: string | number;
}

export interface FiltersState {
    rating: number | 'all';
    videoDuration: string[];
    categories: string[];
    level: string[];
}

export const initialFiltersState: FiltersState = {
    rating: 'all',
    videoDuration: [],
    categories: [],
    level: [],
};

/**
 * Reducer function for filters state.
 *
 * @param {FiltersState} state - The current state of the filters.
 * @param {FiltersAction} action - The action to perform on the state.
 * @returns {FiltersState} - The new state of the filters.
 */
export const filtersReducer = (
    state: FiltersState,
    action: FiltersAction
): FiltersState => {
    switch (action.type) {
        case 'SET_RATING':
            return { ...state, rating: action.payload as number };
        case 'TOGGLE_VIDEO_DURATION':
            return {
                ...state,
                videoDuration: state.videoDuration.includes(
                    action.payload as string
                )
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
        case 'RESET':
            return initialFiltersState;
        default:
            return state;
    }
};

