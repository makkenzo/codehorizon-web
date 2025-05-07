import { PagedResponse } from '@/types';
import { ApplicationStatus, MentorshipApplication, MentorshipApplicationRequest } from '@/types/mentorship';

import ApiClient from './api-client';

class MentorshipApiClient extends ApiClient {
    async applyForMentorship(data: MentorshipApplicationRequest): Promise<MentorshipApplication | null> {
        try {
            const response = await this.post<MentorshipApplication, MentorshipApplicationRequest>(
                '/mentorship/apply',
                data
            );
            return response.data;
        } catch (error) {
            console.error('Ошибка подачи заявки на менторство:', error);
            throw error;
        }
    }

    async getMyApplication(): Promise<MentorshipApplication | null> {
        try {
            const response = await this.get<MentorshipApplication>('/mentorship/application/my');
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            console.error('Ошибка получения статуса заявки:', error);
            throw error;
        }
    }

    async hasActiveApplication(): Promise<boolean> {
        try {
            const response = await this.get<{ hasActiveApplication: boolean }>('/mentorship/application/my/active');
            return response.data.hasActiveApplication;
        } catch (error) {
            console.error('Ошибка проверки активной заявки:', error);
            return false;
        }
    }

    async getAllApplications(
        status?: ApplicationStatus,
        page: number = 1,
        size: number = 10,
        sortBy: string = 'appliedAt,desc'
    ): Promise<PagedResponse<MentorshipApplication> | null> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sortBy: sortBy,
        });
        if (status) {
            params.append('status', status);
        }
        try {
            const response = await this.get<PagedResponse<MentorshipApplication>>(
                `/admin/mentorship/applications?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Ошибка получения списка заявок:', error);
            throw error;
        }
    }

    async approveApplication(applicationId: string): Promise<MentorshipApplication | null> {
        try {
            const response = await this.put<MentorshipApplication>(
                `/admin/mentorship/applications/${applicationId}/approve`
            );
            return response.data;
        } catch (error) {
            console.error(`Ошибка одобрения заявки ${applicationId}:`, error);
            throw error;
        }
    }

    async rejectApplication(applicationId: string, rejectionReason?: string): Promise<MentorshipApplication | null> {
        try {
            const response = await this.put<MentorshipApplication, { rejectionReason?: string }>(
                `/admin/mentorship/applications/${applicationId}/reject`,
                { rejectionReason }
            );
            return response.data;
        } catch (error) {
            console.error(`Ошибка отклонения заявки ${applicationId}:`, error);
            throw error;
        }
    }
}

export const mentorshipApiClient = new MentorshipApiClient();
