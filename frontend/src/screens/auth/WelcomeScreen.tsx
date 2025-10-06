import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common';
import { useRouter } from 'expo-router';

export const WelcomeScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.content, { paddingTop: insets.top + 60 }]}>

                <View style={styles.logoSection}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.featuresSection}>
                    <FeatureItem
                        icon="flame"
                        text="Swipe to discover hidden gems"
                        theme={theme}
                    />
                    <FeatureItem
                        icon="headset"
                        text="15-second artist snippets"
                        theme={theme}
                    />
                    <FeatureItem
                        icon="star"
                        text="Support artists before they blow up"
                        theme={theme}
                    />
                </View>
            </View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                <Button
                    title="Get Started"
                    onPress={() => router.push('/(auth)/signup')}
                    variant="primary"
                    size="large"
                    fullWidth
                />

                <Pressable
                    onPress={() => router.push('/(auth)/login')}
                    style={styles.loginLink}
                >
                    <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                        Already have an account?{' '}
                        <Text style={[styles.loginTextBold, { color: theme.colors.primary }]}>
                            Log in
                        </Text>
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

const FeatureItem: React.FC<{ icon: any; text: string; theme: any }> = ({ icon, text, theme }) => (
    <View style={styles.featureItem}>
        <View style={[styles.featureIconWrapper, { backgroundColor: theme.isDark ? '#1a1a1a' : '#f7fafc' }]}>
            <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <Text style={[styles.featureText, { color: theme.colors.text }]}>
            {text}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 80,
    },
    logo: {
        width: 180,
        height: 180,
    },
    featuresSection: {
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    featureIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    footer: {
        paddingHorizontal: 24,
        gap: 16,
    },
    loginLink: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    loginText: {
        fontSize: 15,
        fontWeight: '400',
    },
    loginTextBold: {
        fontWeight: '600',
    },
});