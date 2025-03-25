import { Profile, UserProfile } from '@/models';

import ApiClient from './api-client';

class ProfileApiClient extends ApiClient {
    async getProfile() {
        try {
            const response = await this.get<Profile>('/profiles/')
                .then((response) => response.data)
                .catch((e) => console.error(e));

            return response;
        } catch (error) {}
    }

    async updateProfile(profile: Omit<Profile, 'id' | 'userId'>) {
        try {
            const response = await this.put<Profile>('/profiles/', profile)
                .then((response) => response.data)
                .catch((e) => console.error(e));
            return response;
        } catch (error) {}
    }

    async getUserProfile(username: string) {
        try {
            const response = await this.get<UserProfile>(`/users/${username}/profile`)
                .then((response) => response.data)
                .catch((e) => console.error(e));
            return response;
        } catch (error) {}
    }

    async getDominantColor(avatarUrl: string | null) {
        if (!avatarUrl) return;

        const response = await fetch(
            `http://marchenzo:3000/api/get-avatar-color?imageUrl=${encodeURIComponent(avatarUrl)}`
        ).then((res) => res.json());

        return response.color;
    }
}

export default ProfileApiClient;
