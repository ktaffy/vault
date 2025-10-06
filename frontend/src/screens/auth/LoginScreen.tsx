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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { login, loading } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!identifier.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please enter both email/username and password');
            return;
        }

        try {
            await login(identifier.trim(), password);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Please check your credentials');
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
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </Pressable>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.titleSection}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>
                                Welcome back
                            </Text>
                        </View>

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
                                onPress={() => navigation.navigate('ForgotPassword')}
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
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <Pressable
                    onPress={() => navigation.navigate('Signup')}
                    style={styles.signupButton}
                >
                    <Text style={[styles.signupText, { color: theme.colors.textSecondary }]}>
                        Don't have an account?{' '}
                        <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                            Sign up
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
    forgotPassword: {
        alignSelf: 'flex-end',
        paddingVertical: 4,
    },
    forgotPasswordText: {
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
        paddingHorizontal: 20,
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