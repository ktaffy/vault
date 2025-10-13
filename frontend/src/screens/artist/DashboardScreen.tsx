import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenSetup } from '../../hooks/useScreenSetup';
import { snippetService, Snippet } from '../../services/api/snippets';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useFocusEffect } from '@react-navigation/native';

setAudioModeAsync({
    playsInSilentMode: true,
}).catch(console.error);

const audioCache = new Map<string, any>();

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

export const DashboardScreen = () => {
    const { insets, theme, router } = useScreenSetup();
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [playingSnippetId, setPlayingSnippetId] = useState<number | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<any>(null);
    const [audioProgress, setAudioProgress] = useState(0);

    const fetchSnippets = async () => {
        try {
            const response = await snippetService.getAllArtistSnippets();
            setSnippets(response.snippets || []);
        } catch (error) {
            console.error('Failed to fetch snippets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPause = (snippet: Snippet, e: any) => {
        e.stopPropagation();

        if (playingSnippetId === snippet.id) {
            setPlayingSnippetId(null);
            setCurrentPlayer(null);
            setAudioProgress(0);
        } else {
            if (currentPlayer) {
                setPlayingSnippetId(null);
                setCurrentPlayer(null);
                setAudioProgress(0);
            }
            setTimeout(() => {
                setPlayingSnippetId(snippet.id);
                setCurrentPlayer(snippet);
                setAudioProgress(0);
            }, 50);
        }
    };

    useEffect(() => {
        fetchSnippets();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSnippets();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSnippets();
        setRefreshing(false);
    };

    const totalPlays = snippets.reduce((sum, s) => sum + s.play_count, 0);
    const totalFires = snippets.reduce((sum, s) => sum + s.fire_count, 0);
    const totalSkips = snippets.reduce((sum, s) => sum + s.skip_count, 0);
    const overallFireRate = totalPlays > 0 ? ((totalFires / totalPlays) * 100).toFixed(0) : '0';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: theme.colors.background }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
            </View>

            {currentPlayer && (
                <AudioPlayerComponent
                    snippet={currentPlayer}
                    onEnd={() => {
                        setPlayingSnippetId(null);
                        setAudioProgress(0);
                    }}
                    onProgress={setAudioProgress}
                />
            )}

            {/* Preload all snippet audio in background */}
            {snippets.map(snippet => (
                <PreloadAudio key={snippet.id} audioUrl={snippet.audio_url} />
            ))}

            <View style={styles.statsGrid}>
                <StatCard icon="play-circle" label="Total Plays" value={totalPlays.toString()} theme={theme} />
                <StatCard icon="flame" label="Total Fires" value={totalFires.toString()} theme={theme} />
                <StatCard icon="close-circle" label="Total Skips" value={totalSkips.toString()} theme={theme} />
                <StatCard icon="trending-up" label="Fire Rate" value={`${overallFireRate}%`} theme={theme} />
            </View>

            <View style={styles.snippetsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Your Snippets ({snippets.length})
                    </Text>
                    <Pressable onPress={() => router.push('/(tabs)/artist/upload')}>
                        <Ionicons name="add-circle-outline" size={28} color={theme.colors.primary} />
                    </Pressable>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : snippets.length === 0 ? (
                    <View style={[styles.emptyState, {
                        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderColor: theme.colors.border
                    }]}>
                        <View style={[styles.emptyIconCircle, {
                            backgroundColor: theme.isDark ? 'rgba(148,120,233,0.1)' : 'rgba(148,120,233,0.1)'
                        }]}>
                            <Ionicons name="musical-notes" size={40} color={theme.colors.primary} />
                        </View>
                        <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                            No snippets yet
                        </Text>
                        <Text style={[styles.emptyStateDescription, { color: theme.colors.textSecondary }]}>
                            Upload your first snippet to start sharing your music
                        </Text>
                        <Pressable
                            onPress={() => router.push('/(tabs)/artist/upload')}
                            style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
                        >
                            <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
                            <Text style={styles.uploadButtonText}>Upload Snippet</Text>
                        </Pressable>
                    </View>
                ) : (
                    <FlatList
                        data={snippets}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <SnippetCard
                                snippet={item}
                                theme={theme}
                                onPress={() => router.push(`/(tabs)/artist/stats/${item.id}`)}
                                isPlaying={playingSnippetId === item.id}
                                onPlayPause={(e) => handlePlayPause(item, e)}
                                progress={playingSnippetId === item.id ? audioProgress : 0}
                            />
                        )}
                        contentContainerStyle={styles.snippetsList}
                        showsVerticalScrollIndicator={false}
                        onRefresh={onRefresh}
                        refreshing={refreshing}
                    />
                )}
            </View>
        </View>
    );
};

const StatCard: React.FC<{ icon: any; label: string; value: string; theme: any }> = ({
    icon, label, value, theme,
}) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
);

