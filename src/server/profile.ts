import { Profile } from '@/models';

import ApiClient from './api-client';

class ProfileApiClient extends ApiClient {
    async getProfile() {
        try {
            const response = await this.get<Profile>('/profiles/').then((response) => response.data);

            return response;
        } catch (error) {}
    }
}

export default ProfileApiClient;

