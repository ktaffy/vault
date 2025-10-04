import { colors } from './colors';
import { Theme } from './dark';

export const lightTheme: Theme = {
    colors: {
        primary: colors.primary,
        accent: colors.accentDark,
        background: colors.light.background,
        surface: colors.light.surface,
        text: colors.light.text,
        textSecondary: colors.light.textSecondary,
        border: colors.light.border,
        error: colors.light.error,
        success: colors.light.success,
    },
    isDark: false,
};