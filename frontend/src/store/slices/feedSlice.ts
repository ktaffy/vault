// src/store/slices/feedSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface Snippet {
    id: number;
    title: string;
    artistId: number;
    artistName: string;
    audioUrl: string;
    durationSeconds: number;
    playCount: number;
    fireCount: number;
    fireRate?: number;
    uploadedAt?: string;
}

interface FeedState {
    snippets: Snippet[];
    currentIndex: number;
    hasMore: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: FeedState = {
    snippets: [],
    currentIndex: 0,
    hasMore: true,
    isLoading: false,
    error: null,
};

const feedSlice = createSlice({
    name: 'feed',
    initialState,
    reducers: {
        setSnippets: (state, action: PayloadAction<Snippet[]>) => {
            state.snippets = action.payload;
        },
        addSnippet: (state, action: PayloadAction<Snippet>) => {
            state.snippets.push(action.payload);
        },
        removeSnippet: (state, action: PayloadAction<number>) => {
            state.snippets = state.snippets.filter(s => s.id !== action.payload);
        },
        setCurrentIndex: (state, action: PayloadAction<number>) => {
            state.currentIndex = action.payload;
        },
        setHasMore: (state, action: PayloadAction<boolean>) => {
            state.hasMore = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearFeed: (state) => {
            state.snippets = [];
            state.currentIndex = 0;
            state.hasMore = true;
            state.error = null;
        },
    },
});

export const {
    setSnippets,
    addSnippet,
    removeSnippet,
    setCurrentIndex,
    setHasMore,
    setLoading,
    setError,
    clearFeed,
} = feedSlice.actions;

// Selectors
export const selectSnippets = (state: RootState) => state.feed.snippets;
export const selectCurrentIndex = (state: RootState) => state.feed.currentIndex;
export const selectCurrentSnippet = (state: RootState) => state.feed.snippets[state.feed.currentIndex];
export const selectHasMore = (state: RootState) => state.feed.hasMore;
export const selectFeedLoading = (state: RootState) => state.feed.isLoading;
export const selectFeedError = (state: RootState) => state.feed.error;

export default feedSlice.reducer;