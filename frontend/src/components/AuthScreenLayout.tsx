import React, { ReactNode } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useRouter } from 'expo-router';

interface AuthScreenLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    footer?: ReactNode;
}

export const AuthScreenLayout: React.FC<AuthScreenLayoutProps> = ({
    children,
    title,
    subtitle,
    showBackButton = true,
    footer,
}) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const router = useRouter();

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
                    {showBackButton && (
                        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                            <Pressable
                                onPress={() => router.back()}
                                style={styles.backButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                            </Pressable>
                        </View>
                    )}

                    <View style={styles.content}>
                        <View style={styles.titleSection}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                    {subtitle}
                                </Text>
                            )}
                        </View>

                        {children}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {footer && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                    {footer}
                </View>
            )}
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
    subtitle: {
        fontSize: 15,
        lineHeight: 21,
        marginTop: 12,
    },
    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
        paddingHorizontal: 20,
    },
});