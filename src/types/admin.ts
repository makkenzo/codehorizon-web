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
