import { apiClient } from './client';

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
};