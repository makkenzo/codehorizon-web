import { Profile } from '@/types';

import ApiClient from './api-client';

class ProfileApiClient extends ApiClient {
    async getProfile() {
        const response = await this.get<Profile>('/profiles/')
            .then((response) => response.data)
            .catch((error) => {
                console.log('Ошибка получения профиля', error.response?.status);
            });

        return response;
    }
}

export default ProfileApiClient;

