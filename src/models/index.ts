export type User = {
    id: string;
    isVerified: boolean;
    username: string;
    email: string;
    roles: string[];
    courses: CourseProgress[];
    createdCourseIds: string[];
    wishlistId: string | null;
    accountSettings: AccountSettings | null;
    xp: number;
    level: number;
    xpForNextLevel: number;
    dailyStreak: number;
    permissions?: string[];
};

export type Profile = {
    id: string;
    avatarUrl: string | null;
    avatarColor: string | null;
    userId: string;
    bio: string | null;
    firstName: string | null;
    lastName: string | null;
    location: string | null;
    website: string | null;
    signatureUrl: string | null;
};

export type CourseProgress = {
    courseId: string;
    progress: number;
};

export type AccountSettings = {
    timeZone: string;
    dateFormat: string;
    notificationPreferences: {
        emailNotifications: boolean;
    };
    privacySettings: {
        profileVisibility: string; // TODO: Replace with enum
        showEmail: boolean;
        showLastSeen: boolean;
    };
    securitySettings: {
        twoFactorEnabled: boolean;
        loginAlerts: boolean;
    };
};

export interface PublicCourseInfo {
    id: string;
    title: string;
    slug: string;
    imagePreview?: string | null;
    progress?: number | null;
}

export type UserProfile = {
    id: string;
    username: string;
    profile: Omit<Profile, 'id' | 'userId'>;
    coursesInProgress?: PublicCourseInfo[] | null;
    completedCoursesCount: number;
    createdCourses?: PublicCourseInfo[] | null;
    level: number;
};
