import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenSetup } from '../../hooks/useScreenSetup';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { snippetService, Snippet } from '../../services/api/snippets';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { audioCache } from '../../utils/audioCache';


const PreloadAudio: React.FC<{ audioUrl: string }> = ({ audioUrl }) => {
    const player = useAudioPlayer(audioUrl);
    const status = useAudioPlayerStatus(player);

    useEffect(() => {
        if (status.isLoaded && !audioCache.has(audioUrl)) {
            audioCache.set(audioUrl, player);
        }
    }, [status.isLoaded, audioUrl]);

    return null;
};

export const StatsScreen = () => {
    const { insets, theme, router, showToast } = useScreenSetup();
    const { id } = useLocalSearchParams();
    const snippetId = Number(id);

    const [snippet, setSnippet] = useState<Snippet | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [displayProgress, setDisplayProgress] = useState(0);
    const overrideProgress = useRef(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchSnippet();
    }, [snippetId]);

    useEffect(() => {
        return () => {
            if (isPlaying) {
                setIsPlaying(false);
                setAudioProgress(0);

                if (snippet?.audio_url) {
                    const cachedPlayer = audioCache.get(snippet.audio_url);
                    if (cachedPlayer) {
                        try {
                            cachedPlayer.pause();
                        } catch (error) {
                        }
                    }
                }
            }
        };
    }, [isPlaying, snippet?.audio_url]);

    useFocusEffect(
            useCallback(() => {
                return () => {
                    setIsPlaying(false);
                    setAudioProgress(0);
    
                    audioCache.forEach((player) => {
                        try {
                            player.pause();
                        } catch (error) {
                        }
                    });
                };
            }, [])
        );

    useEffect(() => {
        if (showDeleteConfirm) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            fadeAnim.setValue(0);
        }
    }, [showDeleteConfirm]);

    const fetchSnippet = async () => {
        try {
            const data = await snippetService.getById(snippetId);
            setSnippet(data);
        } catch (error) {
            if (__DEV__) {
                console.error('Failed to fetch snippet:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPause = () => {
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);

        if (!newIsPlaying) {
            setAudioProgress(0);
            setDisplayProgress(0);
            overrideProgress.current = false;
        } else {
            setDisplayProgress(0);
            overrideProgress.current = true;

            setTimeout(() => {
                overrideProgress.current = false;
            }, 200);
        }
    };

    useEffect(() => {
        if (!overrideProgress.current) {
            setDisplayProgress(audioProgress);
        }
    }, [audioProgress]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await snippetService.delete(snippetId);
            showToast('Snippet deleted successfully', 'success');
            router.back();
        } catch (error: any) {
            if (__DEV__) {
                console.error('Failed to delete snippet:', error);
            }
            showToast(error.message || 'Failed to delete snippet', 'error');
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </Pressable>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    if (!snippet) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </Pressable>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={[styles.errorText, { color: theme.colors.text }]}>
                        Snippet not found
                    </Text>
                </View>
            </View>
        );
    }

    const fireRate = (snippet.fire_rate * 100).toFixed(1);
    const engagement = snippet.play_count > 0
        ? (((snippet.fire_count + snippet.skip_count) / snippet.play_count) * 100).toFixed(0)
        : '0';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                    Analytics
                </Text>
                <Pressable onPress={() => setShowDeleteConfirm(true)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
                </Pressable>
            </View>

            {snippet && isPlaying && (
                <AudioPlayerComponent
                    snippet={snippet}
                    onEnd={() => {
                        setIsPlaying(false);
                        setAudioProgress(0);
                    }}
                    onProgress={setAudioProgress}
                />
            )}

            {snippet && <PreloadAudio audioUrl={snippet.audio_url} />}

            {showDeleteConfirm && (
                <View style={styles.confirmOverlay}>
                    <Animated.View style={[styles.confirmBackdrop, { opacity: fadeAnim }]} />
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => !deleting && setShowDeleteConfirm(false)}
                    />
                    <Animated.View style={[styles.confirmModal, {
                        backgroundColor: theme.colors.surface,
                        transform: [{ scale: scaleAnim }],
                        opacity: fadeAnim,
                    }]}>
                        <Text style={[styles.confirmTitle, { color: theme.colors.text }]}>
                            Delete snippet?
                        </Text>
                        <Text style={[styles.confirmMessage, { color: theme.colors.textSecondary }]}>
                            This can't be undone and it will be removed from your profile.
                        </Text>

                        <View style={styles.confirmButtons}>
                            <Pressable
                                onPress={handleDelete}
                                disabled={deleting}
                                style={[styles.confirmButton, styles.confirmButtonDestructive]}
                            >
                                {deleting ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.confirmButtonTextDestructive}>
                                        Delete
                                    </Text>
                                )}
                            </Pressable>
                            <View style={[styles.confirmDivider, { backgroundColor: theme.colors.border }]} />
                            <Pressable
                                onPress={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                style={styles.confirmButton}
                            >
                                <Text style={[styles.confirmButtonText, { color: theme.colors.text }]}>
                                    Cancel
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Snippet Info Card */}
                <View style={[styles.infoCard, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                }]}>
                    <View style={styles.infoHeader}>
                        {snippet.cover_art_url ? (
                            <Image
                                source={{ uri: snippet.cover_art_url }}
                                style={styles.coverArtImage}
                            />
                        ) : (
                            <View style={[styles.iconCircle, {
                                backgroundColor: theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                            }]}>
                                <Ionicons name="musical-note" size={24} color={theme.colors.primary} />
                            </View>
                        )}
                        <View style={styles.infoDetails}>
                            <Text style={[styles.snippetTitle, { color: theme.colors.text }]} numberOfLines={2}>
                                {snippet.title}
                            </Text>
                            <Text style={[styles.snippetDate, { color: theme.colors.textSecondary }]}>
                                {new Date(snippet.uploaded_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, {
                            backgroundColor: snippet.is_active
                                ? 'rgba(76, 175, 80, 0.1)'
                                : 'rgba(244, 67, 54, 0.1)'
                        }]}>
                            <View style={[styles.statusDot, {
                                backgroundColor: snippet.is_active ? '#4CAF50' : '#F44336'
                            }]} />
                            <Text style={[styles.statusText, {
                                color: snippet.is_active ? '#4CAF50' : '#F44336'
                            }]}>
                                {snippet.is_active ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                    </View>
                    {/* Audio Player Bar */}
                    <View style={[styles.audioPlayerBar, { borderTopColor: theme.colors.border }]}>
                        <Pressable onPress={handlePlayPause} hitSlop={10}>
                            <Ionicons
                                name={isPlaying ? "pause-circle" : "play-circle"}
                                size={32}
                                color={theme.colors.primary}
                            />
                        </Pressable>
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
                                <View
                                    style={[styles.progressFill, {
                                        width: `${displayProgress * 100}%`,
                                        backgroundColor: theme.colors.primary
                                    }]}
                                />
                            </View>
                            <Text style={[styles.progressTime, { color: theme.colors.textSecondary }]}>
                                {formatTime(displayProgress * 15)} / 0:15
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Key Metrics */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Performance
                    </Text>
                    <View style={styles.metricsGrid}>
                        <MetricCard
                            icon="play-circle"
                            label="Total Plays"
                            value={snippet.play_count.toString()}
                            theme={theme}
                        />
                        <MetricCard
                            icon="flame"
                            label="Fires"
                            value={snippet.fire_count.toString()}
                            theme={theme}
                            highlight
                        />
                        <MetricCard
                            icon="close-circle"
                            label="Skips"
                            value={snippet.skip_count.toString()}
                            theme={theme}
                        />
                        <MetricCard
                            icon="trending-up"
                            label="Fire Rate"
                            value={`${fireRate}%`}
                            theme={theme}
                            highlight={snippet.fire_rate > 0.5}
                        />
                    </View>
                </View>

                {/* Engagement Breakdown */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Engagement
                    </Text>
                    <View style={[styles.engagementCard, {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border
                    }]}>
                        {/* Fire Rate Progress */}
                        <View style={styles.progressRow}>
                            <View style={styles.progressLabel}>
                                <Ionicons name="flame" size={18} color={theme.colors.primary} />
                                <Text style={[styles.progressText, { color: theme.colors.text }]}>
                                    Fire Rate
                                </Text>
                            </View>
                            <Text style={[styles.progressValue, { color: theme.colors.text }]}>
                                {fireRate}%
                            </Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                            <View
                                style={[styles.progressFill, {
                                    width: `${Math.min(snippet.fire_rate * 100, 100)}%`,
                                    backgroundColor: theme.colors.primary
                                }]}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* Skip Rate Progress */}
                        <View style={styles.progressRow}>
                            <View style={styles.progressLabel}>
                                <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                                <Text style={[styles.progressText, { color: theme.colors.text }]}>
                                    Skip Rate
                                </Text>
                            </View>
                            <Text style={[styles.progressValue, { color: theme.colors.text }]}>
                                {(100 - parseFloat(fireRate)).toFixed(1)}%
                            </Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                            <View
                                style={[styles.progressFill, {
                                    width: `${Math.min((1 - snippet.fire_rate) * 100, 100)}%`,
                                    backgroundColor: theme.colors.textSecondary
                                }]}
                            />
                        </View>
                    </View>
                </View>

                {/* Insights */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Insights
                    </Text>

                    <InsightCard
                        icon="analytics"
                        title="Engagement Rate"
                        value={`${engagement}%`}
                        description="Users who interacted with your snippet"
                        theme={theme}
                    />

                    <InsightCard
                        icon="people"
                        title="Unique Listeners"
                        value={snippet.play_count.toString()}
                        description="Total plays from all users"
                        theme={theme}
                    />

                    {snippet.fire_rate > 0.7 && (
                        <InsightCard
                            icon="trophy"
                            title="High Performer"
                            value="🔥"
                            description="This snippet has an excellent fire rate!"
                            theme={theme}
                            highlight
                        />
                    )}

                    {snippet.fire_rate < 0.3 && snippet.play_count > 20 && (
                        <InsightCard
                            icon="bulb"
                            title="Optimization Tip"
                            value="💡"
                            description="Consider updating this snippet for better engagement"
                            theme={theme}
                        />
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const MetricCard: React.FC<{
    icon: any;
    label: string;
    value: string;
    theme: any;
    highlight?: boolean;
}> = ({ icon, label, value, theme, highlight }) => (
    <View style={[styles.metricCard, {
        backgroundColor: theme.colors.surface,
        borderColor: highlight ? theme.colors.primary : theme.colors.border,
        borderWidth: highlight ? 1.5 : 1
    }]}>
        <Ionicons
            name={icon}
            size={22}
            color={highlight ? theme.colors.primary : theme.colors.textSecondary}
        />
        <Text style={[styles.metricValue, { color: theme.colors.text }]}>
            {value}
        </Text>
        <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            {label}
        </Text>
    </View>
);

const InsightCard: React.FC<{
    icon: any;
    title: string;
    value: string;
    description: string;
    theme: any;
    highlight?: boolean;
}> = ({ icon, title, value, description, theme, highlight }) => (
    <View style={[styles.insightCard, {
        backgroundColor: theme.colors.surface,
        borderColor: highlight ? theme.colors.primary : theme.colors.border,
        borderWidth: highlight ? 1.5 : 1
    }]}>
        <View style={styles.insightHeader}>
            <View style={[styles.insightIconCircle, {
                backgroundColor: highlight
                    ? theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                    : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
            }]}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={highlight ? theme.colors.primary : theme.colors.textSecondary}
                />
            </View>
            <Text style={[styles.insightValue, { color: theme.colors.text }]}>
                {value}
            </Text>
        </View>
        <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
            {title}
        </Text>
        <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>
            {description}
        </Text>
    </View>
);

const AudioPlayerComponent: React.FC<{
    snippet: { audio_url: string };
    onEnd: () => void;
    onProgress: (progress: number) => void;
}> = ({ snippet, onEnd, onProgress }) => {
    const cachedPlayer = audioCache.get(snippet.audio_url);

    const { play, pause, isLoaded } = useAudioPlayback(snippet.audio_url, {
        autoPlay: false,
        onEnd,
        onProgress,
        cachedPlayer,
    });

    useEffect(() => {
        if (cachedPlayer) {
            try {
                cachedPlayer.seekTo(0);
                cachedPlayer.play();
            } catch (error) {
                console.error('Cached player error:', error);
            }
        } else if (isLoaded) {
            play();
        }

        return () => {
            try {
                if (cachedPlayer) {
                    cachedPlayer.pause();
                } else {
                    pause();
                }
            } catch (error) {
            }
        };
    }, [snippet.audio_url, isLoaded]);

    return null;
};

const formatTime = (seconds: number) => {
    const secs = Math.floor(seconds);
    return `0:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    headerSpacer: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    infoCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 24,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoDetails: {
        flex: 1,
        gap: 4,
    },
    snippetTitle: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 22,
    },
    snippetDate: {
        fontSize: 13,
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metricCard: {
        width: '48%',
        borderRadius: 16,
        padding: 16,
        gap: 8,
    },
    metricValue: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    metricLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    engagementCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        gap: 16,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressText: {
        fontSize: 15,
        fontWeight: '600',
    },
    progressValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        marginVertical: 4,
    },
    insightCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        gap: 10,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    insightIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    insightValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    insightDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    deleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: -8,
    },
    confirmOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        pointerEvents: 'box-none',
    },
    confirmBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        pointerEvents: 'auto',
    },
    confirmModal: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 16,
        overflow: 'hidden',
    },
    confirmTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        paddingTop: 24,
        paddingHorizontal: 24,
    },
    confirmMessage: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 24,
    },
    confirmButtons: {
        width: '100%',
    },
    confirmButton: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonDestructive: {
        backgroundColor: 'transparent',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    confirmButtonTextDestructive: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ff3b30',
    },
    confirmDivider: {
        height: 0.5,
        width: '100%',
    },
    coverArtImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    audioPlayerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 16,
        marginTop: 12,
        borderTopWidth: 1,
    },
    progressContainer: {
        flex: 1,
        gap: 6,
    },
    progressTrack: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressTime: {
        fontSize: 11,
        fontWeight: '500',
    },
});