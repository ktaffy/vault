import { apiClient } from './client';

export interface UploadSnippetResponse {
    id: number;
    title: string;
    audio_url: string;
    message: string;
}

export interface Snippet {
    id: number;
    title: string;
    artist_id: number;
    audio_url: string;
    duration_seconds: number;
    play_count: number;
    fire_count: number;
    skip_count: number;
    fire_rate: number;
    is_active: boolean;
    uploaded_at: string;
}

export interface UpdateSnippetRequest {
    title?: string;
}

export interface ArtistStats {
    snippet: {
        id: number;
        title: string;
        play_count: number;
        fire_count: number;
        skip_count: number;
        fire_rate: number;
        is_active: boolean;
        uploaded_at: string;
    };
    new_followers_today: number;
    total_followers: number;
}

export const snippetService = {
    upload: async (title: string, audioFile: File | Blob): Promise<UploadSnippetResponse> => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('audio', audioFile);

        return apiClient.post<UploadSnippetResponse>('/snippet/upload', formData, true);
    },

    getById: async (id: number): Promise<Snippet> => {
        return apiClient.get<Snippet>(`/snippet/${id}`);
    },

    getArtistSnippet: async (): Promise<Snippet> => {
        return apiClient.get<Snippet>('/snippet/artist', true);
    },

    update: async (data: UpdateSnippetRequest): Promise<{ message: string; snippet: Snippet }> => {
        return apiClient.put<{ message: string; snippet: Snippet }>('/snippet/update', data, true);
    },

    delete: async (): Promise<{ message: string }> => {
        return apiClient.delete<{ message: string }>('/snippet/delete', true);
    },

    getArtistStats: async (): Promise<ArtistStats> => {
        return apiClient.get<ArtistStats>('/artist/stats', true);
    },
};