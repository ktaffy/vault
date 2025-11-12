import { apiClient } from './client';
import type { NextSnippetResponse } from '../../types/snippet';
import { adaptFeedItem } from './adapters';

/**
 * Backend response structure
 */
interface BackendNextSnippetResponse {
    snippet: {
        id: number;
        snippet_id: number;
        artist_id: number;
        artist_name: string;
        artist_profile_pic: string | null;
        title: string;
        audio_url: string;
        cover_art_url: string | null;
        duration_seconds: number;
        play_count: number;
        fire_count: number;
        fire_rate: number;
        uploaded_at: string;
    } | null;
    message?: string;
}

export const feedService = {
    getNextSnippet: async (): Promise<NextSnippetResponse> => {
        const response = await apiClient.get<BackendNextSnippetResponse>('/feed/next', true);

        // Adapt the backend response to frontend format
        return {
            snippet: response.snippet ? adaptFeedItem(response.snippet) : null,
            message: response.message,
        };
    },
};