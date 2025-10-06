import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onHide }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            hideToast();
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onHide());
    };

    const getIconName = () => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'error':
                return 'close-circle';
            case 'info':
                return 'information-circle';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return theme.colors.success;
            case 'error':
                return theme.colors.error;
            case 'info':
                return theme.colors.primary;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: insets.top + 10,
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    transform: [{ translateY }],
                    opacity,
                    ...Platform.select({
                        ios: {
                            shadowColor: '#000000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 12,
                        },
                        android: {
                            elevation: 8,
                        },
                    }),
                },
            ]}
        >
            <Pressable onPress={hideToast} style={styles.content}>
                <Ionicons name={getIconName()} size={22} color={getIconColor()} />
                <Text
                    style={[styles.message, { color: theme.colors.text }]}
                    numberOfLines={3}
                >
                    {message}
                </Text>
                <Pressable onPress={hideToast} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </Pressable>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        borderRadius: 14,
        borderWidth: 1,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 18,
        gap: 12,
    },
    message: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 0.2,
        lineHeight: 20,
    },
    closeButton: {
        padding: 4,
    },
});