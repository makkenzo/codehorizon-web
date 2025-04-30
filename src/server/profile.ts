import { Profile, UserProfile } from '@/models';

import ApiClient from './api-client';

class ProfileApiClient extends ApiClient {
    async getProfile() {
        try {
            const response = await this.get<Profile>('/profiles/')
                .then((response) => response.data)
                .catch((e) => console.error(e));

            return response;
        } catch (_) {}
    }

    async updateProfile(profile: Omit<Profile, 'id' | 'userId' | 'avatarColor'>) {
        try {
            const response = await this.put<Profile>('/profiles/', profile)
                .then((response) => response.data)
                .catch((e) => console.error(e));
            return response;
        } catch (_) {}
    }

    async getUserProfile(username: string): Promise<UserProfile | undefined> {
        try {
            const response = await this.get<UserProfile>(`/users/${username}/profile`)
                .then((response) => response.data)
                .catch((e) => {
                    console.error(`Ошибка загрузки профиля ${username}:`, e?.response?.status || e);
                    return undefined;
                });

            return response;
        } catch (_) {
            return undefined;
        }
    }
}

export default ProfileApiClient;
