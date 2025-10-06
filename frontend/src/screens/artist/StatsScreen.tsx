import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { RouteProp } from '@react-navigation/native';
import { ArtistStackParamList } from '../../navigation/types';

type StatsScreenRouteProp = RouteProp<ArtistStackParamList, 'SnippetStats'>;

type Props = {
    route: StatsScreenRouteProp;
};

export const StatsScreen = ({ route }: Props) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { snippetId } = route.params;

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