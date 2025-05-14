import { Achievement } from '@/types';

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

    async getPublicUserAchievements(username: string): Promise<Achievement[] | null> {
        try {
            const response = await this.get<Achievement[]>(`/users/${username}/achievements/public`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching public achievements for ${username}:`, error);
            return null;
        }
    }
}

export const achievementsApiClient = new AchievementsApiClient();
