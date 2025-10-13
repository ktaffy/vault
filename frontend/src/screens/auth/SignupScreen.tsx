// frontend/src/screens/auth/SignupScreen.tsx (REFACTORED)
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components/common';
import { useRouter } from 'expo-router';
import { useToast } from '../../context/ToastContext';
import { AuthScreenLayout } from '../../components/AuthScreenLayout';

export const SignupScreen = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const { theme } = useTheme();
    const { signup, loading } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (username.trim().length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            newErrors.email = 'Please enter a valid email';
        }

        if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            await signup(username.trim(), email.trim(), password);
            router.push('/(auth)/email-verification');
        } catch (error: any) {
            showToast('Signup Failed, please try again', 'error');
        }
    };

    const footer = (
        <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
        >
            <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                Already have an account?{' '}
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                    Log in
                </Text>
            </Text>
        </Pressable>
    );

    return (
        <AuthScreenLayout title="Create account" footer={footer}>
            <View style={styles.form}>
                <Input
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        if (errors.username) {
                            setErrors({ ...errors, username: '' });
                        }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    placeholder="Username"
                    error={errors.username}
                />

                <Input
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) {
                            setErrors({ ...errors, email: '' });
                        }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    placeholder="Email"
                    error={errors.email}
                />

                <Input
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) {
                            setErrors({ ...errors, password: '' });
                        }
                    }}
                    isPassword
                    returnKeyType="go"
                    onSubmitEditing={handleSignup}
                    placeholder="Password"
                    error={errors.password}
                />

                <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                    By signing up, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>

            <Button
                title="Sign Up"
                onPress={handleSignup}
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
    termsText: {
        fontSize: 12,
        lineHeight: 16,
        textAlign: 'center',
        marginTop: 8,
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