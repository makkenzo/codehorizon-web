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
            console.log(response);

            return response;
        } catch (error) {}
    }
}

export default ProfileApiClient;
