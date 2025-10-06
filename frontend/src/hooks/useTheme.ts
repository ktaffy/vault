import { useTheme as useThemeContext } from '../context/ThemeContext';
import { useDispatch } from 'react-redux';
import { toggleTheme } from '../store/slices/themeSlice';

export const useTheme = () => {
    const { theme } = useThemeContext();
    const dispatch = useDispatch();

    const toggle = () => {
        dispatch(toggleTheme());
    };

    return {
        theme,
        toggleTheme: toggle,
        isDark: theme.isDark,
    };
};