import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useScreenSetup } from '../../hooks/useScreenSetup';
import { Button } from '../../components/common';

export const FeedScreen = () => {
    const { user, logout } = useAuth();
    const { theme, insets } = useScreenSetup();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Welcome to Feed! 🎵
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Logged in as: {user?.username}
                </Text>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Logout"
                        onPress={logout}
                        variant="outline"
                        size="medium"
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
    },
});