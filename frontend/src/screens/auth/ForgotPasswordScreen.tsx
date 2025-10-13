import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Button, Input } from '../../components/common';
import { authService } from '../../services/api/auth';
import { AuthScreenLayout } from '../../components/AuthScreenLayout';
import { validateEmail } from '../../utils/validation';
import { useScreenSetup } from '../../hooks/useScreenSetup';

export const ForgotPasswordScreen = () => {
    const { theme, router, showToast } = useScreenSetup();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const emailValidation = validateEmail(email);

        if (!emailValidation.valid) {
            showToast(emailValidation.error || 'Invalid email', 'error');
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

    const footer = (
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
    );

    return (
        <AuthScreenLayout
            title="Reset password"
            subtitle="Enter your email and we'll send you a link to reset your password"
            footer={footer}
        >
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
        </AuthScreenLayout>
    );
};

const styles = StyleSheet.create({
    form: {
        marginBottom: 24,
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