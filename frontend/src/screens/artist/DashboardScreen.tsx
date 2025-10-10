import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { snippetService, Snippet } from '../../services/api/snippets';

export const DashboardScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const router = useRouter();
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    useEffect(() => {
        fetchSnippets();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSnippets();
        setRefreshing(false);
    };

    // Calculate totals from all snippets
    const totalPlays = snippets.reduce((sum, s) => sum + s.play_count, 0);
    const totalFires = snippets.reduce((sum, s) => sum + s.fire_count, 0);
    const totalSkips = snippets.reduce((sum, s) => sum + s.skip_count, 0);
    const overallFireRate = totalPlays > 0 ? ((totalFires / totalPlays) * 100).toFixed(0) : '0';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Fixed Header */}
            <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: theme.colors.background }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
            </View>

            {/* Fixed Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    icon="play-circle"
                    label="Total Plays"
                    value={totalPlays.toString()}
                    theme={theme}
                />
                <StatCard
                    icon="flame"
                    label="Total Fires"
                    value={totalFires.toString()}
                    theme={theme}
                />
                <StatCard
                    icon="close-circle"
                    label="Total Skips"
                    value={totalSkips.toString()}
                    theme={theme}
                />
                <StatCard
                    icon="trending-up"
                    label="Fire Rate"
                    value={`${overallFireRate}%`}
                    theme={theme}
                />
            </View>

            {/* Scrollable Snippets Section */}
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
    icon,
    label,
    value,
    theme,
}) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
);

const SnippetCard: React.FC<{ snippet: Snippet; theme: any; onPress: () => void }> = ({
    snippet,
    theme,
    onPress,
}) => (
    <Pressable
        onPress={onPress}
        style={[styles.snippetCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
        <View style={styles.snippetHeader}>
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
    </Pressable>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 16,
    },
    statCard: {
        width: '48%',
        padding: 14,
        borderRadius: 14,
        alignItems: 'flex-start',
        gap: 6,
        borderWidth: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    snippetsSection: {
        flex: 1,
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyState: {
        padding: 48,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
    },
    emptyIconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyStateDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    uploadButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    snippetsList: {
        gap: 12,
        paddingBottom: 20,
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
        justifyContent: 'space-between',
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
});