import { Course } from '@/types';

type CourseDisplayData = { course: Omit<Course, 'lessons'>; progress?: number };

export type MyCoursesState = {
    isLoading: boolean;
    error: string | null;
    courses: CourseDisplayData[];
    title: string;
    description: string;
};

export type MyCoursesAction =
    | { type: 'START_LOADING' }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SET_COURSES'; payload: CourseDisplayData[] }
    | { type: 'SET_META'; payload: { title: string; description: string } };

export const initialMyCoursesState: MyCoursesState = {
    isLoading: true,
    error: null,
    courses: [],
    title: 'Мои курсы',
    description: 'Список ваших курсов',
};

export function myCoursesReducer(state: MyCoursesState, action: MyCoursesAction): MyCoursesState {
    switch (action.type) {
        case 'START_LOADING':
            return { ...state, isLoading: true, error: null, courses: [] };
        case 'SET_ERROR':
            return { ...state, isLoading: false, error: action.payload, courses: [] };
        case 'SET_COURSES':
            return { ...state, isLoading: false, error: null, courses: action.payload };
        case 'SET_META':
            return { ...state, ...action.payload };
        default:
            return state;
    }
}

export const tabMeta = {
    wishlist: {
        title: 'Желаемое',
        description: 'Список ваших курсов с уроками, которые вы хотите пройти',
    },
    completed: {
        title: 'Пройденные курсы',
        description: 'Курсы, которые вы успешно завершили',
    },
    default: {
        title: 'Мои курсы',
        description: 'Список ваших курсов',
    },
} as const;
