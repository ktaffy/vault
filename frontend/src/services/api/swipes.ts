import { apiClient } from './client';
import type { Snippet } from './snippets';

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
    getLikedSnippets: async (): Promise<{ snippets: Snippet[] }> => {
        return apiClient.get<{ snippets: Snippet[] }>('/swipes/liked', true);
    },
};