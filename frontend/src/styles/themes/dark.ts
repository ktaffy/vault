import { colors } from './colors';

export const darkTheme = {
    colors: {
        primary: colors.primary,
        accent: colors.accent,
        background: colors.dark.background,
        surface: colors.dark.surface,
        text: colors.dark.text,
        textSecondary: colors.dark.textSecondary,
        border: colors.dark.border,
        error: colors.dark.error,
        success: colors.dark.success,
    },
    isDark: true,
};

export type Theme = typeof darkTheme;