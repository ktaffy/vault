import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useFeed } from '../../hooks/useFeed';
import { useFeedAudio } from '../../hooks/useFeedAudio';
import { useSwipe } from '../../hooks/useSwipe';
import { SnippetCard } from '../../components/feed/SnippetCard';
import { SwipeActions } from '../../components/feed/SwipeActions';
import { LoadingSpinner } from '../../components/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FeedScreen = () => {
    const { theme } = useTheme();
    const { currentSnippet, loading, currentIndex } = useFeed();
    const { fire, skip } = useSwipe();
    const { isPlaying, progress, duration, seekTo, togglePlayPause, currentTime } = useFeedAudio();

    const slideAnim = useRef(new Animated.Value(0)).current;
    const previousIndex = useRef(currentIndex);

    useEffect(() => {
        if (previousIndex.current !== currentIndex && currentSnippet) {
            Animated.sequence([
                Animated.timing(slideAnim, {
                    toValue: -SCREEN_WIDTH,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: SCREEN_WIDTH,
                    duration: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();

            previousIndex.current = currentIndex;
        }
    }, [currentIndex, currentSnippet]);

    const handleSeek = (seekProgress: number) => {
        const seekTime = seekProgress * duration;
        seekTo(seekTime);
    };

    const handleTogglePlayPause = () => {
        if (currentTime >= duration - 0.5) {
            seekTo(0);
            setTimeout(() => {
                if (!isPlaying) {
                    togglePlayPause();
                }
            }, 100);
        } else {
            togglePlayPause();
        }
    };

    if (loading && !currentSnippet) {
        return (
            <View style={styles.container}>
                <LoadingSpinner
                    text="Loading feed..."
                    fullScreen
                />
            </View>
        );
    }

    if (!currentSnippet) {
        return (
            <View style={styles.container}>
                <LoadingSpinner
                    text="No more snippets available"
                    fullScreen
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: '#000000' }]}>
            <Animated.View
                style={[
                    styles.animatedContainer,
                    {
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                <SnippetCard
                    snippet={currentSnippet}
                    isPlaying={isPlaying}
                    progress={progress}
                    onSeek={handleSeek}
                    onTogglePlayPause={handleTogglePlayPause}
                />
            </Animated.View>

            <SwipeActions
                onFire={fire}
                onSkip={skip}
                disabled={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    animatedContainer: {
        flex: 1,
    },
});