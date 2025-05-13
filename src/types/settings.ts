export enum ProfileVisibility {
    PUBLIC = 'PUBLIC',
    REGISTERED_USERS = 'REGISTERED_USERS',
    PRIVATE = 'PRIVATE',
}

export interface PrivacySettings {
    profileVisibility: ProfileVisibility;
    showEmailOnProfile: boolean;
    showCoursesInProgressOnProfile: boolean;
    showCompletedCoursesOnProfile: boolean;
    showActivityFeedOnProfile: boolean;
    allowDirectMessages: boolean;
}

export interface UpdatePrivacySettingsRequest {
    profileVisibility?: ProfileVisibility;
    showEmailOnProfile?: boolean;
    showCoursesInProgressOnProfile?: boolean;
    showCompletedCoursesOnProfile?: boolean;
    showActivityFeedOnProfile?: boolean;
    allowDirectMessages?: boolean;
}

export interface NotificationPreferences {
    emailGlobalOnOff: boolean;
    emailMentorshipStatusChange: boolean;
    emailCoursePurchaseConfirmation: boolean;
    emailCourseCompletion: boolean;
    emailNewReviewOnMyCourse: boolean;
    emailStudentCompletedMyCourse: boolean;
    emailMarketingNewCourses: boolean;
    emailMarketingUpdates: boolean;
    emailProgressReminders: boolean;
    emailSecurityAlerts: boolean;
}

export interface UpdateNotificationPreferencesRequest {
    emailGlobalOnOff?: boolean;
    emailMentorshipStatusChange?: boolean;
    emailCoursePurchaseConfirmation?: boolean;
    emailCourseCompletion?: boolean;
    emailNewReviewOnMyCourse?: boolean;
    emailStudentCompletedMyCourse?: boolean;
    emailMarketingNewCourses?: boolean;
    emailMarketingUpdates?: boolean;
    emailProgressReminders?: boolean;
    emailSecurityAlerts?: boolean;
}
