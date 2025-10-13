// frontend/src/screens/auth/LoginScreen.tsx (REFACTORED)
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components/common';
import { useRouter } from 'expo-router';
import { useToast } from '../../context/ToastContext';
import { AuthScreenLayout } from '../../components/AuthScreenLayout';

export const LoginScreen = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const { theme } = useTheme();
    const { login, loading } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!identifier.trim() || !password.trim()) {
            showToast('Please enter both email/username and password', 'error');
            return;
        }

        try {
            await login(identifier.trim(), password);
        } catch (error: any) {
            showToast(error.message || 'Please check your credentials', 'error');
        }
    };

    const footer = (
        <Pressable
            onPress={() => router.push('/(auth)/signup')}
            style={styles.signupButton}
        >
            <Text style={[styles.signupText, { color: theme.colors.textSecondary }]}>
                Don't have an account?{' '}
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                    Sign up
                </Text>
            </Text>
        </Pressable>
    );

    return (
        <AuthScreenLayout title="Welcome back" footer={footer}>
            <View style={styles.form}>
                <Input
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    placeholder="Email or username"
                />

                <Input
                    value={password}
                    onChangeText={setPassword}
                    isPassword
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                    placeholder="Password"
                />

                <Pressable
                    onPress={() => router.push('/(auth)/forgot-password')}
                    style={styles.forgotPassword}
                >
                    <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                        Forgot password?
                    </Text>
                </Pressable>
            </View>

            <Button
                title="Log In"
                onPress={handleLogin}
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                disabled={loading}
            />
        </AuthScreenLayout>
    );
};

const styles = StyleSheet.create({
    form: {
        gap: 12,
        marginBottom: 24,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        paddingVertical: 4,
    },
    forgotPasswordText: {
        fontSize: 13,
        fontWeight: '600',
    },
    signupButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    signupText: {
        fontSize: 13,
        fontWeight: '400',
    },
});