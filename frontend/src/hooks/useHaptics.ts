import { useCallback, useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const useHaptics = () => {
    const [isEnabled, setIsEnabled] = useState(true);

    const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
        if (!isEnabled || Platform.OS === 'web') return;

        try {
            switch (style) {
                case 'light':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case 'medium':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'heavy':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                case 'rigid':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                    break;
                case 'soft':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    break;
            }
        } catch (error) {
            if (__DEV__) {
                console.warn('Haptic feedback failed:', error);
            }
        }
    }, [isEnabled]);
    const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
        if (!isEnabled || Platform.OS === 'web') return;

        try {
            switch (type) {
                case 'success':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    break;
                case 'warning':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    break;
                case 'error':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    break;
            }
        } catch (error) {
            if (__DEV__) {
                console.warn('Haptic notification failed:', error);
            }
        }
    }, [isEnabled]);
    const selection = useCallback(async () => {
        if (!isEnabled || Platform.OS === 'web') return;

        try {
            await Haptics.selectionAsync();
        } catch (error) {
            if (__DEV__) {
                console.warn('Haptic selection failed:', error);
            }
        }
    }, [isEnabled]);

    const fireButton = useCallback(async () => {
        await impact('heavy');
    }, [impact]);

    const skipButton = useCallback(async () => {
        await impact('medium');
    }, [impact]);

    const buttonPress = useCallback(async () => {
        await impact('light');
    }, [impact]);

    const swipeComplete = useCallback(async () => {
        await notification('success');
    }, [notification]);

    const progressBarSeek = useCallback(async () => {
        await selection();
    }, [selection]);

    return {
        impact,
        notification,
        selection,
        fireButton,
        skipButton,
        buttonPress,
        swipeComplete,
        progressBarSeek,
        isEnabled,
        setIsEnabled,
    };
};