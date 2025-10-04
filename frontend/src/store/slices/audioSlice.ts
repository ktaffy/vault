// src/store/slices/audioSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface AudioState {
    currentSnippetId: number | null;
    isPlaying: boolean;
    progress: number; // 0-1
    duration: number; // seconds
    queue: number[]; // snippet IDs for preloading
    isBuffering: boolean;
}

const initialState: AudioState = {
    currentSnippetId: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    queue: [],
    isBuffering: false,
};

const audioSlice = createSlice({
    name: 'audio',
    initialState,
    reducers: {
        setCurrentSnippet: (state, action: PayloadAction<number | null>) => {
            state.currentSnippetId = action.payload;
        },
        setPlaying: (state, action: PayloadAction<boolean>) => {
            state.isPlaying = action.payload;
        },
        setProgress: (state, action: PayloadAction<number>) => {
            state.progress = action.payload;
        },
        setDuration: (state, action: PayloadAction<number>) => {
            state.duration = action.payload;
        },
        setBuffering: (state, action: PayloadAction<boolean>) => {
            state.isBuffering = action.payload;
        },
        setQueue: (state, action: PayloadAction<number[]>) => {
            state.queue = action.payload;
        },
        addToQueue: (state, action: PayloadAction<number>) => {
            if (!state.queue.includes(action.payload)) {
                state.queue.push(action.payload);
            }
        },
        removeFromQueue: (state, action: PayloadAction<number>) => {
            state.queue = state.queue.filter(id => id !== action.payload);
        },
        clearAudio: (state) => {
            state.currentSnippetId = null;
            state.isPlaying = false;
            state.progress = 0;
            state.duration = 0;
            state.queue = [];
        },
    },
});

export const {
    setCurrentSnippet,
    setPlaying,
    setProgress,
    setDuration,
    setBuffering,
    setQueue,
    addToQueue,
    removeFromQueue,
    clearAudio,
} = audioSlice.actions;

// Selectors
export const selectCurrentSnippetId = (state: RootState) => state.audio.currentSnippetId;
export const selectIsPlaying = (state: RootState) => state.audio.isPlaying;
export const selectProgress = (state: RootState) => state.audio.progress;
export const selectDuration = (state: RootState) => state.audio.duration;
export const selectQueue = (state: RootState) => state.audio.queue;
export const selectIsBuffering = (state: RootState) => state.audio.isBuffering;

export default audioSlice.reducer;