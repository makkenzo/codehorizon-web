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
    wishlistId: string | null;
    profileId: string | null;
    accountSettings: AccountSettings | null;
};

export type UserProfile = {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    profile: Omit<Profile, 'id' | 'userId'>;
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
