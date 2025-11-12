import React, { useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import type { FeedSnippet } from '../../types/feed';
import { audioCache } from '../../utils/audioCache';
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
    const { isPlaying, progress, duration, seekTo, togglePlayPause, currentTime, pause } = useFeedAudio();
    const isFocused = useRef(true);

    const pauseRef = useRef(pause);

    useEffect(() => {
        pauseRef.current = pause;
    }, [pause]);

    useFocusEffect(
        useCallback(() => {
            isFocused.current = true;
            return () => {
                isFocused.current = false;
                pauseRef.current();
            };
        }, [])
    );

    const slideAnim = useRef(new Animated.Value(0)).current;
    const previousIndex = useRef(currentIndex);
    const [displayedSnippet, setDisplayedSnippet] = React.useState<FeedSnippet | null>(currentSnippet);
    const isAnimating = useRef(false);

    useEffect(() => {
        if (isAnimating.current) {
            return;
        }
        if (!currentSnippet) {
            return;
        }
        if (previousIndex.current !== currentIndex && currentSnippet && displayedSnippet) {
            if (currentSnippet.id !== displayedSnippet.id) {
                isAnimating.current = true;
                Animated.timing(slideAnim, {
                    toValue: -SCREEN_WIDTH,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => {
                    setDisplayedSnippet(currentSnippet);
                    slideAnim.setValue(SCREEN_WIDTH);
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        isAnimating.current = false;
                    });
                });
            }

            previousIndex.current = currentIndex;
        } else if (!displayedSnippet && currentSnippet) {
            setDisplayedSnippet(currentSnippet);
        }
    }, [currentIndex, currentSnippet, displayedSnippet]);

    useEffect(() => {
        if (!currentSnippet && displayedSnippet) {
            setDisplayedSnippet(null);
            slideAnim.setValue(0);
            isAnimating.current = false;
        }
    }, [currentSnippet, displayedSnippet]);

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

    if (loading && !displayedSnippet) {
        return (
            <View style={styles.container}>
                <LoadingSpinner
                    text="Loading feed..."
                    fullScreen
                />
            </View>
        );
    }

    if (!displayedSnippet) {
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
                    snippet={displayedSnippet}
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