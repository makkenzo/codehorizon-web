export type BaseMetadata = {
    title: string;
    description: string;
    keywords?: string;
};

export interface NavItem {
    id: string;
    href?: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    variant?: 'ghost' | 'default';
    className?: string;
    subItems?: NavItem[];
}

export interface HorizontalTabNavItem {
    label: string;
    href: string;
    disabled: boolean;
}

export enum CourseDifficultyLevels {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    imagePreview?: string;
    videoPreview?: string;
    authorId: string;
    authorName: string;
    authorUsername: string;
    lessons: Lesson[];
    rating: number;
    price: number;
    discount: number;
    difficulty: CourseDifficultyLevels;
    videoLength?: number;
}

export interface Lesson {
    id: string;
    title: string;
    slug: string;
    content: string;
    codeExamples?: string[];
    tasks?: Task[];
    attachments?: Attachment[];
    mainAttachment?: string;
}

export interface Attachment {
    name: string;
    url: string;
}

export interface Task {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface Review {
    id: string;
    text?: string;
    rating: number;
    authorId: string;
    courseId: string;
}

export type FiltersData = {
    ratingCounts: {
        key: string;
        label?: string;
        count: number;
    }[];
    videoDurationCounts: {
        key: string;
        label: string;
        count: number;
    }[];
    categoriesCounts: {
        key: string;
        label: string;
        count: number;
    }[];
    levelCounts: {
        key: string;
        label: string;
        count: number;
    }[];
};

export type PagedResponse<T> = {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
};

export type CourseProgress = {
    course: Omit<Course, 'lessons'>;
    progress: number;
};
