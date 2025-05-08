import { isCancel } from 'axios';

import { GlobalSearchResponseDTO } from '@/types/search';

import ApiClient from './api-client';

class SearchApiClient extends ApiClient {
    async search(query: string, signal?: AbortSignal): Promise<GlobalSearchResponseDTO | null> {
        if (!query || query.trim().length < 2) {
            return { results: [] };
        }
        try {
            const response = await this.get<GlobalSearchResponseDTO>(`/search?q=${encodeURIComponent(query)}`, {
                signal,
            });
            return response.data;
        } catch (error) {
            if (isCancel(error)) {
                console.log('Search request cancelled:', query);
                return null;
            }
            console.error('Search API error:', error);
            return null;
        }
    }
}
export const searchApiClient = new SearchApiClient();
