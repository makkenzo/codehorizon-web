import { CourseDifficultyLevels } from '.';
import { TaskType } from './task';

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    roles: string[];
    imageUrl: string | null;
    createdAt: string;
    lastLoginDate: string | null;
}

export interface AdminUpdateUserRequest {
    roles?: string[];
    isVerified?: boolean;
}

export interface AdminAttachmentDTO {
    name: string;
    url: string;
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
    isFree: boolean;
    difficulty: CourseDifficultyLevels;
    category: string | null;
    videoLength: number | null;
    lessons: AdminLessonDTO[];
    featuresBadge?: string | null;
    featuresTitle?: string | null;
    featuresSubtitle?: string | null;
    featuresDescription?: string | null;
    features?: AdminFeatureItemDTO[] | null;
    benefitTitle?: string | null;
    benefitDescription?: string | null;
    testimonial?: AdminTestimonialDTO | null;
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
    featuresBadge?: string | null;
    featuresTitle?: string | null;
    featuresSubtitle?: string | null;
    featuresDescription?: string | null;
    features: AdminFeatureItemDTO[] | null;
    benefitTitle?: string | null;
    benefitDescription?: string | null;
    testimonial?: AdminTestimonialDTO | null;
}

export interface AdminFeatureItemDTO {
    title: string;
    description: string;
}

export interface AdminTestimonialDTO {
    quote: string;
    authorName: string;
    authorTitle: string;
    avatarSrc?: string | null;
}

export interface AdminDashboardStatsDTO {
    totalUsers: number;
    newUsersToday: number;
    totalCourses: number;
    totalRevenue: number;
    completedCoursesCount: number;
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

export interface StudentProgressDTO {
    userId: string;
    username: string;
    email: string;
    progressPercent: number;
    completedLessonsCount: number;
    totalLessonsCount: number;
    lastAccessedLessonAt?: string;
}

export interface AuthorCourseAnalytics {
    courseId: string;
    courseTitle: string;
    totalEnrolledStudents: number;
    activeStudentsLast30Days: number;
    averageCompletionRate: number;
    averageRating: number;
    totalReviews: number;
}

export interface AuthorCourseListItemAnalytics {
    courseId: string;
    courseTitle: string;
    slug: string;
    totalEnrolledStudents: number;
    averageCompletionRate: number;
    averageRating: number;
    imagePreview?: string | null;
}

export enum ProgrammingLanguage {
    PYTHON = 'PYTHON',
}

export interface AdminTestCaseDTO {
    id?: string;
    name: string;
    input: string[];
    expectedOutput: string[];
    isHidden: boolean;
    points: number;
}

export interface AdminTaskDTO {
    id?: string;
    description: string;
    solution?: string | null;
    taskType: TaskType;
    options?: string[] | null;

    language?: ProgrammingLanguage | null;
    boilerplateCode?: string | null;
    testCases: AdminTestCaseDTO[];

    timeoutSeconds?: number | null;
    memoryLimitMb?: number | null;
}

export interface AdminCreateUpdateLessonRequestDTO {
    title: string;
    content?: string | null;
    codeExamples?: string[];
    tasks?: AdminTaskDTO[];
    attachments?: AdminAttachmentDTO[];
    mainAttachment?: string | null;
    videoLength?: number | null;
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
    videoLength?: number | null;
}
