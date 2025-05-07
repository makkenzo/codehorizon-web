export enum ApplicationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface MentorshipApplicationRequest {
    reason?: string;
}

export interface MentorshipApplication {
    id: string;
    userId: string;
    username: string;
    userEmail: string;
    status: ApplicationStatus;
    reason?: string;
    rejectionReason?: string;
    appliedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}
