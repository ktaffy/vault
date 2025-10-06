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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '../../context/ToastContext';

export const ResetPasswordScreen = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { token } = useLocalSearchParams<{ token: string }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');

        if (!password.trim() || !confirmPassword.trim()) {
            setError('Please fill in both fields');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({ token, new_password: password });
            showToast('Your password has been reset successfully. Please log in with your new password.', 'success', 4000);
            router.push('/(auth)/login');
        } catch (error: any) {
            showToast('Failed to reset password. The link may have expired.', 'error');
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
                            onPress={() => router.push('welcome')}
                            style={styles.backButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </Pressable>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.titleSection}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>
                                Create new password
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                Enter a new password for your account
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <Input
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (error) setError('');
                                }}
                                isPassword
                                returnKeyType="next"
                                placeholder="New password"
                            />

                            <Input
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    if (error) setError('');
                                }}
                                isPassword
                                returnKeyType="go"
                                onSubmitEditing={handleSubmit}
                                placeholder="Confirm new password"
                            />

                            {error ? (
                                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                    {error}
                                </Text>
                            ) : null}
                        </View>

                        <Button
                            title="Reset Password"
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
        gap: 12,
        marginBottom: 24,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 4,
        paddingHorizontal: 4,
    },
});