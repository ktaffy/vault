import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common';
import { useScreenSetup } from '../../hooks/useScreenSetup';

export const EmailVerificationScreen = () => {
    const { theme, router, insets} = useScreenSetup();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.content, { paddingTop: insets.top + 60 }]}>

                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.isDark ? '#1a1a1a' : '#f7fafc' }]}>
                        <Ionicons name="mail-outline" size={64} color={theme.colors.primary} />
                    </View>
                </View>

                <View style={styles.textSection}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Check your email
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        We sent a verification link to your email address. Click the link to verify your account.
                    </Text>
                </View>

                <View style={styles.instructions}>
                    <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
                        Didn't receive the email? Check your spam folder or request a new link.
                    </Text>
                </View>

            </View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                <Button
                    title="Back to Welcome"
                    onPress={() => router.push('/(auth)/welcome')}
                    variant="primary"
                    size="large"
                    fullWidth
                />
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
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 40,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
    },
    instructions: {
        paddingHorizontal: 16,
    },
    instructionText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    footer: {
        paddingHorizontal: 24,
    },
});