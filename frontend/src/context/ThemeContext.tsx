import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { darkTheme, lightTheme, Theme } from '../styles/themes';
import { selectIsDark } from '../store/slices/themeSlice';

interface ThemeContextType {
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const isDark = useSelector(selectIsDark);
    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};