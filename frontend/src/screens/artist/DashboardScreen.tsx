import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useRouter } from 'expo-router';

export const DashboardScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const snippets: any[] = [];

    const onRefresh = async () => {
        setRefreshing(true);
        setRefreshing(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: theme.colors.background }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="play-circle"
                        label="Total Plays"
                        value="0"
                        theme={theme}
                    />
                    <StatCard
                        icon="flame"
                        label="Total Fires"
                        value="0"
                        theme={theme}
                    />
                    <StatCard
                        icon="people"
                        label="Followers"
                        value="0"
                        theme={theme}
                    />
                    <StatCard
                        icon="trending-up"
                        label="Fire Rate"
                        value="0%"
                        theme={theme}
                    />
                </View>

                <View style={styles.snippetsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Snippets</Text>
                        <Pressable onPress={() => router.push('/(tabs)/artist/upload')}>
                            <Ionicons name="add-circle-outline" size={28} color={theme.colors.primary} />
                        </Pressable>
                    </View>

                    {snippets.length === 0 ? (
                        <View style={[styles.emptyState, {
                            backgroundColor: theme.isDark ? '#1a1a1a' : '#f7fafc',
                            borderColor: theme.isDark ? '#2a2a2a' : '#e5e5e5',
                        }]}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: theme.isDark ? '#2a2a2a' : '#ffffff' }]}>
                                <Ionicons name="musical-notes" size={48} color={theme.colors.primary} />
                            </View>
                            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                                No snippets yet
                            </Text>
                            <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                                Upload your first 15-second snippet to start getting discovered
                            </Text>
                            <Pressable
                                style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
                                onPress={() => router.push('/(tabs)/artist/upload')}
                            >
                                <Ionicons name="add" size={20} color="#FFFFFF" style={styles.uploadButtonIcon} />
                                <Text style={styles.uploadButtonText}>Upload Snippet</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.snippetsList}>
                            {snippets.map((snippet, index) => (
                                <SnippetCard key={index} snippet={snippet} theme={theme} router={router} />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const StatCard = ({ icon, label, value, theme }: any) => (
    <View style={[styles.statCard, {
        backgroundColor: theme.isDark ? '#1a1a1a' : '#ffffff',
        borderColor: theme.isDark ? '#2a2a2a' : '#e5e5e5',
    }]}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
);

const SnippetCard = ({ snippet, theme, router }: any) => (
    <Pressable
        style={[styles.snippetCard, {
            backgroundColor: theme.isDark ? '#1a1a1a' : '#ffffff',
            borderColor: theme.isDark ? '#2a2a2a' : '#e5e5e5',
        }]}
        onPress={() => router.push(`/(tabs)/artist/stats/${snippet.id}`)}
    >
        <View style={styles.snippetInfo}>
            <View style={[styles.waveformPlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="bar-chart" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.snippetDetails}>
                <Text style={[styles.snippetTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {snippet.title}
                </Text>
                <Text style={[styles.snippetDate, { color: theme.colors.textSecondary }]}>
                    {snippet.date}
                </Text>
            </View>
        </View>
        <View style={styles.snippetStats}>
            <View style={styles.snippetStat}>
                <Ionicons name="play-circle" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.snippetStatText, { color: theme.colors.textSecondary }]}>
                    {snippet.plays}
                </Text>
            </View>
            <View style={styles.snippetStat}>
                <Ionicons name="flame" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.snippetStatText, { color: theme.colors.textSecondary }]}>
                    {snippet.fires}
                </Text>
            </View>
            <Text style={[styles.snippetFireRate, { color: theme.colors.primary }]}>
                {snippet.fireRate}%
            </Text>
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
    content: {
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        padding: 20,
        borderRadius: 16,
        alignItems: 'flex-start',
        gap: 8,
        borderWidth: 1,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    snippetsSection: {
        paddingHorizontal: 24,
        paddingBottom: 40,
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
    emptyStateSubtext: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 22,
        maxWidth: 280,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    uploadButtonIcon: {
        marginRight: -4,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    snippetsList: {
        gap: 12,
    },
    snippetCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    snippetInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    waveformPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    snippetDetails: {
        flex: 1,
    },
    snippetTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    snippetDate: {
        fontSize: 13,
        fontWeight: '500',
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
        fontWeight: '600',
    },
    snippetFireRate: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 'auto',
    },
});