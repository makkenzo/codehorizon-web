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

export interface AdminTaskDTO {
    // Пример типа для Task
    id: string;
    description: string;
    // ... другие поля Task
}

export interface AdminAttachmentDTO {
    // Пример типа для Attachment
    name: string;
    url: string;
}

export interface AdminLessonDTO {
    id: string;
    title: string;
    slug?: string | null;
    content?: string | null;
    codeExamples?: string[];
    tasks?: AdminTaskDTO[];
    attachments?: AdminAttachmentDTO[];
    mainAttachment?: string | null;
}

export interface AdminCourseListItemDTO {
    id: string;
    title: string;
    slug: string;
    authorId: string;
    authorUsername: string;
    price: number;
    discount: number;
    difficulty: CourseDifficultyLevels;
    category: string | null;
    lessonCount: number;
    description?: string;
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

export interface AdminCreateUpdateLessonRequestDTO {
    title: string;
    content?: string | null;
    codeExamples?: string[];
    tasks?: AdminTaskDTO[];
    attachments?: AdminAttachmentDTO[];
    mainAttachment?: string | null;
}

export interface AdminDashboardStatsDTO {
    totalUsers: number;
    newUsersToday: number;
    totalCourses: number;
    totalRevenue: number;
    activeSessions: number;
}

export interface TimeSeriesDataPointDTO {
    date: string;
    value: number;
}

export interface CategoryDistributionDTO {
    category: string;
    courseCount: number;
    fill: string;
}

export interface CoursePopularityDTO {
    courseTitle: string;
    studentCount: number;
}

export interface AdminChartDataDTO {
    userRegistrations: TimeSeriesDataPointDTO[];
    revenueData: TimeSeriesDataPointDTO[];
    categoryDistribution: CategoryDistributionDTO[];
    topCoursesByStudents: CoursePopularityDTO[];
}
