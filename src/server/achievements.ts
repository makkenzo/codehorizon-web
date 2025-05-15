import { PagedResponse } from '@/types';
import { Achievement, GlobalAchievementDTO } from '@/types/achievements';

import ApiClient from './api-client';

class AchievementsApiClient extends ApiClient {
    async getMyAchievements(): Promise<Achievement[] | null> {
        try {
            const response = await this.get<Achievement[]>('/users/me/achievements');
            return response.data;
        } catch (error) {
            console.error('Error fetching my achievements:', error);
            return null;
        }
    }

    async getPublicUserAchievements(username: string): Promise<GlobalAchievementDTO[] | null> {
        try {
            const response = await this.get<GlobalAchievementDTO[]>(`/users/${username}/achievements/public`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching public achievements for ${username}:`, error);
            return null;
        }
    }

    async getAllAchievementDefinitions(
        params: {
            page?: number;
            size?: number;
            sortBy?: string;
            status?: 'all' | 'earned' | 'unearned';
            category?: string;
            q?: string;
        } = {}
    ): Promise<PagedResponse<GlobalAchievementDTO> | null> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.size) queryParams.append('size', params.size.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        if (params.category && params.category !== 'all') queryParams.append('category', params.category);
        if (params.q && params.q.trim().length >= 2) queryParams.append('q', params.q.trim());

        try {
            const response = await this.get<PagedResponse<GlobalAchievementDTO>>(
                `/achievements/all?${queryParams.toString()}`
            );
            if (response.data) {
                if (params.page) queryParams.set('page', params.page.toString());

                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching all achievement definitions:', error);
            throw error;
        }
    }

    async getAchievementCategories(): Promise<string[] | null> {
        try {
            const response = await this.get<string[]>('/achievements/categories');
            return response.data ?? [];
        } catch (error) {
            console.error('Error fetching achievement categories:', error);
            return null;
        }
    }
}

export const achievementsApiClient = new AchievementsApiClient();
