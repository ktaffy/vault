import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { FeedSnippet } from '../../types/feed';

const getFeedService = () => import('../../services/api/feed').then(m => m.feedService);

interface FeedState {
    snippets: FeedSnippet[];
    currentIndex: number;
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    isRefreshing: boolean;
}

const initialState: FeedState = {
    snippets: [],
    currentIndex: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    isRefreshing: false,
};

export const fetchNextSnippet = createAsyncThunk(
    'feed/fetchNextSnippet',
    async (_, { rejectWithValue }) => {
        try {
            const feedService = await getFeedService();
            const response = await feedService.getNextSnippet();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch snippet');
        }
    }
);

export const preloadSnippets = createAsyncThunk(
    'feed/preloadSnippets',
    async (count: number, { rejectWithValue }) => {
        try {
            const feedService = await getFeedService();
            const snippets: FeedSnippet[] = [];
            for (let i = 0; i < count; i++) {
                const response = await feedService.getNextSnippet();
                if (response.snippet) {
                    snippets.push(response.snippet);
                } else {
                    break;
                }
            }
            return snippets;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to preload snippets');
        }
    }
);

const feedSlice = createSlice({
    name: 'feed',
    initialState,
    reducers: {
        setCurrentIndex: (state, action: PayloadAction<number>) => {
            state.currentIndex = action.payload;
        },
        moveToNextSnippet: (state) => {
            if (state.currentIndex < state.snippets.length - 1) {
                state.currentIndex += 1;
            }
        },
        clearFeed: (state) => {
            state.snippets = [];
            state.currentIndex = 0;
            state.error = null;
            state.hasMore = true;
        },
        removeCurrentSnippet: (state) => {
            state.snippets.splice(state.currentIndex, 1);
            if (state.currentIndex >= state.snippets.length && state.snippets.length > 0) {
                state.currentIndex = state.snippets.length - 1;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNextSnippet.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNextSnippet.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.snippet) {
                    state.snippets.push(action.payload.snippet);
                } else {
                    state.hasMore = false;
                }
            })
            .addCase(fetchNextSnippet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(preloadSnippets.pending, (state) => {
                state.isRefreshing = true;
                state.error = null;
            })
            .addCase(preloadSnippets.fulfilled, (state, action) => {
                state.isRefreshing = false;
                state.snippets = [...state.snippets, ...action.payload];
                if (action.payload.length === 0) {
                    state.hasMore = false;
                }
            })
            .addCase(preloadSnippets.rejected, (state, action) => {
                state.isRefreshing = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setCurrentIndex,
    moveToNextSnippet,
    clearFeed,
    removeCurrentSnippet
} = feedSlice.actions;

export const selectSnippets = (state: RootState) => state.feed.snippets;
export const selectCurrentIndex = (state: RootState) => state.feed.currentIndex;
export const selectCurrentSnippet = (state: RootState) =>
    state.feed.snippets[state.feed.currentIndex] || null;
export const selectIsLoading = (state: RootState) => state.feed.isLoading;
export const selectError = (state: RootState) => state.feed.error;
export const selectHasMore = (state: RootState) => state.feed.hasMore;
export const selectIsRefreshing = (state: RootState) => state.feed.isRefreshing;

export default feedSlice.reducer;