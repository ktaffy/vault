import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useLocalSearchParams } from 'expo-router';

export const StatsScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { id } = useLocalSearchParams();
    const snippetId = Number(id);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Snippet Stats</Text>
            </View>
            <View style={styles.content}>
                <Text style={{ color: theme.colors.text }}>Stats for snippet #{snippetId}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});