import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { FeedSnippet } from '../../types/feed';
import { useRouter } from 'expo-router';

interface PlayPauseButtonProps {
    isPlaying: boolean;
    onPress?: () => void;
    pulseAnim: Animated.Value;
}

const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({
    isPlaying,
    onPress,
    pulseAnim
}) => {
    const prefersReducedMotion = useReducedMotion();
    const buttonScale = useRef(new Animated.Value(1)).current;
    const iconScale = useRef(new Animated.Value(1)).current;
    const particle1 = {
        translateX: useRef(new Animated.Value(0)).current,
        translateY: useRef(new Animated.Value(0)).current,
        opacity: useRef(new Animated.Value(0)).current,
        scale: useRef(new Animated.Value(0)).current,
    };
    const particle2 = {
        translateX: useRef(new Animated.Value(0)).current,
        translateY: useRef(new Animated.Value(0)).current,
        opacity: useRef(new Animated.Value(0)).current,
        scale: useRef(new Animated.Value(0)).current,
    };
    const particle3 = {
        translateX: useRef(new Animated.Value(0)).current,
        translateY: useRef(new Animated.Value(0)).current,
        opacity: useRef(new Animated.Value(0)).current,
        scale: useRef(new Animated.Value(0)).current,
    };
    const particle4 = {
        translateX: useRef(new Animated.Value(0)).current,
        translateY: useRef(new Animated.Value(0)).current,
        opacity: useRef(new Animated.Value(0)).current,
        scale: useRef(new Animated.Value(0)).current,
    };
    const ringScale = useRef(new Animated.Value(1)).current;
    const ringOpacity = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        if (prefersReducedMotion) return;
        Animated.spring(buttonScale, {
            toValue: 0.88,
            friction: 6,
            tension: 150,
            useNativeDriver: true,
        }).start();
        Animated.spring(iconScale, {
            toValue: 0.82,
            friction: 6,
            tension: 150,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        if (prefersReducedMotion) return;
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
        }).start();
        Animated.sequence([
            Animated.spring(iconScale, {
                toValue: 1.18,
                friction: 4,
                tension: 180,
                useNativeDriver: true,
            }),
            Animated.spring(iconScale, {
                toValue: 1,
                friction: 6,
                tension: 120,
                useNativeDriver: true,
            }),
        ]).start();
        triggerParticleBurst();
        triggerRingPulse();
    };

    const triggerParticleBurst = () => {
        const particles = [particle1, particle2, particle3, particle4];
        const directions = [
            { x: -60, y: -60 },
            { x: 60, y: -60 },
            { x: -60, y: 60 },
            { x: 60, y: 60 },
        ];

        particles.forEach((particle, index) => {
            particle.translateX.setValue(0);
            particle.translateY.setValue(0);
            particle.opacity.setValue(0.8);
            particle.scale.setValue(1);

            const direction = directions[index];

            Animated.parallel([
                Animated.timing(particle.translateX, {
                    toValue: direction.x,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(particle.translateY, {
                    toValue: direction.y,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(particle.opacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(particle.scale, {
                    toValue: 0.3,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const triggerRingPulse = () => {
        ringScale.setValue(1);
        ringOpacity.setValue(0.6);
        Animated.parallel([
            Animated.timing(ringScale, {
                toValue: 1.8,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <Animated.View
            style={{
                transform: [{ scale: buttonScale }],
            }}
        >
            <Pressable
                style={styles.playPauseContainer}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                {/* Ring pulse effect */}
                {!prefersReducedMotion && (
                    <Animated.View
                        style={[
                            styles.ringPulse,
                            {
                                transform: [{ scale: ringScale }],
                                opacity: ringOpacity,
                            },
                        ]}
                        pointerEvents="none"
                    />
                )}

                {/* Particle burst effects */}
                {!prefersReducedMotion && (
                    <>
                        {/* Particle 1 - Top Left */}
                        <Animated.View
                            style={[
                                styles.particle,
                                {
                                    transform: [
                                        { translateX: particle1.translateX },
                                        { translateY: particle1.translateY },
                                        { scale: particle1.scale },
                                    ],
                                    opacity: particle1.opacity,
                                },
                            ]}
                            pointerEvents="none"
                        />
                        {/* Particle 2 - Top Right */}
                        <Animated.View
                            style={[
                                styles.particle,
                                {
                                    transform: [
                                        { translateX: particle2.translateX },
                                        { translateY: particle2.translateY },
                                        { scale: particle2.scale },
                                    ],
                                    opacity: particle2.opacity,
                                },
                            ]}
                            pointerEvents="none"
                        />
                        {/* Particle 3 - Bottom Left */}
                        <Animated.View
                            style={[
                                styles.particle,
                                {
                                    transform: [
                                        { translateX: particle3.translateX },
                                        { translateY: particle3.translateY },
                                        { scale: particle3.scale },
                                    ],
                                    opacity: particle3.opacity,
                                },
                            ]}
                            pointerEvents="none"
                        />
                        {/* Particle 4 - Bottom Right */}
                        <Animated.View
                            style={[
                                styles.particle,
                                {
                                    transform: [
                                        { translateX: particle4.translateX },
                                        { translateY: particle4.translateY },
                                        { scale: particle4.scale },
                                    ],
                                    opacity: particle4.opacity,
                                },
                            ]}
                            pointerEvents="none"
                        />
                    </>
                )}

                {/* Playing State - Sound Bars */}
                {isPlaying ? (
                    <View style={styles.playingIndicator}>
                        <AnimatedSoundBar delay={0} />
                        <AnimatedSoundBar delay={200} />
                        <AnimatedSoundBar delay={400} />
                    </View>
                ) : (
                    /* Paused State - Play Icon */
                    <Animated.View
                        style={{
                            transform: [{ scale: iconScale }],
                        }}
                    >
                        <View style={styles.pausedIndicator}>
                            <Ionicons name="play" size={48} color="#9B59D0" />
                        </View>
                    </Animated.View>
                )}
            </Pressable>
        </Animated.View>
    );
};

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

interface SnippetCardProps {
    snippet: FeedSnippet;
    isPlaying: boolean;
    progress: number;
    onSeek?: (progress: number) => void;
    onTogglePlayPause?: () => void;
}

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
                <View style={styles.centerSection}>
                    <PlayPauseButton
                        isPlaying={isPlaying}
                        onPress={onTogglePlayPause}
                        pulseAnim={pulseAnim}
                    />
                </View>

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
    playPauseContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'visible',
    },
    ringPulse: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 3,
        borderColor: '#9B59D0',
    },
    particle: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#9B59D0',
        shadowColor: '#9B59D0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
});