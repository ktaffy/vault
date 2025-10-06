import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components/common';
import { useRouter } from 'expo-router';

export const SignupScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
            Alert.alert('Signup Failed', error.message || 'Please try again');
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
                                Create account
                            </Text>
                        </View>

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
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
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
    },
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