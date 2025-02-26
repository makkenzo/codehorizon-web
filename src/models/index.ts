export type User = {
    id: string;
    isVerified: boolean;
    username: string;
    email: string;
    passwordHash: string;
    refreshToken: string | null;
    roles: string[];
    courses: CourseProgress[];
    createdCourseIds: string[];
    cartId: string | null;
    wishlistId: string | null;
    profileId: string | null;
    accountSettings: AccountSettings | null;
};

export type Profile = {
    id: string;
    avatarUrl: string | null;
    userId: string;
    bio: string | null;
    firstName: string | null;
    lastName: string | null;
    location: string | null;
    website: string | null;
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

