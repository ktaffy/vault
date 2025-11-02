import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import feedReducer from './slices/feedSlice';

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        auth: authReducer,
        feed: feedReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;