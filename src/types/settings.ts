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
