import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { snippetService, Snippet } from '../../services/api/snippets';

export const StatsScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const snippetId = Number(id);

    const [snippet, setSnippet] = useState<Snippet | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSnippet();
    }, [snippetId]);

    const fetchSnippet = async () => {
        try {
            const data = await snippetService.getById(snippetId);
            setSnippet(data);
        } catch (error) {
            console.error('Failed to fetch snippet:', error);
        } finally {
            setLoading(false);
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
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Snippet Info Card */}
                <View style={[styles.infoCard, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                }]}>
                    <View style={styles.infoHeader}>
                        <View style={[styles.iconCircle, {
                            backgroundColor: theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                        }]}>
                            <Ionicons name="musical-note" size={24} color={theme.colors.primary} />
                        </View>
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
});