import { apiClient } from './client';
import {
    ArtistSnippet,
    UploadSnippetResponse,
    UpdateSnippetRequest
} from '../../types/snippet';

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
    upload: async (formData: FormData): Promise<UploadSnippetResponse> => {
        return apiClient.post<UploadSnippetResponse>('/snippet/upload', formData, true);
    },

    getById: async (id: number): Promise<ArtistSnippet> => {
        return apiClient.get<ArtistSnippet>(`/snippet/${id}`);
    },

    getArtistSnippet: async (): Promise<ArtistSnippet> => {
        return apiClient.get<ArtistSnippet>('/snippet/artist', true);
    },

    getAllArtistSnippets: async (): Promise<{ snippets: ArtistSnippet[] }> => {
        return apiClient.get<{ snippets: ArtistSnippet[] }>('/snippets/artist', true);
    },

    update: async (data: UpdateSnippetRequest): Promise<{ message: string; snippet: ArtistSnippet }> => {
        return apiClient.put<{ message: string; snippet: ArtistSnippet }>('/snippet/update', data, true);
    },

    delete: async (snippetId: number): Promise<{ message: string }> => {
        return apiClient.delete<{ message: string }>('/snippet/delete', { snippet_id: snippetId }, true);
    },

    getArtistStats: async (): Promise<ArtistStats> => {
        return apiClient.get<ArtistStats>('/artist/stats', true);
    },

    getPublicArtistSnippets: async (artistId: number): Promise<{ snippets: ArtistSnippet[] }> => {
        return apiClient.get<{ snippets: ArtistSnippet[] }>(`/artist/${artistId}/snippets`);
    },
};