const SnippetCard: React.FC<{
    snippet: Snippet;
    theme: any;
    onPress: () => void;
    isPlaying: boolean;
    onPlayPause: (e: any) => void;
    progress: number;
}> = ({
    snippet, theme, onPress, isPlaying, onPlayPause, progress,
}) => (
        <Pressable
            onPress={onPress}
            style={[styles.snippetCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
            <View style={styles.snippetHeader}>
                <View style={styles.coverArtContainer}>
                    {snippet.cover_art_url ? (
                        <Image source={{ uri: snippet.cover_art_url }} style={styles.snippetCoverArt} />
                    ) : (
                        <View style={[styles.snippetCoverArtPlaceholder, {
                            backgroundColor: theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                        }]}>
                            <Ionicons name="musical-note" size={20} color={theme.colors.primary} />
                        </View>
                    )}
                </View>
                <View style={styles.snippetInfo}>
                    <Text style={[styles.snippetTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {snippet.title}
                    </Text>
                    <Text style={[styles.snippetDate, { color: theme.colors.textSecondary }]}>
                        {new Date(snippet.uploaded_at).toLocaleDateString()}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>

            <View style={styles.snippetStats}>
                <View style={styles.snippetStat}>
                    <Ionicons name="play-circle-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.snippetStatText, { color: theme.colors.textSecondary }]}>
                        {snippet.play_count}
                    </Text>
                </View>
                <View style={styles.snippetStat}>
                    <Ionicons name="flame-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.snippetStatText, { color: theme.colors.textSecondary }]}>
                        {snippet.fire_count}
                    </Text>
                </View>
                <View style={styles.snippetStat}>
                    <Ionicons name="close-circle-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.snippetStatText, { color: theme.colors.textSecondary }]}>
                        {snippet.skip_count}
                    </Text>
                </View>
                <View style={[styles.fireRateBadge, {
                    backgroundColor: snippet.fire_rate > 0.5 ? 'rgba(148,120,233,0.15)' : 'rgba(150,150,150,0.1)'
                }]}>
                    <Ionicons
                        name="flame"
                        size={14}
                        color={snippet.fire_rate > 0.5 ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text style={[styles.fireRateText, {
                        color: snippet.fire_rate > 0.5 ? theme.colors.primary : theme.colors.textSecondary
                    }]}>
                        {(snippet.fire_rate * 100).toFixed(0)}%
                    </Text>
                </View>
            </View>

            <View style={[styles.audioPlayerBar, { borderTopColor: theme.colors.border }]}>
                <Pressable onPress={onPlayPause} hitSlop={10}>
                    <Ionicons
                        name={isPlaying ? "pause-circle" : "play-circle"}
                        size={28}
                        color={theme.colors.primary}
                    />
                </Pressable>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
                        <View
                            style={[styles.progressFill, {
                                width: `${progress * 100}%`,
                                backgroundColor: theme.colors.primary
                            }]}
                        />
                    </View>
                    <Text style={[styles.progressTime, { color: theme.colors.textSecondary }]}>
                        {formatTime(progress * 15)} / 0:15
                    </Text>
                </View>
            </View>
        </Pressable>
    );

const AudioPlayerComponent: React.FC<{
    snippet: Snippet;
    onEnd: () => void;
    onProgress: (progress: number) => void;
}> = ({ snippet, onEnd, onProgress }) => {
    const cachedPlayer = audioCache.get(snippet.audio_url);
    const newPlayer = useAudioPlayer(snippet.audio_url);
    const player = cachedPlayer || newPlayer;
    const status = useAudioPlayerStatus(player);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (cachedPlayer) {
            try {
                cachedPlayer.seekTo(0);
                cachedPlayer.play();
                setHasStarted(true);
            } catch (error) {
                console.error('Cached player error:', error);
            }
        } else if (status.isLoaded) {
            try {
                player.play();
                setHasStarted(true);
            } catch (error) {
                console.error('Player play error:', error);
            }
        }

        return () => {
            try {
                if (player && status.isLoaded) {
                    player.pause();
                }
            } catch (error) {
                // Ignore cleanup errors
            }
        };
    }, [snippet.audio_url]);

    useEffect(() => {
        if (status.isLoaded && status.duration > 0) {
            const progress = status.currentTime / status.duration;
            onProgress(progress);
        }
    }, [status.currentTime, status.duration]);

    useEffect(() => {
        if (hasStarted && status.isLoaded && !status.playing && status.currentTime > 0) {
            onEnd();
        }
    }, [status.playing, status.isLoaded, hasStarted]);

    return null;
    };
const formatTime = (seconds: number) => {
    const secs = Math.floor(seconds);
    return `0:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
    statCard: { width: '48%', padding: 14, borderRadius: 14, alignItems: 'flex-start', gap: 6, borderWidth: 1 },
    statValue: { fontSize: 24, fontWeight: '700', marginTop: 2 },
    statLabel: { fontSize: 12, fontWeight: '500' },
    snippetsSection: { flex: 1, paddingHorizontal: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '600' },
    loadingContainer: { padding: 40, alignItems: 'center' },
    emptyState: { padding: 32, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
    emptyIconCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyStateTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
    emptyStateDescription: { fontSize: 14, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
    uploadButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    uploadButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    snippetsList: { gap: 12, paddingBottom: 20 },
    snippetCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
    snippetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    snippetInfo: { flex: 1, gap: 4 },
    snippetTitle: { fontSize: 16, fontWeight: '600' },
    snippetDate: { fontSize: 12 },
    snippetStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    snippetStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    snippetStatText: { fontSize: 14, fontWeight: '500' },
    fireRateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 'auto' },
    fireRateText: { fontSize: 13, fontWeight: '600' },
    snippetCoverArt: { width: '100%', height: '100%', borderRadius: 8 },
    snippetCoverArtPlaceholder: { width: '100%', height: '100%', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    coverArtContainer: { width: 56, height: 56 },
    audioPlayerBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, borderTopWidth: 1, marginTop: 4 },
    progressContainer: { flex: 1, gap: 6 },
    progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2, },
    progressTime: { fontSize: 11, fontWeight: '500' },
});