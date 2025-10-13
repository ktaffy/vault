import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './useTheme';
import { useRouter } from 'expo-router';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook that consolidates common screen setup
 * Returns all the commonly used hooks in one place
 * 
 * Usage:
 * const { insets, theme, router, showToast } = useScreenSetup();
 */
export const useScreenSetup = () => {
    const insets = useSafeAreaInsets();
    const { theme, toggleTheme, isDark } = useTheme();
    const router = useRouter();
    const { showToast } = useToast();

    return {
        insets,
        theme,
        toggleTheme,
        isDark,
        router,
        showToast,
    };
};