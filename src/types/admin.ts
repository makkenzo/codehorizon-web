import { CourseDifficultyLevels } from '.';

export interface PagedResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    isLast: boolean;
}

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    roles: string[];
}

export interface AdminUpdateUserRequest {
    roles?: string[];
    isVerified?: boolean;
}

export interface AdminCourseListItemDTO {
    id: string;
    title: string;
    slug: string;
    authorUsername: string;
    authorId?: string;
    price: number;
    discount: number;
    difficulty: CourseDifficultyLevels;
    category: string | null;
    lessonCount: number;
    description?: string;
    imagePreview?: string | null;
    videoPreview?: string | null;
}

export interface AdminCreateUpdateCourseRequestDTO {
    title: string;
    description?: string | null;
    price: number;
    discount?: number;
    difficulty: CourseDifficultyLevels;
    category?: string | null;
    authorId: string;
    imagePreview?: string | null;
    videoPreview?: string | null;
}

export interface AdminCourseDetailDTO {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imagePreview: string | null;
    videoPreview: string | null;
    authorId: string;
    authorUsername: string;
    price: number;
    discount: number;
    difficulty: CourseDifficultyLevels;
    category: string | null;
    videoLength: number | null;
    lessons: AdminLessonDTO[];
}

export interface AdminLessonDTO {
    id: string;
    title: string;
    slug?: string | null;
    content?: string | null;
}
