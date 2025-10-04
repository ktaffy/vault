import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    text?: string;
    fullScreen?: boolean;
    color?: string;
    style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    text,
    fullScreen = false,
    color,
    style,
}) => {
    const { theme } = useTheme();

    const spinnerColor = color || theme.colors.primary;

    if (fullScreen) {
        return (
            <View style={[styles.fullScreenContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size={size} color={spinnerColor} />
                {text && (
                    <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
                        {text}
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={spinnerColor} />
            {text && (
                <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
                    {text}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullScreenContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 12,
        fontSize: 14,
        letterSpacing: 0.3,
        fontWeight: '500',
    },
});