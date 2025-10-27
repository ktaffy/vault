import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Image,
    Linking,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { authService, type PublicArtistProfile } from '../../services/api/auth';
import { snippetService, type Snippet } from '../../services/api/snippets';
import { useRouter } from 'expo-router';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { formatTime } from '../../utils/audioHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ArtistProfileScreenProps {
    artistId: number;
}

export const ArtistProfileScreen: React.FC<ArtistProfileScreenProps> = ({ artistId }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const router = useRouter();

    const [profile, setProfile] = useState<PublicArtistProfile | null>(null);
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [playingSnippetId, setPlayingSnippetId] = useState<number | null>(null);

    useEffect(() => {
        fetchArtistData();
    }, [artistId]);

    const fetchArtistData = async () => {
        setLoading(true);
        setError('');

        try {
            const [profileData, snippetsData] = await Promise.all([
                authService.getPublicArtist(artistId),
                snippetService.getPublicArtistSnippets(artistId),
            ]);

            setProfile(profileData);
            setSnippets(snippetsData.snippets || []);
        } catch (err) {
            console.error('Failed to fetch artist data:', err);
            setError('Failed to load artist profile');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenLink = async (url: string | null | undefined, platform: string) => {
        if (!url) return;

        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = `https://${url}`;
        }

        try {
            const canOpen = await Linking.canOpenURL(fullUrl);
            if (canOpen) {
                await Linking.openURL(fullUrl);
            }
        } catch (error) {
            console.error(`Failed to open ${platform}:`, error);
        }
    };

    const handlePlaySnippet = (snippetId: number) => {
        if (playingSnippetId === snippetId) {
            setPlayingSnippetId(null);
        } else {
            setPlayingSnippetId(snippetId);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
                    {error || 'Artist not found'}
                </Text>
                <Pressable
                    style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.retryButtonText}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const hasSocialLinks = profile.spotify_url || profile.soundcloud_url || profile.linktree_url;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header with Back Button */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Pressable
                    style={[styles.backButton, {
                        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
            >
                {/* Artist Header */}
                <View style={styles.artistHeader}>
                    <View style={[styles.avatarContainer, {
                        backgroundColor: theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                    }]}>
                        {profile.profile_pic ? (
                            <Image
                                source={{ uri: profile.profile_pic }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                                {profile.username.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>

                    <Text style={[styles.username, { color: theme.colors.text }]}>
                        {profile.username}
                    </Text>

                    {profile.is_artist && (
                        <View style={[styles.artistBadge, {
                            backgroundColor: theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                        }]}>
                            <Ionicons name="musical-note" size={14} color={theme.colors.primary} />
                            <Text style={[styles.artistBadgeText, { color: theme.colors.primary }]}>
                                Artist
                            </Text>
                        </View>
                    )}

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {profile.total_followers}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Followers
                            </Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {profile.snippet_count}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                Snippets
                            </Text>
                        </View>
                    </View>

                    {/* Social Links */}
                    {hasSocialLinks && (
                        <View style={styles.socialLinks}>
                            {profile.spotify_url && (
                                <Pressable
                                    style={styles.socialButton}
                                    onPress={() => handleOpenLink(profile.spotify_url, 'Spotify')}
                                >
                                    <Image
                                        source={require('../../assets/logos/spotify.png')}
                                        style={styles.socialLogo}
                                    />
                                </Pressable>
                            )}

                            {profile.soundcloud_url && (
                                <Pressable
                                    style={styles.socialButton}
                                    onPress={() => handleOpenLink(profile.soundcloud_url, 'SoundCloud')}
                                >
                                    <Image
                                        source={require('../../assets/logos/soundcloud.png')}
                                        style={styles.socialLogo}
                                    />
                                </Pressable>
                            )}

                            {profile.linktree_url && (
                                <Pressable
                                    style={styles.socialButton}
                                    onPress={() => handleOpenLink(profile.linktree_url, 'Linktree')}
                                >
                                    <Image
                                        source={require('../../assets/logos/linktree.png')}
                                        style={styles.socialLogo}
                                    />
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                {/* Snippets Section */}
                <View style={styles.snippetsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Snippets
                    </Text>

                    {snippets.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="musical-notes-outline" size={48} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                No snippets yet
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.snippetsList}>
                            {snippets.map((snippet) => (
                                <SnippetCard
                                    key={snippet.id}
                                    snippet={snippet}
                                    isPlaying={playingSnippetId === snippet.id}
                                    onPlay={() => handlePlaySnippet(snippet.id)}
                                    theme={theme}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const SnippetCard: React.FC<{
    snippet: Snippet;
    isPlaying: boolean;
    onPlay: () => void;
    theme: any;
}> = ({ snippet, isPlaying, onPlay, theme }) => {
    const [progress, setProgress] = useState(0);

    const { play, pause, isLoaded } = useAudioPlayback(snippet.audio_url, {
        autoPlay: false,
        onEnd: () => onPlay(),
        onProgress: (prog) => {
            setProgress(prog);
        },
    });

    useEffect(() => {
        if (isPlaying && isLoaded) {
            play();
        } else {
            pause();
        }
    }, [isPlaying, isLoaded]);

    return (
        <View style={[styles.snippetCard, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
        }]}>
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
                <Pressable onPress={onPlay} hitSlop={10}>
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
                        {formatTime(progress * snippet.duration_seconds)} / {formatTime(snippet.duration_seconds)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    artistHeader: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
    },
    username: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    artistBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 20,
    },
    artistBadgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 32,
    },
    socialLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 4,
    },
    socialButton: {
        borderRadius: 9,
        borderWidth: 1,
        borderColor: 'rgba(151, 145, 145, 0.3)',
        borderStyle: 'solid',
        padding: 8,
    },
    socialLogo: {
        width: 24,
        height: 24,
    },
    socialText: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    snippetsSection: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 12,
    },
    snippetsList: {
        gap: 12,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    snippetCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    snippetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    snippetInfo: {
        flex: 1,
        gap: 4,
    },
    snippetTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    snippetDate: {
        fontSize: 12,
    },
    snippetStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    snippetStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    snippetStatText: {
        fontSize: 14,
        fontWeight: '500',
    },
    fireRateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 'auto',
    },
    fireRateText: {
        fontSize: 13,
        fontWeight: '600',
    },
    snippetCoverArt: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    snippetCoverArtPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverArtContainer: {
        width: 56,
        height: 56,
    },
    audioPlayerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        marginTop: 4,
    },
    playButtonSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
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
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressTime: {
        fontSize: 11,
        fontWeight: '500',
    },
});