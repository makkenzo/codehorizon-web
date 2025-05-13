import {
    NotificationPreferences,
    PrivacySettings,
    UpdateNotificationPreferencesRequest,
    UpdatePrivacySettingsRequest,
} from '@/types/settings';

import ApiClient from './api-client';

class SettingsApiClient extends ApiClient {
    async getPrivacySettings(): Promise<PrivacySettings | null> {
        try {
            const response = await this.get<PrivacySettings>('/me/settings/privacy');
            return response.data;
        } catch (error) {
            console.error('Error fetching privacy settings:', error);
            return null;
        }
    }

    async updatePrivacySettings(data: UpdatePrivacySettingsRequest): Promise<PrivacySettings | null> {
        try {
            const response = await this.put<PrivacySettings, UpdatePrivacySettingsRequest>(
                '/me/settings/privacy',
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            throw error;
        }
    }

    async getNotificationPreferences(): Promise<NotificationPreferences | null> {
        try {
            const response = await this.get<NotificationPreferences>('/me/settings/notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            return null;
        }
    }

    async updateNotificationPreferences(
        data: UpdateNotificationPreferencesRequest
    ): Promise<NotificationPreferences | null> {
        try {
            const response = await this.put<NotificationPreferences, UpdateNotificationPreferencesRequest>(
                '/me/settings/notifications',
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }
}

export const settingsApiClient = new SettingsApiClient();
