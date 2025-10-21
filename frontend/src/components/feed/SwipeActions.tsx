import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
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
    const fireScale = useRef(new Animated.Value(1)).current;
    const skipScale = useRef(new Animated.Value(1)).current;

    const animateButton = (scale: Animated.Value, callback: () => void) => {
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.85,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(callback, 100);
    };

    const handleFire = () => {
        if (disabled) return;
        animateButton(fireScale, onFire);
    };

    const handleSkip = () => {
        if (disabled) return;
        animateButton(skipScale, onSkip);
    };

    return (
        <View style={styles.container}>
            {/* Fire Button */}
            <Pressable
                onPress={handleFire}
                disabled={disabled}
                style={({ pressed }) => [
                    styles.button,
                    styles.fireButton,
                    {
                        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
                    },
                ]}
            >
                <Animated.View style={{ transform: [{ scale: fireScale }] }}>
                    <Ionicons
                        name="flame"
                        size={28}
                        color="#ffffff"
                    />
                </Animated.View>
            </Pressable>

            {/* Skip Button */}
            <Pressable
                onPress={handleSkip}
                disabled={disabled}
                style={({ pressed }) => [
                    styles.button,
                    styles.skipButton,
                    {
                        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
                    },
                ]}
            >
                <Animated.View style={{ transform: [{ scale: skipScale }] }}>
                    <Ionicons
                        name="close"
                        size={28}
                        color="#ffffff"
                    />
                </Animated.View>
            </Pressable>
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
    },
    fireButton: {
        backgroundColor: '#9B59D0',
        borderColor: 'rgba(155, 89, 208, 0.4)',
    },
    skipButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
});