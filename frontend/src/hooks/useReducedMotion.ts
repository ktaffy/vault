import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useReducedMotion = (): boolean => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
            setPrefersReducedMotion(enabled);
        });
        const subscription = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            enabled => {
                setPrefersReducedMotion(enabled);
            }
        );
        return () => {
            subscription.remove();
        };
    }, []);

    return prefersReducedMotion;
};