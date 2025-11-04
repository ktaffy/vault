import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import type { FeedSnippet } from '../../types/feed';
import { useRouter } from 'expo-router';

interface SnippetCardProps {
    snippet: FeedSnippet;
    isPlaying: boolean;
    progress: number;
    onSeek?: (progress: number) => void;
    onTogglePlayPause?: () => void;
}

const AnimatedSoundBar: React.FC<{ delay: number }> = ({ delay }) => {
    const animation = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animation, {
                        toValue: 1,
                        duration: 600,
                        delay,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animation, {
                        toValue: 0.4,
                        duration: 600,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        };

        animate();
    }, [delay]);

    const height = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 32],
    });

    return (
        <Animated.View
            style={[
                styles.soundBar,
                { height },
            ]}
        />
    );
};

export const SnippetCard: React.FC<SnippetCardProps> = ({
    snippet,
    isPlaying,
    progress,
    onSeek,
    onTogglePlayPause,
}) => {
    const { theme } = useTheme();
    const router = useRouter();
    const animatedProgress = useRef(new Animated.Value(progress)).current;
    const previousSnippetId = useRef(snippet.snippet_id);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);

    useEffect(() => {
        if (previousSnippetId.current !== snippet.snippet_id) {
            animatedProgress.setValue(0);
            previousSnippetId.current = snippet.snippet_id;
        }
    }, [snippet.snippet_id]);

    useEffect(() => {
        if (!isSeeking) {
            animatedProgress.setValue(progress);
        }
    }, [progress, isSeeking]);

    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.03,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            Animated.timing(glowAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            pulseAnim.stopAnimation();
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();

            Animated.timing(glowAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isPlaying]);

    const handleSlidingStart = () => {
        setIsSeeking(true);
    };

    const handleSlidingComplete = (value: number) => {
        if (onSeek) {
            onSeek(value);
        }
        setTimeout(() => {
            setIsSeeking(false);
        }, 100);
    };

    const handleValueChange = (value: number) => {
        setSeekValue(value);
    };

    return (
        <View style={styles.container}>
            {/* Animated Glow Effect - Radial overlay */}
            <Animated.View
                style={[
                    styles.glowLayer,
                    {
                        opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.15]
                        }),
                    }
                ]}
            >
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.4)', 'rgba(155, 89, 208, 0)', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </Animated.View>
            {/* Background - cover art or gradient */}
            <Animated.View style={[
                styles.background,
                {
                    backgroundColor: theme.colors.surface,
                    transform: [{ scale: pulseAnim }],
                }
            ]}>
                {snippet.cover_art_url ? (
                    <>
                        {/* Cover Art Image */}
                        <Image
                            source={{ uri: snippet.cover_art_url }}
                            style={styles.coverArtImage}
                            resizeMode="cover"
                        />
                        {/* Dark overlay for text readability */}
                        <LinearGradient
                            colors={
                                theme.isDark
                                    ? ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.6)']
                                    : ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.7)']
                            }
                            style={styles.gradient}
                            locations={[0, 0.5, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        />
                    </>
                ) : (
                    // Original gradient when no cover art
                    theme.isDark ? (
                        <LinearGradient
                            colors={[
                                'rgba(155, 89, 208, 0.2)',
                                'rgba(155, 89, 208, 0.1)',
                                'rgba(0, 0, 0, 0.6)',
                                'rgba(0, 0, 0, 0.95)',
                            ]}
                            style={styles.gradient}
                            locations={[0, 0.3, 0.7, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        />
                    ) : (
                        <View style={[styles.gradient, { backgroundColor: '#ffffff' }]} />
                    )
                )}
            </Animated.View>

            {/* Content Overlay */}
            <View style={styles.content}>
                {/* Top Section - Stats */}
                <View style={styles.topSection}>
                    <View style={styles.statBadge}>
                        <Ionicons name="headset" size={14} color="#ffffff" />
                        <Text style={styles.statText}>{snippet.play_count.toLocaleString()}</Text>
                    </View>

                    <View style={styles.statBadge}>
                        <Ionicons name="flame" size={14} color="#ff6b6b" />
                        <Text style={styles.statText}>{Math.round(snippet.fire_rate * 100)}%</Text>
                    </View>
                </View>

                {/* Center - Playing Indicator (Now Interactive) */}
                <Pressable
                    style={styles.centerSection}
                    onPress={onTogglePlayPause}
                >
                    {isPlaying ? (
                        <View style={styles.playingIndicator}>
                            <AnimatedSoundBar delay={0} />
                            <AnimatedSoundBar delay={200} />
                            <AnimatedSoundBar delay={400} />
                        </View>
                    ) : (
                        <View style={styles.pausedIndicator}>
                            <Ionicons name="play" size={48} color="#9B59D0" />
                        </View>
                    )}
                </Pressable>

                {/* Bottom Section - Snippet Info */}
                <View style={styles.bottomSection}>
                    {/* Interactive Progress Bar */}
                    <View style={styles.progressContainer}>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={1}
                            value={isSeeking ? seekValue : progress}
                            onSlidingStart={handleSlidingStart}
                            onValueChange={handleValueChange}
                            onSlidingComplete={handleSlidingComplete}
                            minimumTrackTintColor={theme.colors.primary}
                            maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                            thumbTintColor={theme.colors.primary}
                        />
                    </View>

                    {/* Snippet Details */}
                    <View style={styles.infoSection}>
                        <Text style={styles.title} numberOfLines={2}>
                            {snippet.title}
                        </Text>

                        <Pressable
                            style={styles.artistRow}
                            onPress={() => router.push(`/(tabs)/artist-profile/${snippet.artist_id}`)}
                        >
                            <View style={[styles.artistAvatar, {
                                backgroundColor: theme.colors.primary
                            }]}>
                                {snippet.artist_profile_pic ? (
                                    <Image
                                        source={{ uri: snippet.artist_profile_pic }}
                                        style={styles.artistAvatarImage}
                                    />
                                ) : (
                                    <Text style={styles.artistInitial}>
                                        {snippet.artist_name.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.artistName} numberOfLines={1}>
                                {snippet.artist_name}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    glowLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    gradient: {
        flex: 1,
    },
    coverArtImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    topSection: {
        flexDirection: 'row',
        gap: 8,
        zIndex: 10,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    statText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    playingIndicator: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'flex-end',
        height: 40,
    },
    soundBar: {
        width: 4,
        backgroundColor: '#9B59D0',
        borderRadius: 2,
    },
    bottomSection: {
        gap: 20,
        zIndex: 20,
        alignItems: 'flex-start',
    },
    progressContainer: {
        width: '100%',
        paddingVertical: 10,
    },
    slider: {
        width: '100%',
        height: 10,
    },
    progressBar: {
        height: 3,
        borderRadius: 1.5,
        overflow: 'visible',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressFill: {
        height: '100%',
        borderRadius: 1.5,
    },
    progressThumb: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        top: -4.5,
        marginLeft: -6,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    infoSection: {
        gap: 10,
        maxWidth: '70%',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.2,
        lineHeight: 26,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    artistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    artistAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
    },
    artistAvatarImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    artistInitial: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
    },
    artistName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: 0.3,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    pausedIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});