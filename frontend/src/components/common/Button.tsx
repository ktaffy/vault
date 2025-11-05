import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
    Animated,
    View
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
    const prefersReducedMotion = useReducedMotion();
    const { buttonPress } = useHaptics();

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const ripple1Scale = useRef(new Animated.Value(0)).current;
    const ripple1Opacity = useRef(new Animated.Value(0)).current;
    const ripple2Scale = useRef(new Animated.Value(0)).current;
    const ripple2Opacity = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        if (prefersReducedMotion || disabled || loading) return;
        buttonPress();
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            friction: 7,
            tension: 120,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        if (prefersReducedMotion || disabled || loading) return;
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 120,
            useNativeDriver: true,
        }).start();
        if (variant === 'primary') {
            triggerRipple();
        }
    };

    const triggerRipple = () => {
        ripple1Scale.setValue(0);
        ripple1Opacity.setValue(0.4);
        ripple2Scale.setValue(0);
        ripple2Opacity.setValue(0.3);
        Animated.parallel([
            Animated.timing(ripple1Scale, {
                toValue: 2,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(ripple1Opacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(ripple2Scale, {
                    toValue: 2,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(ripple2Opacity, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 100);
    };

    const getButtonStyle = (): ViewStyle[] => {
        const baseStyle: ViewStyle[] = [styles.button];

        if (size === 'small') baseStyle.push(styles.small);
        if (size === 'medium') baseStyle.push(styles.medium);
        if (size === 'large') baseStyle.push(styles.large);

        if (variant === 'primary') {
            baseStyle.push({
                backgroundColor: theme.colors.primary,
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
        <Animated.View
            style={[
                {
                    transform: [{ scale: scaleAnim }],
                    width: fullWidth ? '100%' : undefined,
                },
            ]}
        >
            <TouchableOpacity
                style={[
                    ...getButtonStyle(),
                    variant === 'primary' && {
                        shadowColor: theme.colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                    },
                    style,
                ]}
                disabled={disabled || loading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                {...props}
            >
                {/* Ripple waves (only for primary variant) */}
                {variant === 'primary' && !prefersReducedMotion && (
                    <>
                        {/* Wave 1 */}
                        <Animated.View
                            style={[
                                styles.ripple,
                                {
                                    transform: [{ scale: ripple1Scale }],
                                    opacity: ripple1Opacity,
                                    backgroundColor: theme.colors.primary,
                                },
                            ]}
                            pointerEvents="none"
                        />
                        {/* Wave 2 */}
                        <Animated.View
                            style={[
                                styles.ripple,
                                {
                                    transform: [{ scale: ripple2Scale }],
                                    opacity: ripple2Opacity,
                                    backgroundColor: theme.colors.primary,
                                },
                            ]}
                            pointerEvents="none"
                        />
                    </>
                )}

                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={variant === 'primary' ? '#ffffff' : theme.colors.primary}
                    />
                ) : (
                    <Text style={getTextStyle()}>{title}</Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        overflow: 'hidden',
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
    ripple: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
});