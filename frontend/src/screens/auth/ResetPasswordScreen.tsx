import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button, Input } from '../../components/common';
import { authService } from '../../services/api/auth';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '../../context/ToastContext';
import { AuthScreenLayout } from '../../components/AuthScreenLayout';
import { validatePassword, validatePasswordMatch, validateFields } from '../../utils/validation';

export const ResetPasswordScreen = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const { theme } = useTheme();
    const { token } = useLocalSearchParams<{ token: string }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');

        const validation = validateFields({
            password: validatePassword(password),
            confirmPassword: validatePasswordMatch(password, confirmPassword),
        });

        if (!validation.valid) {
            const firstError = Object.values(validation.errors)[0];
            setError(firstError);
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
        <AuthScreenLayout
            title="Create new password"
            subtitle="Your new password must be different from previously used passwords"
        >
            <View style={styles.form}>
                <Input
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (error) setError('');
                    }}
                    isPassword
                    returnKeyType="next"
                    placeholder="New Password"
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
                    placeholder="Confirm Password"
                />

                {error && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                        {error}
                    </Text>
                )}
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
        </AuthScreenLayout>
    );
};

const styles = StyleSheet.create({
    form: {
        marginBottom: 24,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 8,
    },
});