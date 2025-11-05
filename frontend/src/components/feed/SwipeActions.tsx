import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useHaptics } from '../../hooks/useHaptics';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Ionicons } from '@expo/vector-icons';

interface SwipeActionsProps {
    onFire: () => void;
    onSkip: () => void;
    disabled?: boolean;
}

export const SwipeActions: React.FC<SwipeActionsProps> = ({
    onFire,
    onSkip,
    disabled = false
}) => {
    const prefersReducedMotion = useReducedMotion();
    const { fireButton, skipButton } = useHaptics();

    const fireScale = useRef(new Animated.Value(1)).current;
    const fireIconRotation = useRef(new Animated.Value(0)).current;
    const fireIconScale = useRef(new Animated.Value(1)).current;
    const fireRipple1Scale = useRef(new Animated.Value(0)).current;
    const fireRipple1Opacity = useRef(new Animated.Value(0)).current;
    const fireRipple2Scale = useRef(new Animated.Value(0)).current;
    const fireRipple2Opacity = useRef(new Animated.Value(0)).current;

    const skipScale = useRef(new Animated.Value(1)).current;
    const skipIconScale = useRef(new Animated.Value(1)).current;
    const skipRipple1Scale = useRef(new Animated.Value(0)).current;
    const skipRipple1Opacity = useRef(new Animated.Value(0)).current;
    const skipRipple2Scale = useRef(new Animated.Value(0)).current;
    const skipRipple2Opacity = useRef(new Animated.Value(0)).current;

    const handleFirePressIn = () => {
        if (disabled || prefersReducedMotion) return;
        Animated.spring(fireScale, {
            toValue: 0.92,
            friction: 7,
            tension: 120,
            useNativeDriver: true,
        }).start();
        Animated.parallel([
            Animated.spring(fireIconScale, {
                toValue: 0.9,
                friction: 7,
                tension: 120,
                useNativeDriver: true,
            }),
            Animated.spring(fireIconRotation, {
                toValue: -5,
                friction: 7,
                tension: 120,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleFirePressOut = () => {
        if (disabled || prefersReducedMotion) return;
        Animated.spring(fireScale, {
            toValue: 1,
            friction: 7,
            tension: 120,
            useNativeDriver: true,
        }).start();
        Animated.sequence([
            Animated.spring(fireIconRotation, {
                toValue: 2,
                friction: 5,
                tension: 200,
                useNativeDriver: true,
            }),
            Animated.spring(fireIconRotation, {
                toValue: 0,
                friction: 6,
                tension: 150,
                useNativeDriver: true,
            }),
        ]).start();
        Animated.sequence([
            Animated.spring(fireIconScale, {
                toValue: 1.08,
                friction: 6,
                tension: 180,
                useNativeDriver: true,
            }),
            Animated.spring(fireIconScale, {
                toValue: 1,
                friction: 7,
                tension: 120,
                useNativeDriver: true,
            }),
        ]).start();
        triggerFireRipple();
    };

    const handleFire = () => {
        if (disabled) return;
        fireButton();
        onFire();
    };

    const handleSkipPressIn = () => {
        if (disabled || prefersReducedMotion) return;
        Animated.spring(skipScale, {
            toValue: 0.92,
            friction: 7,
            tension: 120,
            useNativeDriver: true,
        }).start();
        Animated.spring(skipIconScale, {
            toValue: 0.9,
            friction: 7,
            tension: 120,
            useNativeDriver: true,
        }).start();
    };

    const handleSkipPressOut = () => {
        if (disabled || prefersReducedMotion) return;
        Animated.spring(skipScale, {
            toValue: 1,
            friction: 7,
            tension: 120,
            useNativeDriver: true,
        }).start();
        Animated.sequence([
            Animated.spring(skipIconScale, {
                toValue: 1.08,
                friction: 6,
                tension: 180,
                useNativeDriver: true,
            }),
            Animated.spring(skipIconScale, {
                toValue: 1,
                friction: 7,
                tension: 120,
                useNativeDriver: true,
            }),
        ]).start();
        triggerSkipRipple();
    };

    const handleSkip = () => {
        if (disabled) return;
        skipButton();
        onSkip();
    };

    const triggerFireRipple = () => {
        fireRipple1Scale.setValue(0);
        fireRipple1Opacity.setValue(0.5);
        fireRipple2Scale.setValue(0);
        fireRipple2Opacity.setValue(0.4);
        Animated.parallel([
            Animated.timing(fireRipple1Scale, {
                toValue: 2.5,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(fireRipple1Opacity, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fireRipple2Scale, {
                    toValue: 2.5,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(fireRipple2Opacity, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 100);
    };

    const triggerSkipRipple = () => {
        skipRipple1Scale.setValue(0);
        skipRipple1Opacity.setValue(0.4);
        skipRipple2Scale.setValue(0);
        skipRipple2Opacity.setValue(0.3);
        Animated.parallel([
            Animated.timing(skipRipple1Scale, {
                toValue: 2.5,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(skipRipple1Opacity, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(skipRipple2Scale, {
                    toValue: 2.5,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(skipRipple2Opacity, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 100);
    };

    const fireRotation = fireIconRotation.interpolate({
        inputRange: [-10, 10],
        outputRange: ['-10deg', '10deg'],
    });

    return (
        <View style={styles.container}>
            {/* Fire Button */}
            <Animated.View
                style={{
                    transform: [{ scale: fireScale }],
                }}
            >
                <Pressable
                    onPressIn={handleFirePressIn}
                    onPressOut={handleFirePressOut}
                    onPress={handleFire}
                    disabled={disabled}
                    style={[styles.button, styles.fireButton]}
                >
                    {/* Ripple waves */}
                    {!prefersReducedMotion && (
                        <>
                            <Animated.View
                                style={[
                                    styles.ripple,
                                    {
                                        transform: [{ scale: fireRipple1Scale }],
                                        opacity: fireRipple1Opacity,
                                        backgroundColor: '#9B59D0',
                                    },
                                ]}
                                pointerEvents="none"
                            />
                            <Animated.View
                                style={[
                                    styles.ripple,
                                    {
                                        transform: [{ scale: fireRipple2Scale }],
                                        opacity: fireRipple2Opacity,
                                        backgroundColor: '#9B59D0',
                                    },
                                ]}
                                pointerEvents="none"
                            />
                        </>
                    )}

                    {/* Animated Icon */}
                    <Animated.View
                        style={{
                            transform: [
                                { rotate: fireRotation },
                                { scale: fireIconScale },
                            ],
                        }}
                    >
                        <Ionicons
                            name="flame"
                            size={28}
                            color="#ffffff"
                        />
                    </Animated.View>
                </Pressable>
            </Animated.View>

            {/* Skip Button */}
            <Animated.View
                style={{
                    transform: [{ scale: skipScale }],
                }}
            >
                <Pressable
                    onPressIn={handleSkipPressIn}
                    onPressOut={handleSkipPressOut}
                    onPress={handleSkip}
                    disabled={disabled}
                    style={[styles.button, styles.skipButton]}
                >
                    {/* Ripple waves */}
                    {!prefersReducedMotion && (
                        <>
                            <Animated.View
                                style={[
                                    styles.ripple,
                                    {
                                        transform: [{ scale: skipRipple1Scale }],
                                        opacity: skipRipple1Opacity,
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                ]}
                                pointerEvents="none"
                            />
                            <Animated.View
                                style={[
                                    styles.ripple,
                                    {
                                        transform: [{ scale: skipRipple2Scale }],
                                        opacity: skipRipple2Opacity,
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    },
                                ]}
                                pointerEvents="none"
                            />
                        </>
                    )}

                    {/* Animated Icon */}
                    <Animated.View
                        style={{
                            transform: [
                                { scale: skipIconScale },
                            ],
                        }}
                    >
                        <Ionicons
                            name="close"
                            size={28}
                            color="#ffffff"
                        />
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 16,
        bottom: 180,
        flexDirection: 'column',
        gap: 16,
        zIndex: 15,
    },
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
    },
    fireButton: {
        backgroundColor: '#9B59D0',
        borderColor: 'rgba(155, 89, 208, 0.4)',
    },
    skipButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    ripple: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 28,
    },
});