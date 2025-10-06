import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Button, Input } from '../../components/common';
import { authService } from '../../services/api/auth';
import { useRouter } from 'expo-router';
import { useToast } from '../../context/ToastContext';

export const ForgotPasswordScreen = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            showToast('Please enter your email address', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword({ email: email.trim() });
            showToast('If an account exists with that email, you will receive a password reset link.', 'success', 4000);
            router.back();
        } catch (error: any) {
            showToast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.backButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </Pressable>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.titleSection}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>
                                Reset password
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                Enter your email and we'll send you a link to reset your password
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <Input
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                returnKeyType="send"
                                onSubmitEditing={handleSubmit}
                                placeholder="Email"
                            />
                        </View>

                        <Button
                            title="Send Reset Link"
                            onPress={handleSubmit}
                            variant="primary"
                            size="large"
                            fullWidth
                            loading={loading}
                            disabled={loading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <Pressable
                    onPress={() => router.push('/(auth)/login')}
                    style={styles.loginButton}
                >
                    <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                        Remember your password?{' '}
                        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                            Log in
                        </Text>
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    titleSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 21,
    },
    form: {
        marginBottom: 24,
    },
    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
        paddingHorizontal: 20,
    },
    loginButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 13,
        fontWeight: '400',
    },
});