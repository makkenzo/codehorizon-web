import { isAxiosError } from 'axios';

import { PagedResponse } from '@/types';
import { CreateReviewRequestDTO, ReviewDTO, UpdateReviewRequestDTO } from '@/types/review';

import ApiClient from './api-client';

class ReviewsApiClient extends ApiClient {
    async getReviews(courseId: string, page: number = 1, size: number = 10): Promise<PagedResponse<ReviewDTO> | null> {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        try {
            const response = await this.get<PagedResponse<ReviewDTO>>(
                `/courses/${courseId}/reviews?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error(`Ошибка получения отзывов для курса ${courseId}:`, error);
            return null;
        }
    }

    async createReview(courseId: string, data: CreateReviewRequestDTO): Promise<ReviewDTO | null> {
        try {
            const response = await this.post<ReviewDTO, CreateReviewRequestDTO>(`/courses/${courseId}/reviews`, data);
            return response.data;
        } catch (error) {
            console.error(`Ошибка создания отзыва для курса ${courseId}:`, error);
            throw error;
        }
    }

    async updateReview(courseId: string, reviewId: string, data: UpdateReviewRequestDTO): Promise<ReviewDTO | null> {
        try {
            const response = await this.put<ReviewDTO, UpdateReviewRequestDTO>(
                `/courses/${courseId}/reviews/${reviewId}`,
                data
            );
            return response.data;
        } catch (error) {
            console.error(`Ошибка обновления отзыва ${reviewId}:`, error);
            throw error;
        }
    }

    async deleteReview(courseId: string, reviewId: string): Promise<void> {
        try {
            await this.delete(`/courses/${courseId}/reviews/${reviewId}`);
        } catch (error) {
            console.error(`Ошибка удаления отзыва ${reviewId}:`, error);
            throw error;
        }
    }

    async getMyReview(courseId: string): Promise<ReviewDTO | null> {
        try {
            const response = await this.get<ReviewDTO>(`/courses/${courseId}/reviews/me`);
            return response.data;
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            console.error(`Ошибка получения моего отзыва для курса ${courseId}:`, error);
            return null;
        }
    }
}

export default ReviewsApiClient;
