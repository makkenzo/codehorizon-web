export interface CreateReviewRequestDTO {
    rating: number;
    text?: string;
}

export interface UpdateReviewRequestDTO {
    rating: number;
    text?: string;
}

export interface ReviewAuthorDTO {
    username: string;
    avatarUrl?: string;
    avatarColor?: string;
}

export interface ReviewDTO {
    id: string;
    rating: number;
    text?: string;
    author: ReviewAuthorDTO;
    createdAt: string;
    updatedAt: string;
}

export interface RatingDistributionDTO {
    rating: number;
    count: number;
    percentage: number;
}
