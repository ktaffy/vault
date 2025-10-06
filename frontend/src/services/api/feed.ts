import { apiClient } from './client';

export interface FeedSnippet {
    id: number;
    title: string;
    artist_id: number;
    artist_name: string;
    audio_url: string;
    duration_seconds: number;
    play_count: number;
    fire_count: number;
    fire_rate?: number;
    uploaded_at?: string;
}

export const feedService = {
    getNextSnippet: async (): Promise<FeedSnippet | null> => {
        return apiClient.get<FeedSnippet | null>('/feed/next', true);
    },
};