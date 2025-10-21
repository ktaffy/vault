import { apiClient } from './client';
import type { FeedSnippet, NextSnippetResponse } from '../../types/feed';

export const feedService = {
    getNextSnippet: async (): Promise<NextSnippetResponse> => {
        return apiClient.get<NextSnippetResponse>('/feed/next', true);
    },
};