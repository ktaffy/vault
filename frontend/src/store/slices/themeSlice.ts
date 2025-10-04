import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface ThemeState {
    isDark: boolean;
}

const initialState: ThemeState = {
    isDark: true, // Default to dark mode
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.isDark = !state.isDark;
        },
        setTheme: (state, action: { payload: boolean }) => {
            state.isDark = action.payload;
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectIsDark = (state: RootState) => state.theme.isDark;
export default themeSlice.reducer;