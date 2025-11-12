import { apiClient } from './client';
import type { ArtistSnippet } from '../../types';

export interface SwipeRequest {
    snippet_id: number;
    action: 'fire' | 'skip';
}

export interface SwipeResponse {
    success: boolean;
    followed_artist?: boolean;
}

export const swipeService = {
    recordSwipe: async (snippetId: number, action: 'fire' | 'skip'): Promise<SwipeResponse> => {
        const body: SwipeRequest = {
            snippet_id: snippetId,
            action: action,
        };

        return apiClient.post<SwipeResponse>('/swipe', body, true);
    },
    getLikedSnippets: async (): Promise<{ snippets: ArtistSnippet[] }> => {
        return apiClient.get<{ snippets: ArtistSnippet[] }>('/swipes/liked', true);
    },
};