import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    size = 'medium',
    loading = false,
    fullWidth = false,
    disabled,
    style,
    ...props
}) => {
    const { theme } = useTheme();

    const getButtonStyle = (): ViewStyle[] => {
        const baseStyle: ViewStyle[] = [styles.button];

        if (size === 'small') baseStyle.push(styles.small);
        if (size === 'medium') baseStyle.push(styles.medium);
        if (size === 'large') baseStyle.push(styles.large);

        if (variant === 'primary') {
            baseStyle.push({
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
            });
        } else if (variant === 'secondary') {
            baseStyle.push({
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
            });
        } else if (variant === 'outline') {
            baseStyle.push({
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderColor: theme.colors.primary,
            });
        } else if (variant === 'ghost') {
            baseStyle.push({
                backgroundColor: 'transparent',
            });
        }

        if (fullWidth) baseStyle.push(styles.fullWidth);

        if (disabled || loading) baseStyle.push(styles.disabled);

        return baseStyle;
    };

    const getTextStyle = (): TextStyle[] => {
        const baseStyle: TextStyle[] = [styles.text];

        if (size === 'small') baseStyle.push(styles.smallText);
        if (size === 'medium') baseStyle.push(styles.mediumText);
        if (size === 'large') baseStyle.push(styles.largeText);

        if (variant === 'primary') {
            baseStyle.push({ color: '#ffffff' });
        } else if (variant === 'secondary') {
            baseStyle.push({ color: theme.colors.text });
        } else if (variant === 'outline' || variant === 'ghost') {
            baseStyle.push({ color: theme.colors.primary });
        }

        return baseStyle;
    };

    return (
        <TouchableOpacity
            style={[...getButtonStyle(), style]}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' ? '#ffffff' : theme.colors.primary}
                />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    small: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    medium: {
        paddingVertical: 14,
        paddingHorizontal: 28,
    },
    large: {
        paddingVertical: 18,
        paddingHorizontal: 36,
        borderRadius: 14,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.4,
    },
    text: {
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 17,
    },
});