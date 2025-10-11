import { apiClient } from './client';

export interface FeedSnippet {
    snippet_id: number;
    title: string;
    artist_id: number;
    artist_name: string;
    audio_url: string;
    cover_art_url?: string | null;
    duration_seconds: number;
    play_count: number;
    fire_count: number;
    fire_rate?: number;
    uploaded_at?: string;
}

export interface FeedResponse {
    snippet: FeedSnippet;
    message?: string;
}

export const feedService = {
    getNextSnippet: async (): Promise<FeedResponse | null> => {
        return apiClient.get<FeedResponse | null>('/feed/next', true);
    },
};